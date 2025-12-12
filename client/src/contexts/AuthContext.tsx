import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { UserDetails } from '../services/types/auth';
import { ROUTES } from '../constants/routes';

interface AuthContextType {
  user: UserDetails | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  googleLogin: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const accessToken = authService.getAccessTokenFromCookie();
      
      if (accessToken) {
        // Token exists, try to refresh to validate
        try {
          await refreshToken();
        } catch (error) {
          // Token invalid, clear and redirect
          authService.clearAuthCookies();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.clearAuthCookies();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.Login({ email, password });
      if (response.data.success && response.data.data) {
        const { userDetails } = response.data.data;
        setUser(userDetails);
        // Store user details in localStorage for backward compatibility
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        navigate(ROUTES.DASHBOARD);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const response = await authService.Register({ name, email, password, role: role as any });
      if (response.data.success && response.data.data) {
        const { userDetails } = response.data.data;
        setUser(userDetails);
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        navigate(ROUTES.DASHBOARD);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const googleLogin = async (accessToken: string) => {
    try {
      const response = await authService.GoogleLogin({ accessToken });
      if (response.data.success && response.data.data) {
        const { userDetails } = response.data.data;
        setUser(userDetails);
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        navigate(ROUTES.DASHBOARD);
      } else {
        throw new Error(response.data.message || 'Google login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Google login failed');
    }
  };

  const logout = async () => {
    try {
      await authService.Logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clearAuthCookies();
      localStorage.removeItem('userDetails');
      setUser(null);
      navigate(ROUTES.LOGIN);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.RefreshToken();
      if (response.data.success && response.data.data) {
        // Tokens are stored in HttpOnly cookies, so we just need to validate
        // If we have user details, we can update them here if needed
        return;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Token refresh failed');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

