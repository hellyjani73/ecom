export default {
  home: "/",

  login: "/auth/login",
  register: "/auth/register",

  profile: "/profile",
  profileOrders: "/profile/orders",

  categories: "/categories",
  category: (slug: string) => `/categories/${slug}`,

  products: "/products",
  product: (id: string) => `/products/${id}`,

  cart: "/cart",
  checkout: "/checkout",

  admin: {
    dashboard: "/admin",
    products: "/admin/products",
    productsCreate: "/admin/products/create",
    categories: "/admin/categories",
    orders: "/admin/orders",
    users: "/admin/users",
  }
};

