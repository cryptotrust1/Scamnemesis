import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cybersecurity Training Courses - Expert-Led Security Education | ScamNemesis',
  description: 'World-class cybersecurity training from top security professionals. Free courses for the public, professional OPSEC videos, and custom corporate training. Prevent fraud and strengthen cyber resilience.',
  keywords: [
    'cybersecurity training',
    'cybersecurity courses',
    'security training',
    'fraud prevention training',
    'OPSEC training',
    'cyber resilience',
    'scam prevention courses',
    'AML specialist training',
    'security awareness',
    'corporate security training',
    'online safety courses',
    'phishing prevention',
    'cyber security education',
    'information security training',
    'security methodology',
    'incident response training',
    'threat intelligence training',
    'digital security courses',
    'professional security videos',
    'security certification',
  ],
  authors: [{ name: 'ScamNemesis Team' }],
  creator: 'ScamNemesis',
  publisher: 'ScamNemesis',
  openGraph: {
    title: 'Cybersecurity Training Courses - Expert-Led Security Education | ScamNemesis',
    description: 'World-class cybersecurity training from top security professionals. Free public courses, professional OPSEC videos, and custom corporate programs.',
    url: 'https://scamnemesis.com/training-courses',
    siteName: 'ScamNemesis',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://scamnemesis.com/images/training-courses-og.jpg',
        width: 1200,
        height: 630,
        alt: 'ScamNemesis Cybersecurity Training Courses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cybersecurity Training Courses | ScamNemesis',
    description: 'Expert-led cybersecurity training. Free courses, professional videos, and custom corporate programs.',
    images: ['https://scamnemesis.com/images/training-courses-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://scamnemesis.com/training-courses',
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
  category: 'Education',
};

export default function TrainingCoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
