import mongoose, { Schema, Document } from 'mongoose';
import { ComparisonResponse } from '@/components/compare/types';

export interface IComparisonReport {
  reportId: string;
  userId: string;
  report: ComparisonResponse;
  createdAt: Date;
  docNames: string[];
}

export interface IComparisonReportDocument extends IComparisonReport, Document {}

// Type for lean() queries - this is what Mongoose returns without Document methods
export type ComparisonReportLean = {
  _id: mongoose.Types.ObjectId;
  reportId: string;
  userId: string;
  report: ComparisonResponse;
  createdAt: Date;
  docNames: string[];
  __v: number;
};

const ComparisonReportSchema: Schema = new Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  report: {
    type: Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  docNames: [{
    type: String,
    required: true
  }]
});

ComparisonReportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.ComparisonReport || mongoose.model<IComparisonReportDocument>('ComparisonReport', ComparisonReportSchema);