import React, { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import authService from '../../services/authService';

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  // Try to get token from authService (checks for 'accessToken' cookie)
  // Note: HttpOnly cookies can't be read by JS, so we also check localStorage and auth state
  const token = authService.getAccessTokenFromCookie();
  const storedUserDetails = localStorage.getItem('userDetails');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication - HttpOnly cookies can't be read by JS, so we check:
  // 1. If user is authenticated in context
  // 2. If userDetails exist in localStorage (set after login)
  // 3. If token exists (may not work for HttpOnly, but try anyway)
  const hasAuth = isAuthenticated || storedUserDetails || token;
  
  if (!hasAuth) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Get user role from context or localStorage
  let userRole = user?.role || user?.userType;
  
  if (!userRole && storedUserDetails) {
    try {
      const parsed = JSON.parse(storedUserDetails);
      userRole = parsed.role || parsed.userType;
    } catch (e) {
      console.error('Failed to parse user details:', e);
    }
  }

  // Check role (case-insensitive)
  const normalizedRole = (userRole || '').toLowerCase();
  if (normalizedRole !== 'admin') {
    console.log('AdminGuard - User role is not admin:', normalizedRole);
    return <Navigate to={ROUTES.NOT_FOUND} replace />;
  }

  return <>{children}</>;
};

