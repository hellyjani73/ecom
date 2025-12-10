import axiosInstance from '@/lib/axios';
import {
  User,
  UpdateUserRequest,
  UpdatePasswordRequest,
  UserListResponse,
} from '@/types/user.types';

export const userService = {
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: string;
  }): Promise<UserListResponse> {
    const response = await axiosInstance.get<UserListResponse>('/users', { params });
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await axiosInstance.get<{ data: User }>(`/users/${id}`);
    return response.data.data;
  },

  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<{ data: User }>('/users/profile');
    return response.data.data;
  },

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    const response = await axiosInstance.put<{ data: User }>('/users/profile', data);
    return response.data.data;
  },

  async updatePassword(data: UpdatePasswordRequest): Promise<{ message: string }> {
    const response = await axiosInstance.put<{ message: string }>('/users/profile/password', data);
    return response.data;
  },

  async createUser(data: Partial<User>): Promise<User> {
    const response = await axiosInstance.post<{ data: User }>('/users', data);
    return response.data.data;
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await axiosInstance.put<{ data: User }>(`/users/${id}`, data);
    return response.data.data;
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },
};

