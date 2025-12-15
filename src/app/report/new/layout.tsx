import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report a Scam — Where to Report Scammers | ScamNemesis',
  description: 'Report scammers and help protect others. ScamNemesis helps victims report fraud, recover lost money, and prevent future scams. Submit detailed reports that reach authorities and investigators.',
  keywords: [
    'report scam',
    'report scammer',
    'fraud report',
    'scam reporting',
    'report fraud',
    'where to report scams',
    'scam recovery',
    'fraud recovery',
    'report online scam',
    'report phone scam',
    'report email scam',
    'report investment fraud',
    'report romance scam',
    'report crypto scam',
    'scam database',
    'fraud database',
    'scam investigation',
    'fraud investigation',
    'victim support',
    'scam prevention',
  ],
  openGraph: {
    title: 'Report a Scam — Where to Report Scammers | ScamNemesis',
    description: 'Report scammers and help protect others. Submit detailed fraud reports that reach authorities, investigators, and our global database of 612M+ records.',
    url: 'https://scamnemesis.com/report/new',
    siteName: 'ScamNemesis',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://scamnemesis.com/images/og-report.jpg',
        width: 1200,
        height: 675,
        alt: 'ScamNemesis Report a Scam Form',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Report a Scam — Where to Report Scammers',
    description: 'Report scammers and help protect others. Submit detailed fraud reports that reach authorities and investigators.',
    site: '@ScamNemesis',
    creator: '@ScamNemesis',
    images: ['https://scamnemesis.com/images/twitter-report.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/report/new',
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

export default function ReportNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
