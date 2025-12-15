import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Money Recovery Service - Professional Fraud Investigation | ScamNemesis',
  description: 'Get quick and effective help after being scammed. Professional fraud investigation with blockchain analysis, forensic tracking, and legal assessment. €600 transparent pricing - no empty promises.',
  keywords: [
    'money recovery',
    'fraud investigation',
    'scam recovery',
    'crypto scam recovery',
    'blockchain forensics',
    'investment fraud recovery',
    'funds recovery service',
    'forensic investigation',
    'OSINT investigation',
    'fraud analysis',
    'scam investigation',
    'money recovery service',
    'cryptocurrency recovery',
    'financial fraud recovery',
    'evidence collection',
    'legal assessment',
    'fraud mapping',
    'transaction tracing',
    'asset recovery',
    'scam report',
  ],
  authors: [{ name: 'ScamNemesis Team' }],
  creator: 'ScamNemesis',
  publisher: 'ScamNemesis',
  openGraph: {
    title: 'Money Recovery Service - Professional Fraud Investigation | ScamNemesis',
    description: 'Professional fraud investigation combining blockchain analysis, OSINT, and legal coordination. Recover from crypto scams and investment fraud. €600 transparent pricing.',
    url: 'https://scamnemesis.com/money-recovery',
    siteName: 'ScamNemesis',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://scamnemesis.com/images/money-recovery-og.jpg',
        width: 1200,
        height: 630,
        alt: 'ScamNemesis Money Recovery Service - Professional Fraud Investigation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Money Recovery Service | ScamNemesis',
    description: 'Professional fraud investigation & blockchain forensics for scam recovery. €600 transparent pricing - real work, no empty promises.',
    images: ['https://scamnemesis.com/images/money-recovery-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/money-recovery',
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
  category: 'Services',
};

export default function MoneyRecoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
