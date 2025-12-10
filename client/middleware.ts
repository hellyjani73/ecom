import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

interface DecodedToken {
  id: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as DecodedToken;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.split(' ')[1];

  // Decode token if exists
  let decoded: DecodedToken | null = null;
  if (token) {
    decoded = await verifyToken(token);
  }

  const isAuthenticated = !!decoded;
  const isAdmin = decoded?.role === 'admin';

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (!isAdmin) {
      // Non-admin trying to access admin routes
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Admin accessing admin routes - set no-cache headers
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Protected user routes (profile, cart, checkout)
  if (pathname.startsWith('/profile') || pathname === '/checkout' || pathname === '/cart') {
    if (!isAuthenticated) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Set no-cache headers for protected pages
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Auth routes - redirect if already logged in
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    if (isAuthenticated) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/checkout',
    '/cart',
    '/auth/login',
    '/auth/register',
  ],
};

