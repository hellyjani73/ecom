import mongoose, { Schema, Document } from 'mongoose';

// Variant Option Schema
export interface IVariantOption {
  name: string; // e.g., "Color", "Size"
  values: string[]; // e.g., ["Red", "Blue", "Green"]
}

// Variant Image Schema
export interface IVariantImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

// Variant Schema
export interface IVariant {
  variantName: string; // e.g., "Red - Small - Cotton"
  sku: string; // e.g., "PROD-001-RS-C"
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  image?: string; // Legacy support
  images?: IVariantImage[]; // New: Multiple images per variant
  isActive: boolean;
  attributes: { [key: string]: string }; // e.g., { "Color": "Red", "Size": "Small" }
}

// Product Image Schema
export interface IProductImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

// Stock History Schema
export interface IStockHistory {
  date: Date;
  change: number; // positive for add, negative for remove
  reason?: string;
  changedBy?: string;
}

// SEO Schema
export interface IProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  focusKeyword?: string;
}

// Shipping Schema
export interface IProductShipping {
  weight?: number;
  weightUnit?: 'kg' | 'g';
  length?: number;
  width?: number;
  height?: number;
  shippingClass?: string;
  requiresShipping: boolean;
}

// Product Interface
export interface IProduct extends Document {
  name: string;
  sku: string;
  parentCategory?: string; // 'men' | 'women' | 'children'
  category: mongoose.Types.ObjectId | string; // Category ID reference
  productType: 'simple' | 'variant';
  brand?: string;
  vendor?: string;
  tags: string[];
  shortDescription?: string;
  longDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  
  // Pricing (for simple products)
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxRate: number;
  
  // Variants (for variant products)
  variantOptions?: IVariantOption[];
  variants?: IVariant[];
  
  // Inventory (for simple products)
  stock?: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  stockHistory?: IStockHistory[];
  
  // Images
  images: IProductImage[];
  
  // SEO
  seo: IProductSEO;
  
  // Shipping
  shipping?: IProductShipping;
  
  // Relations
  relatedProducts?: mongoose.Types.ObjectId[];
  upSellProducts?: mongoose.Types.ObjectId[];
  crossSellProducts?: mongoose.Types.ObjectId[];
  
  // Scheduling
  scheduledActiveDate?: Date;
  scheduledSaleStart?: Date;
  scheduledSaleEnd?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const variantOptionSchema = new Schema<IVariantOption>({
  name: { type: String, required: true },
  values: [{ type: String, required: true }],
}, { _id: false });

const variantImageSchema = new Schema<IVariantImage>({
  url: { type: String, required: true },
  altText: { type: String },
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { _id: false });

const variantSchema = new Schema<IVariant>({
  variantName: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0.01 },
  compareAtPrice: { type: Number, min: 0.01 },
  costPrice: { type: Number, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5, min: 0 },
  image: { type: String }, // Legacy support
  images: [variantImageSchema], // New: Multiple images per variant
  isActive: { type: Boolean, default: true },
  attributes: { type: Map, of: String },
}, { _id: false });

const productImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  altText: { type: String },
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { _id: false });

const stockHistorySchema = new Schema<IStockHistory>({
  date: { type: Date, default: Date.now },
  change: { type: Number, required: true },
  reason: { type: String },
  changedBy: { type: String },
}, { _id: false });

const productSEOSchema = new Schema<IProductSEO>({
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  slug: { type: String, required: true, unique: true },
  focusKeyword: { type: String },
}, { _id: false });

const productShippingSchema = new Schema<IProductShipping>({
  weight: { type: Number, min: 0 },
  weightUnit: { type: String, enum: ['kg', 'g'], default: 'kg' },
  length: { type: Number, min: 0 },
  width: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  shippingClass: { type: String },
  requiresShipping: { type: Boolean, default: true },
}, { _id: false });

const productSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    sku: { type: String, required: true, unique: true, uppercase: true },
    parentCategory: { type: String, enum: ['men', 'women', 'children'] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    productType: { type: String, enum: ['simple', 'variant'], required: true, default: 'simple' },
    brand: { type: String, trim: true },
    vendor: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    shortDescription: { type: String, maxlength: 500 },
    longDescription: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    
    // Pricing
    basePrice: { type: Number, required: true, min: 0.01 },
    compareAtPrice: { type: Number, min: 0.01 },
    costPrice: { type: Number, min: 0 },
    taxRate: { type: Number, min: 0, max: 100 },
    
    // Variants
    variantOptions: [variantOptionSchema],
    variants: [variantSchema],
    
    // Inventory
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    trackInventory: { type: Boolean, default: true },
    stockHistory: [stockHistorySchema],
    
    // Images
    images: [productImageSchema],
    
    // SEO
    seo: { type: productSEOSchema, required: true },
    
    // Shipping
    shipping: productShippingSchema,
    
    // Relations
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    upSellProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    crossSellProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    
    // Scheduling
    scheduledActiveDate: { type: Date },
    scheduledSaleStart: { type: Date },
    scheduledSaleEnd: { type: Date },
  },
  { timestamps: true }
);

// Indexes for faster queries
productSchema.index({ name: 'text', sku: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ parentCategory: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ createdAt: -1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.productType === 'variant') {
    const totalStock = this.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
    if (totalStock === 0) return 'out_of_stock';
    const lowStockVariants = this.variants?.filter(v => 
      v.stock > 0 && v.stock <= v.lowStockThreshold
    ).length || 0;
    if (lowStockVariants > 0) return 'low_stock';
    return 'in_stock';
  } else {
    if ((this.stock || 0) === 0) return 'out_of_stock';
    if ((this.stock || 0) <= (this.lowStockThreshold || 5)) return 'low_stock';
    return 'in_stock';
  }
});

// Virtual for total stock (sum of all variants)
productSchema.virtual('totalStock').get(function() {
  if (this.productType === 'variant') {
    return this.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
  }
  return this.stock || 0;
});

export const Product = mongoose.model<IProduct>('Product', productSchema);

