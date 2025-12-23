import axios, { AxiosResponse, AxiosInstance, AxiosError } from "axios";
import { environment } from "./httpClients";
import { CommonResponse } from "./types/common";

const controller = "brand";

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

export interface Brand {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandRequest {
  name: string;
  isActive?: boolean;
}

export interface BrandResponse extends CommonResponse {
  data: Brand;
}

export interface BrandsResponse extends CommonResponse {
  data: Brand[];
}

const brandService = {
  // Create a new brand
  CreateBrand: async (data: BrandRequest): Promise<AxiosResponse<BrandResponse>> => {
    return axiosInstance.post<BrandResponse>("/create", data);
  },

  // Get all brands
  GetAllBrands: async (isActive?: boolean): Promise<AxiosResponse<BrandsResponse>> => {
    const params = new URLSearchParams();
    if (isActive !== undefined) {
      params.append('isActive', String(isActive));
    }
    const queryString = params.toString();
    return axiosInstance.get<BrandsResponse>(`/${queryString ? `?${queryString}` : ''}`);
  },

  // Get brand by ID
  GetBrandById: async (id: string): Promise<AxiosResponse<BrandResponse>> => {
    return axiosInstance.get<BrandResponse>(`/${id}`);
  },

  // Update brand
  UpdateBrand: async (id: string, data: Partial<BrandRequest>): Promise<AxiosResponse<BrandResponse>> => {
    return axiosInstance.put<BrandResponse>(`/${id}`, data);
  },

  // Delete brand
  DeleteBrand: async (id: string): Promise<AxiosResponse<CommonResponse>> => {
    return axiosInstance.delete<CommonResponse>(`/${id}`);
  },
};

export default brandService;


