import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import ChatSummary, { ChatSummaryLean } from '@/lib/models/ChatSummary';
import ComparisonReport, { ComparisonReportLean } from '@/lib/models/ComparisonReport';
import { ComparisonResponse } from '@/components/compare/types';

export interface DatabaseUser {
  userId: string;
  email: string;
  createdAt: Date;
}

export interface SavedChatSummary {
  chatId: string;
  summary: string;
  createdAt: Date;
}

export interface SavedComparisonReport {
  reportId: string;
  docNames: string[];
  summary: string;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

/**
 * Ensures a user exists in the database based on Clerk userId
 */
export async function ensureUserExists(userId: string, email?: string): Promise<DatabaseUser> {
  await connectDB();
  
  const user = await User.findOneAndUpdate(
    { userId },
    { 
      userId,
      ...(email && { email })
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );
  
  return user.toObject();
}

/**
 * Saves a chat summary for a user
 */
export async function saveChatSummary(
  userId: string, 
  chatId: string, 
  summary: string
): Promise<{ success: boolean; chatId: string }> {
  await connectDB();
  await ensureUserExists(userId);
  
  const chatSummary = new ChatSummary({
    chatId,
    userId,
    summary,
  });
  
  await chatSummary.save();
  
  return { success: true, chatId };
}

/**
 * Saves a comparison report for a user
 */
export async function saveComparisonReport(
  userId: string,
  reportId: string,
  report: ComparisonResponse,
  docNames: string[]
): Promise<{ success: boolean; reportId: string }> {
  await connectDB();
  await ensureUserExists(userId);
  
  const comparisonReport = new ComparisonReport({
    reportId,
    userId,
    report,
    docNames,
  });
  
  await comparisonReport.save();
  
  return { success: true, reportId };
}

/**
 * Gets all chat summaries for a user
 */
export async function getUserChatSummaries(userId: string): Promise<SavedChatSummary[]> {
  await connectDB();
  
  const summaries = await ChatSummary.find({ userId })
    .sort({ createdAt: -1 })
    .lean<ChatSummaryLean[]>();
  
  return summaries.map(summary => ({
    chatId: summary.chatId,
    summary: summary.summary,
    createdAt: summary.createdAt,
  }));
}

/**
 * Gets all comparison reports for a user
 */
export async function getUserComparisonReports(userId: string): Promise<SavedComparisonReport[]> {
  await connectDB();
  
  const reports = await ComparisonReport.find({ userId })
    .sort({ createdAt: -1 })
    .lean<ComparisonReportLean[]>();
  
  return reports.map(report => ({
    reportId: report.reportId,
    docNames: report.docNames,
    summary: report.report.summary,
    createdAt: report.createdAt,
    metadata: report.report.metadata,
  }));
}

/**
 * Gets a specific comparison report by ID for a user
 */
export async function getUserComparisonReport(
  userId: string, 
  reportId: string
): Promise<{ reportId: string; docNames: string[]; createdAt: Date; fullReport: ComparisonResponse } | null> {
  await connectDB();
  
  const report = await ComparisonReport.findOne({ 
    reportId, 
    userId 
  }).lean<ComparisonReportLean>();
  
  if (!report) {
    return null;
  }
  
  return {
    reportId: report.reportId,
    docNames: report.docNames,
    createdAt: report.createdAt,
    fullReport: report.report,
  };
}

/**
 * Deletes a chat summary for a user
 */
export async function deleteUserChatSummary(
  userId: string,
  chatId: string
): Promise<{ success: boolean }> {
  await connectDB();

  const result = await ChatSummary.findOneAndDelete({ chatId, userId });

  return { success: !!result };
}

/**
 * Deletes a comparison report for a user
 */
export async function deleteUserComparisonReport(
  userId: string,
  reportId: string
): Promise<{ success: boolean }> {
  await connectDB();

  const result = await ComparisonReport.findOneAndDelete({ reportId, userId });

  return { success: !!result };
}