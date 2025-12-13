import React, { FC, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import NotFoundPage from "../common/404";
import AdminLayout from "./AdminLayout";
import { AdminGuard } from "../components/guards/AdminGuard";
import ProtectedRoute from "./ProtectedRoute";

const LoginPage = lazy(
  () => import("../pages/Login/index" /* webpackChunkName: "login" */)
);

const RegisterPage = lazy(
  () => import("../pages/Register/index" /* webpackChunkName: "register" */)
);

const HomePage = lazy(
  () => import("../pages/Home/index" /* webpackChunkName: "home" */)
);

// Admin Pages
const AdminDashboard = lazy(
  () => import("../pages/Admin/Dashboard/index" /* webpackChunkName: "admin-dashboard" */)
);

const AdminCategories = lazy(
  () => import("../pages/Admin/Categories/index" /* webpackChunkName: "admin-categories" */)
);

const AdminProducts = lazy(
  () => import("../pages/Admin/Products/index" /* webpackChunkName: "admin-products" */)
);

const AdminOrders = lazy(
  () => import("../pages/Admin/Orders/index" /* webpackChunkName: "admin-orders" */)
);

const AdminUsers = lazy(
  () => import("../pages/Admin/Users/index" /* webpackChunkName: "admin-users" */)
);

const AdminSettings = lazy(
  () => import("../pages/Admin/Settings/index" /* webpackChunkName: "admin-settings" */)
);

const AdminProductAdd = lazy(
  () => import("../pages/Admin/Products/AddEdit" /* webpackChunkName: "admin-product-add" */)
);

const AdminProductEdit = lazy(
  () => import("../pages/Admin/Products/AddEdit" /* webpackChunkName: "admin-product-edit" */)
);

const AdminProductView = lazy(
  () => import("../pages/Admin/Products/View" /* webpackChunkName: "admin-product-view" */)
);

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      
      {/* Admin Routes - Protected with both AdminGuard and ProtectedRoute */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AdminProductAdd />} />
        <Route path="products/:id/edit" element={<AdminProductEdit />} />
        <Route path="products/:id/view" element={<AdminProductView />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route index element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
