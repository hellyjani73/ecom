import axiosInstance from '@/lib/axios';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
} from '@/types/category.types';

export const categoryService = {
  async getAllCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
  }): Promise<CategoryListResponse> {
    const response = await axiosInstance.get<{ data: CategoryListResponse }>('/categories', {
      params,
    });
    return response.data.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await axiosInstance.get<{ data: Category }>(`/categories/${id}`);
    return response.data.data;
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await axiosInstance.get<{ data: Category }>(`/categories/slug/${slug}`);
    return response.data.data;
  },

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await axiosInstance.post<{ data: Category }>('/categories', data);
    return response.data.data;
  },

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await axiosInstance.put<{ data: Category }>(`/categories/${id}`, data);
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/categories/${id}`);
    return response.data;
  },
};

