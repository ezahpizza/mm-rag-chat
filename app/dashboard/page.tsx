'use client';

import { useEffect, useState } from 'react';
import { exportChatSummaryToPDF } from '@/lib/pdf/chatSummaryExporter';
import { exportComparisonReportToPDF } from '@/lib/pdf/comparisonReportExporter';
import {
  ProfileSection,
  PlaceholderSection,
  ChatSummariesSection,
  ComparisonReportsSection
} from '@/components/dashboard';
import { PixelBlast, CardNav, Loader } from '@/components/global';
import { items } from '@/constants/home-items';

interface ChatSummary {
  chatId: string;
  summary: string;
  createdAt: string;
}

interface ComparisonReport {
  reportId: string;
  docNames: string[];
  summary: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export default function DashboardPage() {
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [comparisonReports, setComparisonReports] = useState<ComparisonReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatRes, compareRes] = await Promise.all([
          fetch('/api/dashboard/chat-summaries'),
          fetch('/api/dashboard/comparison-reports')
        ]);

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          setChatSummaries(chatData.summaries);
        }

        if (compareRes.ok) {
          const compareData = await compareRes.json();
          setComparisonReports(compareData.reports);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadChatSummary = (summary: ChatSummary) => {
    exportChatSummaryToPDF(summary.summary, {
      title: `Chat Summary - ${summary.chatId}`,
      chatId: summary.chatId,
      wordCount: summary.summary.split(' ').length
    });
  };

  const handleDownloadComparisonReport = async (report: ComparisonReport) => {
    try {
      const res = await fetch(`/api/dashboard/comparison-reports/${report.reportId}`);
      if (res.ok) {
        const data = await res.json();
        exportComparisonReportToPDF(data.report, data.docNames);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleDeleteChatSummary = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat summary?')) return;

    try {
      const res = await fetch(`/api/dashboard/chat-summaries/${chatId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setChatSummaries(prev => prev.filter(s => s.chatId !== chatId));
      }
    } catch (error) {
      console.error('Error deleting chat summary:', error);
    }
  };

  const handleDeleteComparisonReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this comparison report?')) return;

    try {
      const res = await fetch('/api/dashboard/comparison-reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });

      if (res.ok) {
        setComparisonReports(prev => prev.filter(r => r.reportId !== reportId));
      }
    } catch (error) {
      console.error('Error deleting comparison report:', error);
    }
  };

  if (loading) {
    return( <Loader /> );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen overflow-hidden bg-obsidian">
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#8b67ff"
          patternScale={3}
          patternDensity={1.6}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>

      <div className="flex-1 scrollbar-hide p-2 sm:p-4 relative z-10 w-full container-responsive">
        <CardNav
          logo="/logo/black-no-text.svg"
          logoAlt="Company Logo"
          items={items}
          menuColor="#000"
          ease="power3.out"
        />

        <div className="max-w-7xl mx-auto mt-20 sm:mt-24 lg:mt-32">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-full">
            {/* Left Column - Profile and Placeholder */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <ProfileSection/>
              <PlaceholderSection />
            </div>

            {/* Right Column - Chat Summaries and Comparison Reports */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <ChatSummariesSection
                chatSummaries={chatSummaries}
                onDownload={handleDownloadChatSummary}
                onDelete={handleDeleteChatSummary}
              />
              <ComparisonReportsSection
                comparisonReports={comparisonReports}
                onDownload={handleDownloadComparisonReport}
                onDelete={handleDeleteComparisonReport}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}