import mongoose from 'mongoose';

export interface ILoginRecord extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  ip: string;
  userAgent: string;
  loggedAt: Date;
}

const loginRecordSchema = new mongoose.Schema<ILoginRecord>({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ip:       { type: String },
  userAgent:{ type: String },
  loggedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ILoginRecord>('LoginRecord', loginRecordSchema);
