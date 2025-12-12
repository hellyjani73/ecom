import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

interface ManagerGuardProps {
  children: ReactNode;
}

export const ManagerGuard: React.FC<ManagerGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <Navigate to={ROUTES.NOT_FOUND} replace />;
  }

  return <>{children}</>;
};

