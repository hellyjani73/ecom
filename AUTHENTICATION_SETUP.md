# Authentication System Setup Guide

## Overview
This document describes the complete authentication system implementation for both Admin and Customer users.

## Backend Implementation

### 1. User Model
- **Location**: `server/src/models/userModel.ts`
- **Fields**:
  - `name`: string (required)
  - `email`: string (required, unique, lowercase)
  - `passwordHash`: string (required for local auth)
  - `avatar`: string (optional)
  - `provider`: enum (local, google)
  - `role`: enum (admin, manager, customer)
  - `status`: enum (active, suspended, inactive)
  - `createdAt`, `updatedAt`: timestamps

### 2. Authentication Endpoints
- **POST** `/api/auth/login` - Email/password login
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/google` - Google OAuth login
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/logout` - Logout
- **POST** `/api/auth/changePassword` - Change password (protected)

### 3. Middleware
- **requireAuth**: Validates JWT token and checks user status
- **requireAdmin**: Requires admin role
- **requireManager**: Requires manager or admin role

### 4. Security Features
- **Rate Limiting**: 100 requests per 15 minutes (general), 5 login attempts per 15 minutes (auth)
- **Brute Force Protection**: Account locked after 5 failed attempts for 30 minutes
- **Suspended User Check**: Suspended users cannot login
- **HttpOnly Cookies**: Tokens stored in secure HttpOnly cookies

## Frontend Implementation

### 1. Auth Context
- **Location**: `client/src/contexts/AuthContext.tsx`
- Provides authentication state and methods throughout the app

### 2. Auth Service
- **Location**: `client/src/services/authService.ts`
- Handles all authentication API calls
- Automatic token refresh on 401 errors
- HttpOnly cookie support

### 3. Pages
- **Login Page**: `client/src/pages/Login/index.tsx`
  - Email/password login
  - Google OAuth login
- **Register Page**: `client/src/pages/Register/index.tsx`
  - User registration with role selection
  - Google OAuth registration

### 4. Guards
- **AuthGuard**: `client/src/components/guards/AuthGuard.tsx` - Requires authentication
- **AdminGuard**: `client/src/components/guards/AdminGuard.tsx` - Requires admin role
- **ManagerGuard**: `client/src/components/guards/ManagerGuard.tsx` - Requires manager/admin role

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE=mongodb://localhost:27017/your-database

# JWT Secrets
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Server
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend Configuration
**No environment variables needed!** Configuration is done directly in code:

1. **API URL**: Update `client/src/services/httpClients.ts`
   ```typescript
   export const environment = {
       apiUrl: "http://localhost:3001", // Change this to your API URL
   };
   ```

2. **Google Client ID**: Update `client/src/config/appConfig.ts`
   ```typescript
   export const appConfig = {
       googleClientId: 'your-google-client-id-here', // Add your Google Client ID
   };
   ```

## Installation

### Backend Dependencies
```bash
cd server
npm install
```

New dependencies added:
- `cookie-parser` - For HttpOnly cookie support
- `express-rate-limit` - For rate limiting
- `google-auth-library` - For Google OAuth verification

### Frontend Dependencies
```bash
cd client
npm install
```

New dependencies added:
- `axios` - HTTP client
- `react-router-dom` - Routing (if not already installed)

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production domain
6. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - Your production domain
7. Copy Client ID to environment variables

## Usage Examples

### Backend - Protect a route
```typescript
import { requireAuth, requireAdmin } from '../middleware/middleware';

router.get('/admin/users', requireAdmin, userController.getUsers);
```

### Frontend - Use auth context
```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use authentication state
};
```

### Frontend - Protect a route
```typescript
import { AuthGuard } from '../components/guards/AuthGuard';

<Route path="/dashboard" element={
  <AuthGuard>
    <Dashboard />
  </AuthGuard>
} />
```

## Token Management

- **Access Token**: Short-lived (15 minutes), stored in HttpOnly cookie
- **Refresh Token**: Long-lived (7 days), stored in HttpOnly cookie
- Automatic refresh on 401 errors
- Tokens automatically included in requests via axios interceptors

## Security Best Practices

1. **Never expose tokens** in localStorage or sessionStorage
2. **Use HttpOnly cookies** to prevent XSS attacks
3. **Implement CSRF protection** in production
4. **Use HTTPS** in production
5. **Rotate secrets** regularly
6. **Monitor failed login attempts**
7. **Implement account lockout** (already implemented)

## Testing

### Test Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Test Google Login
```bash
POST /api/auth/google
{
  "accessToken": "google-access-token"
}
```

### Test Refresh Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "refresh-token-here"
}
```

## Notes

- The system maintains backward compatibility with existing user model fields
- Legacy fields (userType, vendorId, moduleIds) are still supported
- The new role-based system works alongside the existing system
- All tokens are stored in HttpOnly cookies for security

