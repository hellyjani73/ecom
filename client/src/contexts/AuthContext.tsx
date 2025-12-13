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
          // Load user details from localStorage if available
          const storedUserDetails = localStorage.getItem('userDetails');
          if (storedUserDetails) {
            try {
              const userDetails = JSON.parse(storedUserDetails);
              setUser(userDetails);
            } catch (e) {
              console.error('Failed to parse user details:', e);
            }
          }
        } catch (error) {
          // Token invalid, clear and redirect
          authService.clearAuthCookies();
          localStorage.removeItem('userDetails');
          setUser(null);
        }
      } else {
        // No token, check localStorage for user details
        const storedUserDetails = localStorage.getItem('userDetails');
        if (storedUserDetails) {
          try {
            const userDetails = JSON.parse(storedUserDetails);
            setUser(userDetails);
          } catch (e) {
            console.error('Failed to parse user details:', e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.clearAuthCookies();
      localStorage.removeItem('userDetails');
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
        // Store user details in localStorage for backward compatibility and session management
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        
        // Wait a moment for HttpOnly cookies to be set by the browser
        // This ensures the cookie is available before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check role (case-insensitive) - check both 'role' and 'userType' fields
        const userRole = (userDetails.role || userDetails.userType || '').toLowerCase();
        
        // Redirect based on user role
        if (userRole === 'admin') {
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.HOME, { replace: true });
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      // Check for network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      // Check for timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timeout. Please try again.');
      }
      // Return server error message or default
      throw new Error(error.response?.data?.message || error.message || 'Login failed. Please try again.');
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const response = await authService.Register({ name, email, password, role: role as any });
      if (response.data.success && response.data.data) {
        const { userDetails } = response.data.data;
        setUser(userDetails);
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        
        // Check role (case-insensitive) - check both 'role' and 'userType' fields
        const userRole = (userDetails.role || userDetails.userType || '').toLowerCase();
        
        // Redirect based on user role
        if (userRole === 'admin') {
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.HOME, { replace: true });
        }
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      // Check for network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      // Check for timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timeout. Please try again.');
      }
      // Return server error message or default
      throw new Error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    }
  };

  const googleLogin = async (accessToken: string) => {
    try {
      const response = await authService.GoogleLogin({ accessToken });
      if (response.data.success && response.data.data) {
        const { userDetails } = response.data.data;
        setUser(userDetails);
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        
        // Check role (case-insensitive) - check both 'role' and 'userType' fields
        const userRole = (userDetails.role || userDetails.userType || '').toLowerCase();
        
        // Redirect based on user role
        if (userRole === 'admin') {
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.HOME, { replace: true });
        }
      } else {
        throw new Error(response.data.message || 'Google login failed');
      }
    } catch (error: any) {
      // Check for network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      // Check for timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timeout. Please try again.');
      }
      // Return server error message or default
      throw new Error(error.response?.data?.message || error.message || 'Google login failed. Please try again.');
    }
  };

  const logout = async () => {
    // Clear state immediately (synchronously) - do this first
    authService.clearAuthCookies();
    localStorage.removeItem('userDetails');
    localStorage.removeItem('modules'); // Also clear modules if exists
    setUser(null);
    
    // Stop any pending API calls by redirecting immediately
    // Use replace to prevent back button from going to admin panel
    // This must happen synchronously before any async operations
    window.location.replace('/');
    
    // The redirect above will stop execution, but in case it doesn't,
    // we still try to call logout API (though it likely won't execute)
    try {
      await authService.Logout();
    } catch (error) {
      // Ignore all errors - we've already cleared state and redirected
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

