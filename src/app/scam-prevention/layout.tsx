import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comprehensive Anti-Scam Guide: Prevention, Detection & Recovery | ScamNemesis',
  description: 'Your complete guide to identifying scam threats, preventing financial losses, and responding effectively to fraud. Learn 12 scam categories, warning signs, evidence collection, and fund recovery procedures.',
  keywords: [
    'scam prevention',
    'anti-scam guide',
    'fraud protection',
    'how to avoid scams',
    'scam warning signs',
    'fraud recovery',
    'investment fraud',
    'romance scams',
    'phishing attacks',
    'e-commerce fraud',
    'tech support scams',
    'employment scams',
    'lottery scams',
    'charity fraud',
    'government impersonation',
    'evidence collection',
    'fund recovery',
    'report scam',
    'scam categories',
    'online fraud prevention',
    'financial fraud',
    'identity theft protection',
    'scam detection',
    'fraud awareness',
  ],
  authors: [{ name: 'ScamNemesis Security Team' }],
  creator: 'ScamNemesis',
  publisher: 'ScamNemesis',
  openGraph: {
    title: 'Comprehensive Anti-Scam Guide: Prevention, Detection & Recovery',
    description: 'Your practical security guide to identifying threats, preventing financial losses, and responding effectively to fraud. Knowledge and preparation are your strongest defenses.',
    url: 'https://scamnemesis.com/scam-prevention',
    siteName: 'ScamNemesis',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: 'https://scamnemesis.com/images/scam-prevention-guide-og.jpg',
        width: 1200,
        height: 630,
        alt: 'ScamNemesis Comprehensive Anti-Scam Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comprehensive Anti-Scam Guide | ScamNemesis',
    description: 'Complete guide to scam prevention, detection, and recovery. Learn to protect yourself from 12 types of fraud.',
    images: ['https://scamnemesis.com/images/scam-prevention-guide-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/scam-prevention',
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
  category: 'Security',
};

export default function ScamPreventionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
