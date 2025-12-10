import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: {
    default: 'ScamNemesis - Ochrana pred podvodníkmi',
    template: '%s | ScamNemesis',
  },
  description: 'Komunitná platforma na nahlasovanie a vyhľadávanie podvodníkov. Chráňte seba aj ostatných pred online podvodmi.',
  keywords: ['podvodník', 'scam', 'fraud', 'nahlásenie', 'databáza podvodníkov', 'ochrana'],
  authors: [{ name: 'ScamNemesis Team' }],
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
    url: 'https://scamnemesis.com',
    siteName: 'ScamNemesis',
    title: 'ScamNemesis - Ochrana pred podvodníkmi',
    description: 'Komunitná platforma na nahlasovanie a vyhľadávanie podvodníkov.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScamNemesis - Ochrana pred podvodníkmi',
    description: 'Komunitná platforma na nahlasovanie a vyhľadávanie podvodníkov.',
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
    <html lang="sk">
      <body className={inter.className}>
        <div className="app-container">
          <Header />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
