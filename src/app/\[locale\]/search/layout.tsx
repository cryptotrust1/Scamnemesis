import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Scam Checker — Verify People, Websites, Phone Numbers, Emails & More | ScamNemesis',
  description: 'Free scam detection tool. Instantly verify phone numbers, emails, websites, people, bank accounts, IBAN, crypto wallets, and more. Search our database of 612M+ reported scams and fraud cases.',
  keywords: [
    'scam checker',
    'fraud detection',
    'phone number verification',
    'email scam check',
    'website legitimacy',
    'crypto scam',
    'bank scam',
    'IBAN verification',
    'person lookup',
    'company verification',
    'KYB',
    'fraud database',
    'scam report',
    'romance scam',
    'phishing detection',
    'investment fraud',
    'due diligence',
    'background check',
  ],
  openGraph: {
    title: 'Free Scam Checker — Verify People, Websites, Phone Numbers & More',
    description: 'Most advanced platform for scam detection. Verify phone numbers, emails, websites, bank accounts, crypto wallets in seconds. 130+ data sources, 612M+ records.',
    url: 'https://scamnemesis.com/search',
    siteName: 'ScamNemesis',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://scamnemesis.com/images/og-search.jpg',
        width: 1200,
        height: 675,
        alt: 'ScamNemesis Free Scam Checker Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Scam Checker — Verify People, Websites, Phone Numbers & More',
    description: 'Most advanced platform for scam detection. Verify phone numbers, emails, websites, bank accounts, crypto wallets in seconds.',
    site: '@ScamNemesis',
    creator: '@ScamNemesis',
    images: ['https://scamnemesis.com/images/twitter-search.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/search',
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

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
