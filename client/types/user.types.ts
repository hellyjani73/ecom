import { Address } from './auth.types';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  address?: Address;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: Address;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

