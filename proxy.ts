import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

// Initialize the next-intl middleware
const intlMiddleware = createMiddleware(routing);

// ✅ Next.js 16 requires the exported function to be named 'proxy'
export default function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Only match paths that need locale handling
  matcher: ['/', '/(en|si|ta)/:path*']
};