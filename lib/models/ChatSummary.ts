import mongoose, { Schema, Document } from 'mongoose';

export interface IChatSummary {
  chatId: string;
  userId: string;
  summary: string;
  createdAt: Date;
}

export interface IChatSummaryDocument extends IChatSummary, Document {}

// Type for lean() queries - this is what Mongoose returns without Document methods
export type ChatSummaryLean = {
  _id: mongoose.Types.ObjectId;
  chatId: string;
  userId: string;
  summary: string;
  createdAt: Date;
  __v: number;
};

const ChatSummarySchema: Schema = new Schema({
  chatId: {
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
  summary: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ChatSummarySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.ChatSummary || mongoose.model<IChatSummaryDocument>('ChatSummary', ChatSummarySchema);