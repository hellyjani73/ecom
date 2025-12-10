import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCategoryService } from '@/services/adminCategory.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category.types';

export const useAdminCategories = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  parentId?: string | null;
}) => {
  return useQuery({
    queryKey: ['adminCategories', params],
    queryFn: () => adminCategoryService.getAllCategories(params),
  });
};

export const useAdminCategory = (id: string | null) => {
  return useQuery({
    queryKey: ['adminCategory', id],
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
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
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
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminCategory', variables.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
    },
  });
};
