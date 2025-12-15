import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Due Diligence & Partner Vetting | ScamNemesis',
  description: 'Expert investigative due diligence for business partners, suppliers & investments. CFE, CAMS, CISA certified specialists. Get your report in 30 days.',
  keywords: [
    'due diligence',
    'business partner vetting',
    'KYB verification',
    'corporate investigation',
    'fraud prevention',
    'M&A screening',
    'supplier verification',
    'UBO verification',
    'AML compliance',
    'risk assessment',
    'business intelligence',
    'OSINT investigation',
    'corporate due diligence',
    'investment screening',
    'vendor vetting',
  ],
  openGraph: {
    title: 'Business Due Diligence & Partner Vetting | ScamNemesis',
    description: 'Expert investigative due diligence for business partners, suppliers & investments. CFE, CAMS certified specialists. 30-day delivery.',
    url: 'https://scamnemesis.com/verify-serviceproduct',
    type: 'website',
    locale: 'en_US',
    siteName: 'ScamNemesis',
    images: [
      {
        url: 'https://scamnemesis.com/images/og-due-diligence.jpg',
        width: 1200,
        height: 630,
        alt: 'ScamNemesis Business Due Diligence and Partner Vetting Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ScamNemesis',
    creator: '@ScamNemesis',
    title: 'Business Due Diligence & Partner Vetting',
    description: 'Expert investigative due diligence for business partners, suppliers & investments. CFE, CAMS certified specialists. 30-day delivery.',
    images: ['https://scamnemesis.com/images/og-due-diligence.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/verify-serviceproduct',
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
  authors: [{ name: 'ScamNemesis' }],
  category: 'Business Services',
};

export default function VerifyServiceProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
