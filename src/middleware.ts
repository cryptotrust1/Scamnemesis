import { NextRequest, NextResponse } from 'next/server';
import { i18n, type Locale } from '@/i18n/config';

/**
 * Check if request has any authentication credentials
 * This is a lightweight check that doesn't require database access
 */
function hasAuthCredentials(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key');
  const accessToken = request.cookies.get('access_token')?.value;

  return !!(authHeader || apiKeyHeader || accessToken);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API routes that require authentication - check auth BEFORE route handler loads
  // This prevents 500 errors from route handler module loading issues
  if (pathname.startsWith('/api/v1/user/api-keys')) {
    if (!hasAuthCredentials(request)) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    // Has credentials - proceed to route handler for full validation
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // List of root-level routes that should NOT be redirected (they exist at root level)
  const rootRoutes = [
    '/',
    '/about',
    '/contact',
    '/contact-us',
    '/dashboard',
    '/i-was-scammed-need-help',
    '/money-recovery',
    '/privacy',
    '/profile',
    '/scam-prevention',
    '/scammer-removal',
    '/search',
    '/settings',
    '/support-us',
    '/terms',
    '/training-courses',
    '/verify-serviceproduct',
  ];

  // Routes that should NOT be redirected (check with startsWith for nested routes)
  const rootPrefixes = [
    '/auth',      // All auth routes: /auth/login, /auth/register, /auth/verify-email, etc.
    '/report',    // Report routes
    '/admin',     // Admin routes
  ];

  // Check if route matches root routes or prefixes
  const isRootRoute = rootRoutes.includes(pathname);
  const hasRootPrefix = rootPrefixes.some(prefix => pathname.startsWith(prefix));

  // If it's not a root route, redirect to locale-prefixed path
  if (!isRootRoute && !hasRootPrefix) {
    // Detect locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    let locale: Locale = i18n.defaultLocale;

    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map((lang) => lang.split(';')[0].trim().toLowerCase())
        .find((lang) => {
          const langCode = lang.split('-')[0];
          return i18n.locales.includes(langCode as Locale);
        });

      if (preferredLocale) {
        const langCode = preferredLocale.split('-')[0] as Locale;
        if (i18n.locales.includes(langCode)) {
          locale = langCode;
        }
      }
    }

    // Redirect to locale-prefixed path with query params preserved
    const url = new URL(`/${locale}${pathname}`, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (.png, .jpg, .css, .js, etc.)
     *
     * Note: We include /api/v1/user/api-keys/* routes for auth pre-check
     *
     * Using valid path-to-regexp patterns instead of regex with lookahead
     * which is not fully supported by Next.js middleware matchers.
     */
    '/api/v1/user/api-keys',
    '/api/v1/user/api-keys/:path*',
    '/(en|sk|cs|de|ru|uk|pl|hu|ro|bg|hr|sl|sr|bs|mk|sq|el|tr|ar|he|zh|ja|ko|vi|th|id|ms|hi|bn|ta|te|ml|kn|gu|mr|pa|ur|fa|az|ka|hy|be|et|fi|lt|lv|nl|no|sv|da|pt|es|fr|it)/:path*',
  ],
};
