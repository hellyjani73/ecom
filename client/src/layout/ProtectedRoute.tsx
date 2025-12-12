import Cookies from "js-cookie";
import { FC, useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

interface ProtectedRouteProps {
  children: ReactNode;
}

const MODULE_ROUTES = [
  "/customer",
  "/rent-cloth",
  "/rental-schedule",
  "/cloth-availability",
  "/cloth-category",
  "/cloth-fabric",
  "/shop-expenses",
  "/management",
  "/employees",
  "/report",
  "/admin/vendors-management",
  "/admin/vendor-subscriptions",
  "/washing",
];

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]); // ✅ Default to empty array
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("authToken");

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
        setAllowedRoutes([]); // ✅ Explicitly set to empty array
      }
      setLoading(false);
    };

    fetchModules();
  }, [navigate]);

  // ✅ Wait until loading is complete
  if (loading) {
    return <div>Loading...</div>; // Replace with a proper loading spinner if needed
  }

  // ✅ Redirect if token is missing
  if (!token) {
    console.log("No token found, redirecting to login...");
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // ✅ Redirect if no allowed routes
  if (allowedRoutes.length === 0) {
    console.log("No allowed routes, redirecting to /not-found...");
    return <Navigate to={ROUTES.NOT_FOUND} replace />;
  }

  // ✅ Redirect if current route is restricted
  if (
    MODULE_ROUTES.includes(location.pathname) &&
    !allowedRoutes.includes(location.pathname)
  ) {
    console.log(
      `Access to ${location.pathname} is restricted. Redirecting to first allowed module...`
    );
    return <Navigate to={allowedRoutes[0]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
