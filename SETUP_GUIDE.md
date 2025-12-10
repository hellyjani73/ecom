# Complete Setup Guide

## ✅ Project Structure Created

All folders and files have been created according to the specification:

### ✅ Phase 1: Folder Structure
- `/client` - Next.js frontend with TypeScript
- `/server` - Express.js backend
- `/shared` - Shared types and utilities

### ✅ Phase 2: Routes File
- `/client/routes/routes.ts` - Unified routes file with all paths

### ✅ Phase 3: Types
- `/client/types/auth.types.ts`
- `/client/types/user.types.ts`
- `/client/types/product.types.ts`
- `/client/types/category.types.ts`
- `/client/types/order.types.ts`
- `/client/types/cart.types.ts`

### ✅ Phase 4: Frontend Services
- `/client/services/auth.service.ts`
- `/client/services/user.service.ts`
- `/client/services/product.service.ts`
- `/client/services/category.service.ts`
- `/client/services/order.service.ts`
- `/client/services/cart.service.ts`

### ✅ Phase 5: Backend Structure
- Models, Services, Controllers, Routes all created
- Following: Routes → Controller → Service → Model pattern

### ✅ Phase 6: Session Guard Middleware
- `/server/middlewares/sessionGuard.js`
- Validates JWT
- Rejects expired tokens
- Confirms user role from DB
- Sets cache-control headers

### ✅ Phase 7: Admin Guard Middleware
- `/server/middlewares/adminGuard.js`
- Checks `req.user.role === "admin"`
- Returns 403 if not admin
- Used AFTER sessionGuard

### ✅ Phase 8: Frontend Auth Guard
- `/client/middleware.ts`
- Next.js middleware for route protection
- Token validation using `jose`
- Redirects unauthorized users
- Matches: `/admin/:path*`, `/profile/:path*`, `/checkout`

### ✅ Phase 9: Auth Guard Helper
- `/client/lib/auth-guard.ts`
- `getUserFromToken()`
- `isAdmin()`
- `isAuthenticated()`
- `redirectIfNotAdmin()`
- `redirectIfGuest()`

### ✅ Phase 10: Cache Control
- All admin pages have `revalidate = 0` and `dynamic = "force-dynamic"`
- Protected pages have cache-control headers
- Next.js config sets headers for admin/profile routes

### ✅ Phase 11: Frontend + Backend Connection
- Axios instance with token interceptor
- Zustand stores for auth and cart
- Services connected to backend routes

## 🚀 Quick Start

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Install Frontend Dependencies
```bash
cd client
npm install
```

### 3. Configure Environment Variables

**Backend** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecom
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

**Frontend** (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
JWT_SECRET=your-secret-key
```

### 4. Start MongoDB
```bash
mongod
```

### 5. Start Backend
```bash
cd server
npm start
```

### 6. Start Frontend
```bash
cd client
npm run dev
```

## 🔒 Security Features Implemented

### Back-Button Protection
1. **Backend**: `sessionGuard` validates token on every request
2. **Backend**: `adminGuard` verifies admin role from database
3. **Frontend**: Next.js middleware intercepts protected routes
4. **Frontend**: Pages export `revalidate = 0` and `dynamic = "force-dynamic"`
5. **Headers**: Cache-control headers prevent browser caching

### Route Protection Flow
```
User Request
  ↓
Next.js Middleware (client/middleware.ts)
  ↓
Backend Route
  ↓
sessionGuard (validates JWT + DB role check)
  ↓
adminGuard (if admin route)
  ↓
Controller → Service → Model
```

## 📝 Important Notes

1. **Token Storage**: Tokens are stored in both localStorage and cookies
2. **Token Refresh**: Implement token refresh logic in your components
3. **Error Handling**: Axios interceptor handles 401 and redirects to login
4. **Type Safety**: All services are fully typed with TypeScript
5. **State Management**: Zustand stores persist to localStorage

## 🧪 Testing Checklist

- [ ] Login as admin → access `/admin`
- [ ] Press back button → should NOT access previous page
- [ ] Logout → press back → cannot enter admin
- [ ] Login as customer → try `/admin` → forbidden (403)
- [ ] Without login → try `/profile` → redirect to login
- [ ] Disable network → back button still blocked

## 📦 Next Steps

1. Create UI components in `/client/components`
2. Implement authentication pages (`/auth/login`, `/auth/register`)
3. Build admin dashboard pages
4. Create product listing and detail pages
5. Implement shopping cart UI
6. Add checkout flow

## 🐛 Troubleshooting

### Import Errors
- Make sure `tsconfig.json` has correct paths: `"@/*": ["./*"]`
- Restart TypeScript server in your IDE

### Token Issues
- Check JWT_SECRET matches in both frontend and backend
- Verify token expiration times

### CORS Issues
- Ensure backend has CORS enabled
- Check `NEXT_PUBLIC_API_URL` is correct

### Cache Issues
- Clear browser cache
- Check that cache-control headers are set
- Verify `revalidate = 0` in protected pages

