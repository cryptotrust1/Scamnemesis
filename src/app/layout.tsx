import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Scamnemesis - Platforma na hlásenie podvodov',
    template: '%s | Scamnemesis',
  },
  description:
    'Platforma na hlásenie a sledovanie podvodov s využitím umelej inteligencie a pokročilých algoritmov detekcie duplikátov.',
  keywords: [
    'podvody',
    'scam',
    'fraud',
    'hlásenie podvodov',
    'detekcia duplikátov',
    'AI',
    'machine learning',
    'bezpečnosť',
  ],
  authors: [{ name: 'Scamnemesis Team' }],
  creator: 'Scamnemesis',
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
    url: 'https://scamnemesis.com',
    title: 'Scamnemesis - Platforma na hlásenie podvodov',
    description: 'Hlásenie a sledovanie podvodov s využitím umelej inteligencie',
    siteName: 'Scamnemesis',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scamnemesis',
    description: 'Platforma na hlásenie podvodov s AI',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen flex flex-col')}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
