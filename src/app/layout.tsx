import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    default: 'ScamNemesis - Fraud Prevention & Recovery Platform',
    template: '%s | ScamNemesis',
  },
  description:
    'We help victims of crypto scams and investment frauds. Our team of lawyers, forensic analysts, and ethical hackers provides fraud investigation and money recovery services.',
  keywords: [
    'scam',
    'fraud',
    'crypto scam',
    'investment fraud',
    'money recovery',
    'fraud investigation',
    'scam checker',
    'report scam',
  ],
  authors: [{ name: 'ScamNemesis Team' }],
  creator: 'ScamNemesis',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://scamnemesis.com',
    title: 'ScamNemesis - Fraud Prevention & Recovery Platform',
    description: 'Crypto scam investigation and money recovery services',
    siteName: 'ScamNemesis',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScamNemesis',
    description: 'Fraud Prevention & Recovery Platform',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen flex flex-col font-sans')}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
