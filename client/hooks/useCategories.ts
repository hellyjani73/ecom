import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCategoryService } from '@/services/adminCategory.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category.types';

export const useCategories = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  parentId?: string | null;
}) => {
  return useQuery({
    queryKey: ['admin-categories', params],
    queryFn: () => adminCategoryService.getAllCategories(params),
  });
};

export const useCategory = (id: string | null) => {
  return useQuery({
    queryKey: ['admin-category', id],
    queryFn: () => (id ? adminCategoryService.getCategoryById(id) : null),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest & { imageBase64?: string }) =>
      adminCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryRequest & { imageBase64?: string };
    }) => adminCategoryService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-category', variables.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });
};

