import axiosInstance from '@/lib/axios';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
} from '@/types/category.types';

export const adminCategoryService = {
  async getAllCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    parentId?: string | null;
  }): Promise<CategoryListResponse> {
    const response = await axiosInstance.get<{ data: CategoryListResponse }>('/admin/category', {
      params,
    });
    return response.data.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await axiosInstance.get<{ data: Category }>(`/admin/category/${id}`);
    return response.data.data;
  },

  async createCategory(data: CreateCategoryRequest & { imageBase64?: string }): Promise<Category> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.parentId) formData.append('parentId', data.parentId);
    if (data.priority !== undefined) formData.append('priority', data.priority.toString());
    if (data.status) formData.append('status', data.status);
    
    // Handle image
    if (data.imageBase64) {
      formData.append('imageBase64', data.imageBase64);
    }

    const response = await axiosInstance.post<{ data: Category }>('/admin/category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async updateCategory(
    id: string,
    data: UpdateCategoryRequest & { imageBase64?: string }
  ): Promise<Category> {
    const formData = new FormData();
    
    // Add text fields
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.parentId !== undefined) {
      formData.append('parentId', data.parentId || '');
    }
    if (data.priority !== undefined) formData.append('priority', data.priority.toString());
    if (data.status) formData.append('status', data.status);
    if (data.imageUrl !== undefined) formData.append('imageUrl', data.imageUrl || '');
    
    // Handle image
    if (data.imageBase64) {
      formData.append('imageBase64', data.imageBase64);
    }

    const response = await axiosInstance.post<{ data: Category }>(
      `/admin/category/${id}/update`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/admin/category/${id}`);
    return response.data;
  },
};
