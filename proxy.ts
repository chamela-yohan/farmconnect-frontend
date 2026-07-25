import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the path contains '/admin' (handles /admin, /en/admin, /si/admin, etc.)
  if (pathname.includes('/admin')) {
    // Get the user's role from the cookie (ensure this is set during login)
    const userRole = request.cookies.get('user_role')?.value;

    if (userRole !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/'; // Redirect to home
      url.searchParams.set('error', 'Access Denied: Admin privileges required.');
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(en|si|ta)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};