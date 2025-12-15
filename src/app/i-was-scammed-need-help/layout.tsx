import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'I Was Scammed: Get Your Money Back — 7-Step Recovery Guide | ScamNemesis',
  description: 'Comprehensive guide for scam victims. Learn exactly what to do after being scammed, how to recover lost money, report fraud to authorities, and protect yourself from recovery scams.',
  keywords: [
    'i was scammed',
    'scam recovery',
    'get money back from scammer',
    'fraud victim help',
    'report scam',
    'scam recovery steps',
    'money recovery',
    'fraud recovery guide',
    'what to do after scam',
    'scam victim support',
    'report fraud',
    'scam recovery services',
    'how to recover from scam',
    'scam help',
    'fraud victim resources',
    'recover stolen money',
    'crypto scam recovery',
    'investment fraud help',
    'romance scam help',
    'online scam recovery',
  ],
  openGraph: {
    title: 'I Was Scammed: Get Your Money Back — 7-Step Recovery Guide',
    description: 'Comprehensive guide for scam victims. Learn exactly what to do after being scammed to maximize recovery chances.',
    url: 'https://scamnemesis.com/i-was-scammed-need-help',
    siteName: 'ScamNemesis',
    type: 'article',
    locale: 'en_US',
    images: [
      {
        url: 'https://scamnemesis.com/images/og-scam-recovery.jpg',
        width: 1200,
        height: 675,
        alt: 'ScamNemesis - I Was Scammed Recovery Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I Was Scammed: Get Your Money Back — 7-Step Recovery Guide',
    description: 'Comprehensive guide for scam victims with step-by-step recovery process.',
    site: '@ScamNemesis',
    creator: '@ScamNemesis',
    images: ['https://scamnemesis.com/images/twitter-scam-recovery.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/i-was-scammed-need-help',
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
};

export default function IWasScammedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
