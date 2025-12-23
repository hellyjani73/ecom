import { AxiosResponse, AxiosInstance, AxiosError } from "axios";
import axios from "axios";
import { environment } from "./httpClients";
import {
  Product,
  ProductRequest,
  ProductListFilters,
  ProductListResponse,
  ProductResponse,
  BulkActionRequest,
} from "./types/product";
import { CommonResponse } from "./types/common";

const controller = "product";

// Create axios instance with credentials
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${environment.apiUrl}/api/${controller}`,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include access token in headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const cookies = document.cookie.split(";");
    let accessToken = null;
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "accessToken") {
        accessToken = value;
        break;
      }
    }
    
    if (accessToken && config.headers) {
      config.headers["auth-token"] = accessToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${environment.apiUrl}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error("Token refresh failed, redirecting to login...");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const productService = {
  // Create a new product
  CreateProduct: async (data: ProductRequest): Promise<AxiosResponse<ProductResponse>> => {
    return axiosInstance.post<ProductResponse>("/", data);
  },

  // Get all products with filters
  GetAllProducts: async (filters?: ProductListFilters): Promise<AxiosResponse<ProductListResponse>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    return axiosInstance.get<ProductListResponse>(`/?${params.toString()}`);
  },

  // Get product by ID
  GetProductById: async (id: string): Promise<AxiosResponse<ProductResponse>> => {
    return axiosInstance.get<ProductResponse>(`/${id}`);
  },

  // Update product
  UpdateProduct: async (id: string, data: ProductRequest): Promise<AxiosResponse<ProductResponse>> => {
    return axiosInstance.put<ProductResponse>(`/${id}`, data);
  },

  // Delete product
  DeleteProduct: async (id: string): Promise<AxiosResponse<CommonResponse>> => {
    return axiosInstance.delete<CommonResponse>(`/${id}`);
  },

  // Bulk actions
  BulkAction: async (data: BulkActionRequest): Promise<AxiosResponse<CommonResponse>> => {
    return axiosInstance.post<CommonResponse>("/bulk-action", data);
  },

  // Upload image to Cloudinary
  UploadImageToCloudinary: async (image: string): Promise<AxiosResponse<CommonResponse>> => {
    return axiosInstance.post<CommonResponse>("/upload-image", { image });
  },

  // Get featured products (public endpoint, no auth required)
  GetFeaturedProducts: async (limit?: number): Promise<AxiosResponse<ProductListResponse>> => {
    const params = new URLSearchParams();
    if (limit) {
      params.append('limit', String(limit));
    }
    // Use a separate axios instance without auth for public endpoints
    const publicAxiosInstance = axios.create({
      baseURL: `${environment.apiUrl}/api/${controller}`,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return publicAxiosInstance.get<ProductListResponse>(`/public/featured?${params.toString()}`);
  },

  // Get public products (no auth required)
  GetPublicProducts: async (filters?: ProductListFilters): Promise<AxiosResponse<ProductListResponse>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const publicAxiosInstance = axios.create({
      baseURL: `${environment.apiUrl}/api/${controller}`,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return publicAxiosInstance.get<ProductListResponse>(`/public?${params.toString()}`);
  },

  // Get public product by ID (no auth required)
  GetPublicProductById: async (id: string): Promise<AxiosResponse<ProductResponse>> => {
    const publicAxiosInstance = axios.create({
      baseURL: `${environment.apiUrl}/api/${controller}`,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return publicAxiosInstance.get<ProductResponse>(`/public/${id}`);
  },
};

