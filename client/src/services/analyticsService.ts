import { AxiosResponse, AxiosInstance, AxiosError } from "axios";
import axios from "axios";
import { environment } from "./httpClients";

const controller = "analytics";

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

export interface MostSellingProduct {
  productId: string;
  productName: string;
  sku: string;
  sales: number;
  image?: string;
}

export interface WeeklyTopCustomer {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
}

export interface DashboardStats {
  totalRevenue: number;
  lastMonthRevenue: number;
  newCustomers: number;
  totalCustomers: number;
  avgOrderValue: number;
  repeatPurchaseRate: number;
  totalOrders: number;
}

export const analyticsService = {
  GetMostSellingProducts: async (limit?: number): Promise<AxiosResponse<{ success: boolean; data: MostSellingProduct[] }>> => {
    const params = limit ? `?limit=${limit}` : '';
    return axiosInstance.get(`/most-selling-products${params}`);
  },

  GetRecentOrders: async (limit?: number): Promise<AxiosResponse<{ success: boolean; data: any[] }>> => {
    const params = limit ? `?limit=${limit}` : '';
    return axiosInstance.get(`/recent-orders${params}`);
  },

  GetWeeklyTopCustomers: async (limit?: number): Promise<AxiosResponse<{ success: boolean; data: WeeklyTopCustomer[] }>> => {
    const params = limit ? `?limit=${limit}` : '';
    return axiosInstance.get(`/weekly-top-customers${params}`);
  },

  GetDashboardStats: async (): Promise<AxiosResponse<{ success: boolean; data: DashboardStats }>> => {
    return axiosInstance.get('/dashboard-stats');
  },
};

