# E-commerce Full-Stack Application

A complete e-commerce platform with Next.js frontend and Express.js backend, featuring robust authentication, session management, and back-button protection.

## 📁 Project Structure

```
/
├── client/                 # Next.js Frontend (TypeScript)
│   ├── app/               # Next.js App Router
│   ├── routes/            # Unified routes file
│   ├── types/             # TypeScript interfaces
│   ├── services/          # API service layer
│   ├── components/        # React components
│   ├── store/             # Zustand state management
│   ├── lib/               # Utilities (axios, auth-guard)
│   ├── middleware.ts      # Next.js route protection
│   └── public/            # Static assets
│
├── server/                # Express.js Backend
│   ├── config/            # Database configuration
│   ├── middlewares/       # sessionGuard, adminGuard
│   ├── models/            # Mongoose schemas
│   ├── controllers/      # Request handlers
│   ├── services/          # Business logic
│   ├── routes/            # Express routers
│   └── utils/             # Helper functions
│
└── shared/                # Shared code
    ├── types/             # Shared TypeScript types
    └── utils/             # Shared utilities
```

## 🚀 Features

### Security & Authentication
- ✅ JWT-based authentication with refresh tokens
- ✅ Session guard middleware (prevents back-button access)
- ✅ Admin route protection
- ✅ Frontend route guards with Next.js middleware
- ✅ Cache-control headers to prevent cached protected pages
- ✅ Role-based access control (user/admin)

### Backend Architecture
- **Routes → Controller → Service → Model** pattern
- Session validation on every protected request
- Database role verification
- Automatic token expiration handling

### Frontend Architecture
- TypeScript throughout
- Unified routes file
- Typed API services
- Zustand state management
- Axios interceptors for token management

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecom
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d
```

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
JWT_SECRET=your-super-secret-jwt-key
```

4. Start the development server:
```bash
npm run dev
```

## 🔐 Security Features Explained

### Back-Button Protection

The application implements multiple layers of protection against back-button access:

1. **Backend Session Guard** (`server/middlewares/sessionGuard.js`):
   - Validates JWT on every request
   - Verifies user role from database (not just token)
   - Sets cache-control headers: `no-store, no-cache, must-revalidate`
   - Rejects expired or invalid tokens

2. **Admin Guard** (`server/middlewares/adminGuard.js`):
   - Must be used AFTER sessionGuard
   - Verifies `req.user.role === 'admin'`
   - Returns 403 if not admin

3. **Frontend Middleware** (`client/middleware.ts`):
   - Intercepts requests to protected routes
   - Validates token using `jose` package
   - Redirects unauthorized users
   - Sets cache-control headers

4. **Page-Level Protection**:
   - Protected pages export: `export const revalidate = 0;`
   - Protected pages export: `export const dynamic = 'force-dynamic';`
   - Forces Next.js to always fetch fresh data

### Route Protection Flow

```
User Request → Next.js Middleware → Backend Route → sessionGuard → adminGuard → Controller
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices (protected)

### Users
- `GET /api/users/profile` - Get current user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product by ID (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories (public)
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Orders
- `GET /api/orders/my-orders` - Get user's orders (protected)
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get all orders (admin only)
- `PUT /api/orders/:id` - Update order (admin only)

## 🧪 Testing Security Features

1. **Login as admin** → Navigate to `/admin`
2. **Press back button** → Should NOT access previous page without new token
3. **Logout** → Press back → Cannot enter admin
4. **Login as customer** → Try `/admin` → Should be forbidden (403)
5. **Without login** → Try `/profile` → Should redirect to `/auth/login`
6. **Disable network** → Back button still blocked (cache headers)

## 📦 Key Dependencies

### Backend
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- morgan
- dotenv

### Frontend
- next
- react
- typescript
- axios
- zustand
- jose (JWT verification)

## 🎯 Next Steps

1. Implement UI components in `/client/components`
2. Add product images upload
3. Implement payment gateway
4. Add email notifications
5. Add search functionality
6. Implement product reviews
7. Add analytics dashboard

## 📄 License

MIT
