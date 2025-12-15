import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Get Support & Report Scams | ScamNemesis',
  description: 'Contact ScamNemesis for fraud reporting, inquiries, and support. Get help with crypto scams, investment fraud, and scam recovery. Email us directly or report a scam.',
  keywords: [
    'contact us',
    'contact support',
    'fraud support',
    'scam reporting',
    'report scam',
    'fraud investigation',
    'money recovery',
    'fraud victim help',
    'contact scamnemesis',
    'crypto scam help',
    'investment fraud assistance',
    'email support',
    'customer service',
    'fraud prevention',
    'scam victim support',
    'cybersecurity contact',
    'report online fraud',
    'get help',
    'fraud inquiry',
    'security support',
  ],
  openGraph: {
    title: 'Contact ScamNemesis - Report Fraud & Get Support',
    description: 'Report a scam or fraud directly to our investigation team. Email support and immediate assistance available.',
    url: 'https://scamnemesis.com/contact-us',
    siteName: 'ScamNemesis',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://scamnemesis.com/images/og/contact-us.jpg',
        width: 1200,
        height: 630,
        alt: 'ScamNemesis - Contact Our Support Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact ScamNemesis - Report Fraud',
    description: 'Need help with a scam or fraud? Contact our team of experts. Fraud investigation and victim support available.',
    images: ['https://scamnemesis.com/images/og/contact-us.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/contact-us',
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

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
