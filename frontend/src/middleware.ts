import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/api/auth/login', '/api/auth/signup'];

  // API routes that require authentication
  const protectedApiRoutes = ['/api/auth/verify', '/api/auth/me', '/api/user', '/api/onboarding', '/api/dashboard', '/api/profile'];

  // Protected pages
  const protectedPageRoutes = ['/dashboard', '/onboarding'];

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname === '/') {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtectedPage = protectedPageRoutes.some(route => pathname.startsWith(route));
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Redirect to login for protected pages
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Add user info to headers for API routes
    if (isProtectedApi) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user-id', payload.userId as string);
      requestHeaders.set('user-email', payload.email as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error('JWT verification failed:', error);

    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};