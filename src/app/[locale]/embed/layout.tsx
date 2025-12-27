/**
 * Embed Layout
 *
 * Minimal layout for embedded widgets - no header/footer
 * Used by /embed/widget/[widgetId]
 */

import type { Metadata } from 'next';
import { type Locale } from '@/i18n/config';
import { I18nProvider } from '@/lib/i18n/context';
import { Providers } from '@/components/providers';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ScamNemesis Widget',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  };
}

export default async function EmbedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <Providers>
      <I18nProvider initialLocale={locale as 'sk' | 'en' | 'cs' | 'de'}>
        <div className="min-h-screen bg-transparent">
          {children}
        </div>
      </I18nProvider>
    </Providers>
  );
}
