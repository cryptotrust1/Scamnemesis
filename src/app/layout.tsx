import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    default: 'Is It a Scam? Check Any Website, Person, Company, Phone or Email Instantly | ScamNemesis',
    template: '%s | ScamNemesis',
  },
  description:
    'Check scams instantly - verify people, websites, companies, job offers, emails, phone numbers, dating profiles, and much more. Enjoy free real-time protection. Found a scam or got scammed? Report it now. Access 640M+ fraud records from 130+ trusted sources including FBI, OFAC, and Interpol.',
  keywords: [
    'scam checker',
    'fraud prevention',
    'verify website',
    'check phone number',
    'email verification',
    'scam database',
    'fraud detection',
    'report scam',
    'money recovery',
    'crypto scam',
    'investment fraud',
    'phishing protection',
    'identity theft',
    'scam alert',
    'fraud investigation',
    'OSINT',
    'due diligence',
    'background check',
    'scammer database',
    'verify person',
    'check company',
    'fraud report',
    'scam prevention',
    'cyber security',
    'online safety',
  ],
  authors: [{ name: 'ScamNemesis Team' }],
  creator: 'ScamNemesis',
  publisher: 'ScamNemesis',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://scamnemesis.com',
    title: 'Is It a Scam? Check Any Website, Person, Company, Phone or Email Instantly | ScamNemesis',
    description:
      'Check scams instantly - verify people, websites, companies, emails, phone numbers. Free real-time protection with 640M+ fraud records from 130+ trusted sources.',
    siteName: 'ScamNemesis',
    images: [
      {
        url: 'https://scamnemesis.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ScamNemesis - Fraud Prevention Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is It a Scam? Check Instantly | ScamNemesis',
    description:
      'Verify people, websites, companies, emails, phone numbers. Free real-time fraud protection with 640M+ records.',
    site: '@scamnemesis',
    creator: '@scamnemesis',
    images: ['https://scamnemesis.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://scamnemesis.com',
  },
  category: 'Security',
  classification: 'Fraud Prevention',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://scamnemesis.com'),
  verification: {
    google: 'google-site-verification-code',
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
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
