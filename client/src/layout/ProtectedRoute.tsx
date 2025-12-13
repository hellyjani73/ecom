import { FC, useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";

interface ProtectedRouteProps {
  children: ReactNode;
}

const MODULE_ROUTES = [
  "/admin/vendors-management",
];

// Admin routes that require admin role
const ADMIN_ROUTES = [
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_CATEGORIES,
  ROUTES.ADMIN_PRODUCTS,
  ROUTES.ADMIN_ORDERS,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_SETTINGS,
];

const isAdminRoute = (pathname: string): boolean => {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route)) || pathname.startsWith('/admin/');
};

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // Try to get token from authService (checks for 'accessToken' cookie)
  // Note: HttpOnly cookies can't be read by JS, so we also check localStorage and auth state
  const token = authService.getAccessTokenFromCookie();
  const storedUserDetails = localStorage.getItem("userDetails");

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      const userDetails = JSON.parse(
        localStorage.getItem("userDetails") || "{}"
      );
      const storedModules = JSON.parse(localStorage.getItem("modules") || "[]");

      if (userDetails?.moduleIds && storedModules.length > 0) {
        const userModuleIds: string[] = Array.isArray(userDetails.moduleIds)
          ? userDetails.moduleIds.map(String)
          : userDetails.moduleIds.split(",").map((id: string) => id.trim());

        const userRoutes = storedModules
          .filter((mod: any) => userModuleIds.includes(String(mod._id)))
          .map((mod: any) => mod.route);

        if (userRoutes.length > 0) {
          setAllowedRoutes(userRoutes);
        } else {
          // ✅ Set first available module if no allowed routes
          setAllowedRoutes([storedModules[0].route]);
          navigate(storedModules[0].route, { replace: true });
        }
      } else {
        setAllowedRoutes([]);
      }
      setLoading(false);
    };

    fetchModules();
  }, [navigate]);

  // ✅ Wait until loading is complete
  if (loading || authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ Check authentication - HttpOnly cookies can't be read by JS, so we check:
  // 1. If user is authenticated in context
  // 2. If userDetails exist in localStorage (set after login)
  // 3. If token exists (may not work for HttpOnly, but try anyway)
  const hasAuth = isAuthenticated || storedUserDetails || token;
  
  if (!hasAuth) {
    console.log("No authentication found, redirecting to login...");
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // ✅ Check if this is an admin route
  if (isAdminRoute(location.pathname)) {
    // Get user role from context or localStorage - check both 'role' and 'userType'
    const storedUserDetails = localStorage.getItem("userDetails");
    let userRole = user?.role || user?.userType;
    
    if (!userRole && storedUserDetails) {
      try {
        const parsed = JSON.parse(storedUserDetails);
        userRole = parsed.role || parsed.userType;
      } catch (e) {
        console.error("Failed to parse user details:", e);
      }
    }

    // Admin routes require admin role (case-insensitive)
    const normalizedRole = (userRole || '').toLowerCase();
    if (normalizedRole !== 'admin') {
      console.log("Admin route accessed by non-admin user, redirecting... Role:", normalizedRole);
      return <Navigate to={ROUTES.NOT_FOUND} replace />;
    }

    // Admin has access, allow through
    return <>{children}</>;
  }

  // ✅ For module-based routes, check module access
  if (MODULE_ROUTES.includes(location.pathname)) {
    // Redirect if no allowed routes
    if (allowedRoutes.length === 0) {
      console.log("No allowed routes, redirecting to /not-found...");
      return <Navigate to={ROUTES.NOT_FOUND} replace />;
    }

    // ✅ Redirect if current route is restricted
    if (!allowedRoutes.includes(location.pathname)) {
      console.log(
        `Access to ${location.pathname} is restricted. Redirecting to first allowed module...`
      );
      return <Navigate to={allowedRoutes[0]} replace />;
    }
  }

  // ✅ For other protected routes, just check token (already checked above)
  return <>{children}</>;
};

export default ProtectedRoute;
