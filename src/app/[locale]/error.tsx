'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/context';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log to console for debugging
    console.error('Application error:', error);
    // Send to Sentry for monitoring
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">500</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          {t('errors.errorPage.title')}
        </h2>
        <p className="mt-2 text-gray-600">
          {t('errors.errorPage.description')}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('errors.errorPage.tryAgain')}
        </button>
      </div>
    </div>
  );
}
