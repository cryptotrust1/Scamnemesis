import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request Database Deletion - A Second Chance | ScamNemesis',
  description: 'Request removal from our scammer database and get support for a new beginning. We believe in redemption and second chances. Everyone deserves the opportunity to rebuild their life.',
  keywords: [
    'scammer removal',
    'database deletion',
    'second chance',
    'redemption',
    'rehabilitation',
    'fresh start',
    'criminal record removal',
    'life reintegration',
    'scammer database removal',
    'privacy request',
    'data deletion',
    'new beginning',
    'criminal rehabilitation',
    'support program',
    'reintegration assistance',
    'scamnemesis removal',
    'fraud database removal',
    'redemption program',
    'second chance program',
    'life change support',
  ],
  authors: [{ name: 'ScamNemesis Team' }],
  creator: 'ScamNemesis',
  publisher: 'ScamNemesis',
  openGraph: {
    title: 'Request Database Deletion - A Second Chance | ScamNemesis',
    description: 'Everyone deserves a second chance. Request removal from our database and receive support for life reintegration. We believe in privacy and redemption.',
    url: 'https://scamnemesis.com/scammer-removal',
    siteName: 'ScamNemesis',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://scamnemesis.com/images/scammer-removal-og.jpg',
        width: 1200,
        height: 630,
        alt: 'ScamNemesis Second Chance Program - Request Database Deletion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Request Database Deletion - A Second Chance | ScamNemesis',
    description: 'Everyone deserves a second chance. Request removal from our database and receive support for a new beginning in life.',
    images: ['https://scamnemesis.com/images/scammer-removal-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/scammer-removal',
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
  category: 'Support',
};

export default function ScammerRemovalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
