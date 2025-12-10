import axiosInstance from '@/lib/axios';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  ProductFilters,
} from '@/types/product.types';

export const productService = {
  async getAllProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    const response = await axiosInstance.get<{ data: ProductListResponse }>('/products', {
      params: filters,
    });
    return response.data.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await axiosInstance.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await axiosInstance.get<{ data: Product }>(`/products/slug/${slug}`);
    return response.data.data;
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await axiosInstance.post<{ data: Product }>('/products', data);
    return response.data.data;
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await axiosInstance.put<{ data: Product }>(`/products/${id}`, data);
    return response.data.data;
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  },

  async updateStock(id: string, quantity: number): Promise<Product> {
    const response = await axiosInstance.put<{ data: Product }>(`/products/${id}/stock`, {
      quantity,
    });
    return response.data.data;
  },
};

