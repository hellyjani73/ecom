import { CommonResponse } from "./common";

export type ProductType = 'simple' | 'variant';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface VariantOption {
  name: string;
  values: string[];
}

export interface VariantImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

export interface Variant {
  variantName: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  image?: string; // Legacy support
  images?: VariantImage[]; // New: Multiple images per variant
  isActive: boolean;
  attributes: { [key: string]: string };
}

export interface ProductImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  focusKeyword?: string;
}

export interface ProductShipping {
  weight?: number;
  weightUnit?: 'kg' | 'g';
  length?: number;
  width?: number;
  height?: number;
  shippingClass?: string;
  requiresShipping: boolean;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  parentCategory?: string;
  category: string;
  productType: ProductType;
  brand?: string;
  vendor?: string;
  tags: string[];
  shortDescription?: string;
  longDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxRate: number;
  variantOptions?: VariantOption[];
  variants?: Variant[];
  stock?: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  images: ProductImage[];
  seo: ProductSEO;
  shipping?: ProductShipping;
  relatedProducts?: string[];
  upSellProducts?: string[];
  crossSellProducts?: string[];
  scheduledActiveDate?: string;
  scheduledSaleStart?: string;
  scheduledSaleEnd?: string;
  createdAt?: string;
  updatedAt?: string;
  // Computed fields
  stockStatus?: StockStatus;
  totalStock?: number;
}

export interface ProductRequest {
  name: string;
  sku?: string; // Auto-generated if not provided
  parentCategory?: string;
  category: string;
  productType: ProductType;
  brand?: string;
  vendor?: string;
  tags?: string[];
  shortDescription?: string;
  longDescription?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxRate?: number;
  variantOptions?: VariantOption[];
  variants?: Variant[];
  stock?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  images?: ProductImage[];
  seo?: Partial<ProductSEO>;
  shipping?: Partial<ProductShipping>;
  relatedProducts?: string[];
  upSellProducts?: string[];
  crossSellProducts?: string[];
  scheduledActiveDate?: string;
  scheduledSaleStart?: string;
  scheduledSaleEnd?: string;
}

export interface ProductListFilters {
  search?: string;
  parentCategory?: string;
  category?: string;
  status?: 'all' | 'active' | 'inactive' | 'featured';
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'date' | 'stock';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductListResponse extends CommonResponse {
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductResponse extends CommonResponse {
  data: Product;
}

export interface BulkActionRequest {
  productIds: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'updateStock' | 'applyDiscount' | 'changeCategory';
  data?: {
    stockChange?: number;
    discountPercent?: number;
    categoryId?: string;
  };
}

