import axiosInstance from '../lib/axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/auth.types';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh-token', data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await axiosInstance.post('/auth/logout', { refreshToken });
  },

  async logoutAll(): Promise<void> {
    await axiosInstance.post('/auth/logout-all');
  },

  async checkAdmin(): Promise<boolean> {
    try {
      const response = await axiosInstance.get<{ isAdmin: boolean }>('/auth/check-admin');
      return response.data.isAdmin;
    } catch (error) {
      return false;
    }
  },
};

