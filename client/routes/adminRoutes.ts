/**
 * Admin route constants
 * All admin routes should be defined here
 */
export const adminRoutes = {
  dashboard: '/admin',
  categories: '/admin/categories',
  products: '/admin/products',
  orders: '/admin/orders',
  users: '/admin/users',
  settings: '/admin/settings',
} as const;

export type AdminRoute = typeof adminRoutes[keyof typeof adminRoutes];
