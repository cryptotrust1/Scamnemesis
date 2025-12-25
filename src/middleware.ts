import { NextRequest, NextResponse } from 'next/server';
import { i18n, type Locale } from '@/i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
    '/scam-prevention',
    '/scammer-removal',
    '/search',
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (.png, .jpg, .css, .js, etc.)
     */
    '/((?!api/|_next/|images/|favicon.ico).*)',
  ],
};
