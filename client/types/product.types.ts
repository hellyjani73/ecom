import { Category } from './category.types';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  category: Category | string;
  images: string[];
  stock: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Variant {
  _id: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
}

export interface ProductVariant extends Product {
  variants: Variant[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  category: string;
  images?: string[];
  stock: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

