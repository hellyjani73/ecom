# Testing Checklist - Back-Button Protection & Security

## ✅ Phase 6: Backend Session Guard
- [x] Validates JWT token
- [x] Rejects expired tokens
- [x] Rejects invalid tokens
- [x] Confirms user role from database (not just token)
- [x] Adds user to req.user
- [x] Sets cache-control headers:
  - [x] no-store
  - [x] no-cache
  - [x] must-revalidate
  - [x] proxy-revalidate
  - [x] pragma: no-cache
  - [x] expires: 0
  - [x] Surrogate-Control: no-store

## ✅ Phase 7: Admin Route Protection
- [x] Checks req.user.role === "admin"
- [x] Returns 403 if not admin
- [x] Used AFTER sessionGuard in all admin routes
- [x] All admin routes use: `sessionGuard` → `adminGuard`

## ✅ Phase 8: Frontend Auth Guard (Next.js Middleware)
- [x] Reads token from cookies
- [x] Decodes token using jose package
- [x] Redirects non-admin from /admin to /auth/login
- [x] Redirects unauthenticated from /profile to /auth/login
- [x] Redirects unauthenticated from /cart to /auth/login
- [x] Redirects unauthenticated from /checkout to /auth/login
- [x] Redirects logged-in admin from /auth/login to /admin
- [x] Redirects logged-in user from /auth/login to /profile
- [x] Matcher configured for:
  - [x] /admin/:path*
  - [x] /profile/:path*
  - [x] /checkout
  - [x] /cart
  - [x] /auth/login
  - [x] /auth/register

## ✅ Phase 9: Auth Guard Helper Functions
- [x] getUserFromToken()
- [x] isAdmin()
- [x] isAuthenticated()
- [x] redirectIfNotAdmin()
- [x] redirectIfGuest()
- [x] Uses routes.ts for navigation

## ✅ Phase 10: Cache Control on Protected Pages
- [x] All admin pages export `revalidate = 0`
- [x] All admin pages export `dynamic = "force-dynamic"`
- [x] All protected user pages export `revalidate = 0`
- [x] All protected user pages export `dynamic = "force-dynamic"`
- [x] Next.js config sets cache headers for routes
- [x] Backend sets cache headers in responses

## ✅ Phase 11: Frontend + Backend Connection
- [x] Axios instance with baseURL from env
- [x] Automatic token attachment in request interceptor
- [x] 401 interceptor → logout and redirect
- [x] Zustand store for user info (authStore)
- [x] Zustand store for cart (cartStore)
- [x] All services connected to backend routes

## 🧪 Phase 12: Testing Scenarios

### Test Case 1: Login as Admin → Access /admin
**Steps:**
1. Login as admin user
2. Navigate to `/admin`
3. Should successfully access admin dashboard

**Expected Result:** ✅ Admin dashboard loads

**Status:** Ready to test

---

### Test Case 2: Press Back Key → Should NOT Access Previous Page
**Steps:**
1. Login as admin
2. Navigate to `/admin`
3. Navigate to another page (e.g., `/admin/products`)
4. Press browser back button
5. Should NOT access `/admin` without new token validation

**Expected Result:** ✅ Back button triggers new request, sessionGuard validates token, if expired/invalid → 401

**Status:** Ready to test

**How it works:**
- Cache headers prevent browser from using cached response
- Back button triggers new request
- sessionGuard validates token on every request
- If token expired → 401 → redirect to login

---

### Test Case 3: Logout → Press Back → Cannot Enter Admin
**Steps:**
1. Login as admin
2. Navigate to `/admin`
3. Logout
4. Press browser back button
5. Should NOT access `/admin`

**Expected Result:** ✅ Redirected to login (no token in request)

**Status:** Ready to test

**How it works:**
- Logout clears tokens from localStorage and cookies
- Back button request has no Authorization header
- sessionGuard returns 401
- Frontend middleware redirects to login

---

### Test Case 4: Login as Customer → Try /admin → Forbidden
**Steps:**
1. Login as regular user (role: 'user')
2. Try to navigate to `/admin`
3. Should be forbidden

**Expected Result:** ✅ 403 Forbidden or redirect to login

**Status:** Ready to test

**How it works:**
- Frontend middleware checks role → not admin → redirect
- If somehow reaches backend → sessionGuard validates → adminGuard checks role → 403

---

### Test Case 5: Without Login → Try /profile → Redirect to Login
**Steps:**
1. Without logging in
2. Try to navigate to `/profile`
3. Should redirect to `/auth/login`

**Expected Result:** ✅ Redirected to login page

**Status:** Ready to test

**How it works:**
- Frontend middleware detects no token
- Redirects to `/auth/login?redirect=/profile`

---

### Test Case 6: Disable Network → Back Button Still Blocked
**Steps:**
1. Login as admin
2. Navigate to `/admin`
3. Disable network
4. Press back button
5. Should NOT load cached admin page

**Expected Result:** ✅ Browser cannot load page (no network + no cache)

**Status:** Ready to test

**How it works:**
- Cache headers: `no-store, no-cache` prevent browser caching
- Without network, browser cannot fetch page
- Even if cached, cache headers tell browser not to use it

---

## 🔍 Additional Security Checks

### Backend Route Protection
- [x] All admin routes use `sessionGuard` then `adminGuard`
- [x] All protected user routes use `sessionGuard`
- [x] Public routes (products, categories) don't require auth

### Frontend Route Protection
- [x] Next.js middleware intercepts protected routes
- [x] Token validation happens before page load
- [x] Cache headers set in middleware response

### Token Management
- [x] Tokens stored in localStorage
- [x] Tokens stored in cookies (for SSR)
- [x] Tokens cleared on logout
- [x] 401 response triggers logout

### Database Role Verification
- [x] sessionGuard queries database for user role
- [x] Role checked on every request (not just from token)
- [x] Inactive users rejected

## 📝 Notes

1. **Back-Button Protection Works Because:**
   - Cache headers prevent browser caching
   - Every request validates token
   - Database role check ensures current permissions
   - Frontend middleware validates before page load

2. **Why This is Secure:**
   - Token validation on every request
   - Role checked from database (not just token)
   - Cache headers prevent browser from using old pages
   - Multiple layers of protection (frontend + backend)

3. **Testing Tips:**
   - Use browser DevTools to check cache headers
   - Monitor network tab for 401/403 responses
   - Test with expired tokens
   - Test with invalid tokens
   - Test with no token

## 🚀 Ready for Testing

All phases are complete and ready for testing. The implementation includes:

1. ✅ Backend session guard with cache headers
2. ✅ Admin guard middleware
3. ✅ Frontend Next.js middleware
4. ✅ Auth guard helper functions
5. ✅ Cache control on all protected pages
6. ✅ Axios instance with interceptors
7. ✅ Zustand stores for state management

**Next Step:** Run the application and test all scenarios above.

