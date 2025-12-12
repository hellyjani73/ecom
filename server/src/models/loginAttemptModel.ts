import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginAttempt extends Document {
  email: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

const loginAttemptSchema: Schema<ILoginAttempt> = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    attempts: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: Date.now },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for faster queries
loginAttemptSchema.index({ email: 1 });
loginAttemptSchema.index({ lockedUntil: 1 });

const LoginAttempt = mongoose.model<ILoginAttempt>('LoginAttempt', loginAttemptSchema);

export default LoginAttempt;

