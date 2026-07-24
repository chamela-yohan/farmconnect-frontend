import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';


const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  // Production-grade matcher: 
  // 1. Matches the root path
  // 2. Matches locale-prefixed paths
  // 3. EXCLUDES api routes, _next, _vercel, and static files (like .png, .ico)
  matcher: [
    '/',
    '/(en|si|ta)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};