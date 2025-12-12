import { CommonResponse } from "./common";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'customer';
};

export type GoogleLoginRequest = {
  accessToken: string;
};

export type RefreshTokenRequest = {
  refreshToken?: string;
};

export type UserDetails = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  provider: string;
  // Legacy fields for backward compatibility
  userType?: string;
  vendorId?: string;
  moduleIds?: string;
  tax?: number;
  isTaxIncluded?: boolean;
  vendorName?: string;
  invoiceTemplateId?: number;
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export interface AuthResponse extends CommonResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    userDetails: UserDetails;
  };
}

export interface LoginResponse extends CommonResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    userDetails: UserDetails;
  };
}

export interface RefreshTokenResponse extends CommonResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
