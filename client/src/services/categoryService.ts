import { AxiosResponse, AxiosInstance, AxiosError } from "axios";
import axios from "axios";
import { environment } from "./httpClients";
import {
  CategoryRequest,
  CategoryResponse,
  CategoriesResponse,
} from "./types/category";
import { CommonResponse } from "./types/common";

const controller = "category";

// Create axios instance with credentials
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${environment.apiUrl}/api/${controller}`,
  withCredentials: true,
  timeout: 30000, // 30 seconds for image uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include access token in headers
axiosInstance.interceptors.request.use(
  async (config) => {
    // Try to get token from cookie (may not work for HttpOnly, but try anyway)
    const cookies = document.cookie.split(";");
    let accessToken = null;
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "accessToken") {
        accessToken = value;
        break;
      }
    }
    
    // If we can't read the cookie (HttpOnly), the cookie will be sent automatically
    // But we should still try to add it to the header if we can read it
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
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If we get a 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["auth-token"] = token;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${environment.apiUrl}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          // Token refreshed, cookies are updated automatically
          // Try to read the new token from cookie
          const cookies = document.cookie.split(";");
          let newToken = null;
          for (let cookie of cookies) {
            const [name, value] = cookie.trim().split("=");
            if (name === "accessToken") {
              newToken = value;
              break;
            }
          }
          
          processQueue(null, newToken);
          
          // Retry the original request
          // The cookie will be sent automatically, but try to add to header if we can read it
          if (newToken && originalRequest.headers) {
            originalRequest.headers["auth-token"] = newToken;
          }
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        // Refresh failed, clear queue
        processQueue(refreshError, null);
        console.error("Token refresh failed:", refreshError);
        // Don't redirect to login - let the component handle it
        // Only redirect if we're not already on a public route
        const currentPath = window.location.pathname;
        const publicRoutes = ['/', '/login', '/register'];
        if (!publicRoutes.includes(currentPath)) {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

class CategoryService {
  CreateCategory = async (
    payload: CategoryRequest
  ): Promise<AxiosResponse<CategoryResponse>> => {
    return axiosInstance.post("/create", payload);
  };

  GetAllCategories = async (): Promise<AxiosResponse<CategoriesResponse>> => {
    return axiosInstance.get("/all");
  };

  GetCategoryById = async (
    id: string
  ): Promise<AxiosResponse<CategoryResponse>> => {
    return axiosInstance.get(`/${id}`);
  };

  UpdateCategory = async (
    id: string,
    payload: Partial<CategoryRequest>
  ): Promise<AxiosResponse<CategoryResponse>> => {
    return axiosInstance.put(`/${id}`, payload);
  };

  DeleteCategory = async (
    id: string
  ): Promise<AxiosResponse<CommonResponse>> => {
    return axiosInstance.delete(`/${id}`);
  };

  UploadImageToCloudinary = async (
    base64Image: string
  ): Promise<AxiosResponse<CommonResponse>> => {
    return axiosInstance.post("/upload-image", { image: base64Image });
  };
}

export default new CategoryService();

