import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Brand
export interface IBrand extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema: Schema<IBrand> = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for faster queries
brandSchema.index({ name: 1 });
brandSchema.index({ isActive: 1 });

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);

