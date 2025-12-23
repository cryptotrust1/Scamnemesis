'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';

export default function NotFound() {
  const { t, locale } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          {t('errors.notFoundPage.title')}
        </h2>
        <p className="mt-2 text-gray-600">
          {t('errors.notFoundPage.description')}
        </p>
        <Link
          href={`/${locale}`}
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('errors.notFoundPage.goHome')}
        </Link>
      </div>
    </div>
  );
}
