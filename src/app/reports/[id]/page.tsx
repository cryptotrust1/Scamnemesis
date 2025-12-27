'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Redirect component for legacy /reports/[id] URLs
 * Redirects to the new locale-prefixed /[locale]/reports/[id] URL
 */
export default function ReportRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  useEffect(() => {
    if (reportId) {
      // Detect browser language
      const browserLang = navigator.language?.split('-')[0] || 'en';
      const supportedLocales = ['sk', 'en', 'cs', 'de'];
      const locale = supportedLocales.includes(browserLang) ? browserLang : 'en';

      // Redirect to locale-prefixed URL
      router.replace(`/${locale}/reports/${reportId}`);
    }
  }, [reportId, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E74FF] mx-auto mb-4"></div>
        <p className="text-slate-600">Presmerovanie...</p>
      </div>
    </div>
  );
}
