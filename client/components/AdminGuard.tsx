'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { isAdmin } from '@/lib/auth-guard';
import routes from '@/routes/routes';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // First check from store
        if (!isAuthenticated || !user) {
          router.push(routes.login);
          return;
        }

        // Verify admin role from token
        const adminStatus = await isAdmin();
        if (!adminStatus) {
          router.push(routes.login);
          return;
        }

        // Double-check with backend
        const backendCheck = await authService.checkAdmin();
        if (!backendCheck) {
          router.push(routes.login);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Admin check error:', error);
        router.push(routes.login);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router, isAuthenticated, user]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Verifying admin access...
        </Typography>
      </Box>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

