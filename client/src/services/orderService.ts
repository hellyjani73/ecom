import { AxiosResponse, AxiosInstance, AxiosError } from "axios";
import axios from "axios";
import { environment } from "./httpClients";
import {
  Order,
  OrderListFilters,
  OrderListResponse,
  OrderResponse,
  BulkOrderAction,
} from "./types/order";
import { CommonResponse } from "./types/common";

const controller = "order";

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
        const refreshResponse = await axios.post(
          `${environment.apiUrl}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed, redirecting to login...");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const orderService = {
  // Create a new order
  CreateOrder: async (data: any): Promise<AxiosResponse<OrderResponse>> => {
    return axiosInstance.post<OrderResponse>("/", data);
  },

  // Get all orders with filters
  GetAllOrders: async (filters?: OrderListFilters): Promise<AxiosResponse<OrderListResponse>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    return axiosInstance.get<OrderListResponse>(`/?${params.toString()}`);
  },

  // Get order by ID
  GetOrderById: async (id: string): Promise<AxiosResponse<OrderResponse>> => {
    return axiosInstance.get<OrderResponse>(`/${id}`);
  },

  // Update order
  UpdateOrder: async (id: string, data: Partial<Order>): Promise<AxiosResponse<OrderResponse>> => {
    return axiosInstance.put<OrderResponse>(`/${id}`, data);
  },

  // Bulk actions
  BulkAction: async (data: BulkOrderAction): Promise<AxiosResponse<CommonResponse>> => {
    return axiosInstance.post<CommonResponse>("/bulk-action", data);
  },

  // Export orders
  ExportOrders: async (filters?: OrderListFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    return axiosInstance.get(`/export?${params.toString()}`, { responseType: 'blob' });
  },
};

