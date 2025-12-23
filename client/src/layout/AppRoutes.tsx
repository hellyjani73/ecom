import React, { FC, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import NotFoundPage from "../common/404";
import AdminLayout from "./AdminLayout";
import CustomerLayout from "./CustomerLayout";
import AccountLayout from "./AccountLayout";
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

// Customer Pages
const ProductListing = lazy(
  () => import("../pages/Products/ProductListing" /* webpackChunkName: "product-listing" */)
);

const ProductDetail = lazy(
  () => import("../pages/Products/ProductDetail" /* webpackChunkName: "product-detail" */)
);

const Cart = lazy(
  () => import("../pages/Cart/index" /* webpackChunkName: "cart" */)
);

const Checkout = lazy(
  () => import("../pages/Checkout/index" /* webpackChunkName: "checkout" */)
);

const OrderConfirmation = lazy(
  () => import("../pages/OrderConfirmation/index" /* webpackChunkName: "order-confirmation" */)
);

const Wishlist = lazy(
  () => import("../pages/Wishlist/index" /* webpackChunkName: "wishlist" */)
);

// Account Pages
const AccountDashboard = lazy(
  () => import("../pages/Account/Dashboard/index" /* webpackChunkName: "account-dashboard" */)
);
const AccountOrders = lazy(
  () => import("../pages/Account/Orders/index" /* webpackChunkName: "account-orders" */)
);
const AccountOrderDetail = lazy(
  () => import("../pages/Account/Orders/OrderDetail" /* webpackChunkName: "account-order-detail" */)
);
const AccountWishlist = lazy(
  () => import("../pages/Account/Wishlist/index" /* webpackChunkName: "account-wishlist" */)
);
const AccountReviews = lazy(
  () => import("../pages/Account/Reviews/index" /* webpackChunkName: "account-reviews" */)
);
const AccountAddresses = lazy(
  () => import("../pages/Account/Addresses/index" /* webpackChunkName: "account-addresses" */)
);
const AccountPayments = lazy(
  () => import("../pages/Account/Payments/index" /* webpackChunkName: "account-payments" */)
);
const AccountSettings = lazy(
  () => import("../pages/Account/Settings/index" /* webpackChunkName: "account-settings" */)
);
const AccountNotifications = lazy(
  () => import("../pages/Account/Notifications/index" /* webpackChunkName: "account-notifications" */)
);
const AccountHelp = lazy(
  () => import("../pages/Account/Help/index" /* webpackChunkName: "account-help" */)
);

const AppRoutes: FC = () => {
  return (
    <Routes>
      {/* Auth Routes - No Layout */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      
      {/* Customer Routes - With Header and Footer */}
      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.PRODUCTS} element={<ProductListing />} />
        <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />
        <Route path={ROUTES.CART} element={<Cart />} />
        <Route path={ROUTES.WISHLIST} element={<Wishlist />} />
        <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
        <Route path={ROUTES.ORDER_CONFIRMATION} element={<OrderConfirmation />} />
      </Route>

      {/* Account Routes - Protected with Authentication */}
      <Route
        path="/account/*"
        element={
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AccountDashboard />} />
        <Route path="orders" element={<AccountOrders />} />
        <Route path="orders/:orderId" element={<AccountOrderDetail />} />
        <Route path="wishlist" element={<AccountWishlist />} />
        <Route path="reviews" element={<AccountReviews />} />
        <Route path="addresses" element={<AccountAddresses />} />
        <Route path="payments" element={<AccountPayments />} />
        <Route path="settings" element={<AccountSettings />} />
        <Route path="notifications" element={<AccountNotifications />} />
        <Route path="help" element={<AccountHelp />} />
        <Route index element={<AccountDashboard />} />
      </Route>
      
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
