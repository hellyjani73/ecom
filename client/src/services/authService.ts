import { AxiosResponse, AxiosInstance, AxiosError } from "axios";
import axios from "axios";
import { environment } from "./httpClients";
import {
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    GoogleLoginRequest,
    RefreshTokenRequest,
    LoginResponse,
    AuthResponse,
    RefreshTokenResponse,
} from "./types/auth";
import { CommonResponse } from "./types/common";

const controller = "auth";

// Create axios instance with credentials
const axiosInstance: AxiosInstance = axios.create({
    baseURL: `${environment.apiUrl}/api/${controller}`,
    withCredentials: true, // Important for HttpOnly cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to include access token in headers
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = getAccessTokenFromCookie();
        if (accessToken && config.headers) {
            config.headers['auth-token'] = accessToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for automatic token refresh
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

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['auth-token'] = token;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axiosInstance.post("/refresh", {});
                const { accessToken } = response.data.data;
                processQueue(null, accessToken);
                originalRequest.headers['auth-token'] = accessToken;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Clear cookies and redirect to login
                clearAuthCookies();
                window.location.href = '/';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Helper functions
const getAccessTokenFromCookie = (): string | null => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "accessToken") {
            return value;
        }
    }
    return null;
};

const clearAuthCookies = (): void => {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

class AuthService {
    Login = async (payload: LoginRequest): Promise<AxiosResponse<LoginResponse>> => {
        return axiosInstance.post("/login", payload);
    };

    Register = async (payload: RegisterRequest): Promise<AxiosResponse<AuthResponse>> => {
        return axiosInstance.post("/register", payload);
    };

    GoogleLogin = async (payload: GoogleLoginRequest): Promise<AxiosResponse<AuthResponse>> => {
        return axiosInstance.post("/google", payload);
    };

    RefreshToken = async (payload?: RefreshTokenRequest): Promise<AxiosResponse<RefreshTokenResponse>> => {
        return axiosInstance.post("/refresh", payload || {});
    };

    Logout = async (): Promise<AxiosResponse<CommonResponse>> => {
        // Get refresh token from cookie if available
        const refreshToken = this.getRefreshTokenFromCookie();
        return axiosInstance.post("/logout", { refreshToken });
    };

    ChangePassword = async (
        payload: ChangePasswordRequest
    ): Promise<AxiosResponse<CommonResponse>> => {
        return axiosInstance.post("/changePassword", payload);
    };

    // Helper to get refresh token from cookie (if needed)
    private getRefreshTokenFromCookie(): string | null {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split("=");
            if (name === "refreshToken") {
                return value;
            }
        }
        return null;
    }

    // Helper to get access token from cookie
    getAccessTokenFromCookie(): string | null {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split("=");
            if (name === "accessToken") {
                return value;
            }
        }
        return null;
    }

    // Helper to clear auth cookies
    clearAuthCookies(): void {
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}

export default new AuthService();
