import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investigative Due Diligence & Business Partner Vetting | ScamNemesis',
  description: 'Professional investigative due diligence services. Verify business partners, suppliers, and investments before you engage. Expert-led investigations with CFE, CAMS, CISA, CISM, OSCP certified specialists. 360 intelligence profile delivered within 30 days.',
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
    title: 'Investigative Due Diligence & Business Partner Vetting | ScamNemesis',
    description: 'Mitigate Risk Before You Engage: Verify the Integrity of Your Next Business Partner, Supplier, or Investment. Expert-led investigations with certified specialists.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ScamNemesis',
    images: [
      {
        url: '/images/og-due-diligence.jpg',
        width: 1200,
        height: 630,
        alt: 'ScamNemesis Due Diligence Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Investigative Due Diligence & Business Partner Vetting',
    description: 'Mitigate Risk Before You Engage. Expert-led corporate investigations with CFE, CAMS, CISA certified specialists.',
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
};

export default function VerifyServiceProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
