import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Our Mission - Help Us Bring Justice and Safety to Everyone | ScamNemesis',
  description: 'Support our mission to protect fraud victims and help reformed offenders rebuild lives. Donate to advance justice, safety, and redemption worldwide. Pay by card or cryptocurrency.',
  keywords: [
    'donate',
    'support mission',
    'nonprofit donation',
    'fraud prevention donation',
    'second chance programs',
    'criminal rehabilitation',
    'victim support',
    'charity',
    'cryptocurrency donation',
    'stripe donation',
    'help fraud victims',
    'support anti-fraud',
    'justice for all',
    'rehabilitation support',
    'reintegration programs',
    'scam prevention funding',
    'cybersecurity nonprofit',
    'social cause',
    'community support',
    'make a difference',
  ],
  openGraph: {
    title: 'Support ScamNemesis - Help Us Fight Fraud & Support Redemption',
    description: 'Your donation protects fraud victims and gives second chances to those seeking redemption. Support both justice and transformation.',
    url: 'https://scamnemesis.com/support-us',
    siteName: 'ScamNemesis',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://scamnemesis.com/images/og/support-us.jpg',
        width: 1200,
        height: 630,
        alt: 'Support ScamNemesis - Fraud Prevention & Redemption Programs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support ScamNemesis - Fight Fraud & Support Redemption',
    description: 'Help protect fraud victims and support reformed offenders. Make an impact with your donation.',
    images: ['https://scamnemesis.com/images/og/support-us.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/support-us',
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
  category: 'Nonprofit',
};

export default function SupportUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
