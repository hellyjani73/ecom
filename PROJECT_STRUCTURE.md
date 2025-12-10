# Project Structure

## Complete File Tree

```
ecom/
├── client/                          # Next.js Frontend (TypeScript)
│   ├── app/                         # Next.js App Router
│   │   ├── admin/
│   │   │   └── page.tsx            # Admin dashboard (protected)
│   │   ├── profile/
│   │   │   └── page.tsx            # User profile (protected)
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── globals.css             # Global styles
│   ├── lib/                        # Utilities
│   │   ├── axios.ts                # Axios instance with interceptors
│   │   └── auth-guard.ts           # Auth helper functions
│   ├── routes/
│   │   └── routes.ts               # Unified routes file
│   ├── services/                   # API services
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   ├── order.service.ts
│   │   └── cart.service.ts
│   ├── store/                      # Zustand stores
│   │   ├── authStore.ts           # Auth state management
│   │   └── cartStore.ts           # Cart state management
│   ├── types/                      # TypeScript interfaces
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── category.types.ts
│   │   ├── order.types.ts
│   │   └── cart.types.ts
│   ├── middleware.ts               # Next.js route protection
│   ├── next.config.js              # Next.js configuration
│   ├── package.json                # Frontend dependencies
│   └── tsconfig.json               # TypeScript config
│
├── server/                         # Express.js Backend
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── middlewares/                # Security middleware
│   │   ├── sessionGuard.js        # JWT validation + cache headers
│   │   └── adminGuard.js           # Admin role check
│   ├── middleware/                # Legacy auth (kept for compatibility)
│   │   └── auth.js
│   ├── models/                     # Mongoose schemas
│   │   ├── Auth.js                 # RefreshToken model
│   │   ├── User.js                 # User model
│   │   ├── Product.js              # Product model
│   │   ├── Category.js             # Category model
│   │   └── Order.js                # Order model
│   ├── services/                   # Business logic
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── productService.js
│   │   ├── categoryService.js
│   │   └── orderService.js
│   ├── controllers/                # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   └── orderController.js
│   ├── routes/                     # Express routers
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── orderRoutes.js
│   ├── utils/
│   │   └── logger.js               # Logging utility
│   ├── server.js                   # Main server file
│   ├── package.json                # Backend dependencies
│   └── tsconfig.json               # TypeScript config
│
├── shared/                         # Shared code
│   ├── types/
│   │   └── index.ts                # Shared TypeScript types
│   └── utils/
│       └── validation.ts           # Shared validation utilities
│
├── package.json                    # Root package.json
├── README.md                       # Main documentation
├── SETUP_GUIDE.md                  # Setup instructions
└── .gitignore                      # Git ignore rules
```

## Architecture Flow

### Request Flow (Protected Route)
```
1. User makes request to /admin
   ↓
2. Next.js middleware.ts intercepts
   - Checks token in cookies
   - Validates with jose
   - Redirects if unauthorized
   ↓
3. Request reaches backend
   ↓
4. Express route handler
   ↓
5. sessionGuard middleware
   - Validates JWT
   - Checks user in database
   - Verifies role
   - Sets cache headers
   ↓
6. adminGuard middleware (if admin route)
   - Checks role === 'admin'
   - Returns 403 if not admin
   ↓
7. Controller
   ↓
8. Service (business logic)
   ↓
9. Model (database)
   ↓
10. Response with cache headers
```

## Key Files for Security

### Backend Security
- `server/middlewares/sessionGuard.js` - Validates every request
- `server/middlewares/adminGuard.js` - Protects admin routes
- All routes use: `sessionGuard` → `adminGuard` → `controller`

### Frontend Security
- `client/middleware.ts` - Next.js route protection
- `client/lib/auth-guard.ts` - Helper functions
- Protected pages export: `revalidate = 0` and `dynamic = 'force-dynamic'`
- `client/next.config.js` - Sets cache headers for routes

### State Management
- `client/store/authStore.ts` - Auth state (Zustand)
- `client/store/cartStore.ts` - Cart state (Zustand)

### API Communication
- `client/lib/axios.ts` - Axios instance with token interceptor
- All services in `client/services/` use typed API calls

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecom
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
JWT_SECRET=your-secret-key
```

## Dependencies

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
- jose

