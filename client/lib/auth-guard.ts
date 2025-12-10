import { jwtVerify } from 'jose';
import routes from '@/routes/routes';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export interface DecodedToken {
  id: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

/**
 * Get user from token stored in cookies or localStorage
 */
export async function getUserFromToken(): Promise<DecodedToken | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Try to get token from localStorage first
    let token = localStorage.getItem('accessToken');
    
    // If not in localStorage, try cookies
    if (!token) {
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find(row => row.startsWith('accessToken='));
      token = tokenCookie?.split('=')[1];
    }

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as DecodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUserFromToken();
  return !!user;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getUserFromToken();
  return user?.role === 'admin';
}

/**
 * Redirect to login if user is not authenticated
 */
export async function redirectIfGuest(): Promise<void> {
  if (typeof window === 'undefined') return;

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    window.location.href = routes.login;
  }
}

/**
 * Redirect to login if user is not admin
 */
export async function redirectIfNotAdmin(): Promise<void> {
  if (typeof window === 'undefined') return;

  const admin = await isAdmin();
  if (!admin) {
    window.location.href = routes.login;
  }
}

/**
 * Get current user role
 */
export async function getUserRole(): Promise<'user' | 'admin' | null> {
  const user = await getUserFromToken();
  return user?.role || null;
}

/**
 * Get current user ID
 */
export async function getUserId(): Promise<string | null> {
  const user = await getUserFromToken();
  return user?.id || null;
}

