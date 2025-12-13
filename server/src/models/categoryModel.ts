import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Category
export interface ICategory extends Document {
  name: string;
  image: string;
  parentCategory?: string; // 'men' | 'women' | 'children'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    parentCategory: { 
      type: String, 
      enum: ['men', 'women', 'children'],
      default: null 
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for faster queries
categorySchema.index({ name: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);

