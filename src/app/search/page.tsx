'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Non-localized /search page - redirects to /en/search
 * This prevents "useI18n must be used within an I18nProvider" errors
 * when users access /search directly without a locale prefix.
 */
export default function SearchRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Get browser language preference and redirect to appropriate locale
    const browserLang = navigator.language?.split('-')[0];
    const supportedLocales = ['en', 'sk', 'cs', 'de'];
    const locale = supportedLocales.includes(browserLang) ? browserLang : 'en';

    // Preserve any search params
    const searchParams = window.location.search;
    router.replace(`/${locale}/search${searchParams}`);
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-600">Redirecting...</p>
    </div>
  );
}
