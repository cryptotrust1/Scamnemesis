import { NextRequest, NextResponse } from 'next/server';
import { i18n, type Locale } from '@/i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // static files
  ) {
    return;
  }

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

  // Redirect to locale-prefixed path
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!_next|api|images|favicon.ico|.*\\..*).*)',
  ],
};
