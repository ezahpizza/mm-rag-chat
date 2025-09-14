import mongoose, { Schema, Document } from 'mongoose';

export interface IUser {
  userId: string;
  email: string;
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {}

// Type for lean() queries - this is what Mongoose returns without Document methods
export type UserLean = {
  _id: mongoose.Types.ObjectId;
  userId: string;
  email: string;
  createdAt: Date;
  __v: number;
};

const UserSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);