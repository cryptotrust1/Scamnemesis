import type { Metadata } from 'next';
import { i18n, type Locale } from '@/i18n/config';
import '../globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { I18nProvider } from '@/lib/i18n/context';

// Use system font stack for reliability - avoids build failures due to font fetch issues
const fontClass = 'font-sans';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    en: 'Is It a Scam? Check Any Website, Person, Company, Phone or Email Instantly | ScamNemesis',
    sk: 'Je to podvod? Overte akúkoľvek webstránku, osobu, firmu, telefón alebo e-mail okamžite | ScamNemesis',
    cs: 'Je to podvod? Zkontrolujte jakoukoliv webovou stránku, osobu, firmu, telefon nebo e-mail okamžitě | ScamNemesis',
    de: 'Ist es Betrug? Überprüfen Sie jede Website, Person, Firma, Telefon oder E-Mail sofort | ScamNemesis',
  };

  const descriptions: Record<string, string> = {
    en: 'Check scams instantly - verify people, websites, companies, job offers, emails, phone numbers, dating profiles. Free real-time protection with 640M+ records from 130+ trusted sources.',
    sk: 'Overte podvody okamžite - skontrolujte osoby, webstránky, firmy, pracovné ponuky, e-maily, telefónne čísla, zoznamovacie profily. Bezplatná ochrana v reálnom čase s 640M+ záznamami.',
    cs: 'Zkontrolujte podvody okamžitě - ověřte lidi, webové stránky, firmy, pracovní nabídky, e-maily, telefonní čísla, seznamovací profily. Bezplatná ochrana v reálném čase s 640M+ záznamy.',
    de: 'Überprüfen Sie Betrug sofort - verifizieren Sie Personen, Websites, Unternehmen, Stellenangebote, E-Mails, Telefonnummern, Dating-Profile. Kostenloser Echtzeitschutz mit 640M+ Datensätzen.',
  };

  return {
    title: {
      default: titles[locale] || titles.en,
      template: '%s | ScamNemesis',
    },
    description: descriptions[locale] || descriptions.en,
    keywords: locale === 'sk'
      ? ['kontrola podvodov', 'prevencia podvodov', 'overenie webu', 'kontrola podvodníka', 'overenie e-mailu', 'kontrola telefónneho čísla', 'nahlásenie podvodu', 'ochrana pred podvodmi', 'kybernetická bezpečnosť', 'kryptomenové podvody', 'phishing', 'romantické podvody', 'investičné podvody', 'krádeže identity', 'overenie firmy', 'online bezpečnosť', 'kontrola IBAN', 'sledovanie blockchainu', 'vymáhanie peňazí', 'digitálna forenzná analýza', 'OSINT', 'due diligence', 'firemné vyšetrovania', 'bezpečnostné školenia']
      : locale === 'cs'
      ? ['kontrola podvodů', 'prevence podvodů', 'ověření webu', 'kontrola podvodníka', 'ověření e-mailu', 'kontrola telefonního čísla', 'nahlášení podvodu', 'ochrana před podvody', 'kybernetická bezpečnost', 'kryptoměnové podvody', 'phishing', 'romantické podvody', 'investiční podvody', 'krádeže identity', 'ověření firmy', 'online bezpečnost', 'kontrola IBAN', 'sledování blockchainu', 'vymáhání peněz', 'digitální forenzní analýza', 'OSINT', 'due diligence', 'firemní vyšetřování', 'bezpečnostní školení']
      : locale === 'de'
      ? ['Betrugscheck', 'Betrugsprävention', 'Website überprüfen', 'Betrüger prüfen', 'E-Mail-Verifizierung', 'Telefonnummer prüfen', 'Betrug melden', 'Betrugsschutz', 'Cybersicherheit', 'Kryptowährungsbetrug', 'Phishing', 'Romance Scam', 'Investitionsbetrug', 'Identitätsdiebstahl', 'Firmenverifizierung', 'Online-Sicherheit', 'IBAN-Prüfung', 'Blockchain-Verfolgung', 'Geldwiederherstellung', 'Digitale Forensik', 'OSINT', 'Due Diligence', 'Unternehmensermittlungen', 'Sicherheitsschulung']
      : ['scam checker', 'fraud prevention', 'verify website', 'scammer check', 'email verification', 'phone number check', 'report scam', 'fraud protection', 'cybersecurity', 'cryptocurrency scams', 'phishing', 'romance scams', 'investment fraud', 'identity theft', 'company verification', 'online safety', 'IBAN check', 'blockchain tracing', 'money recovery', 'digital forensics', 'OSINT', 'due diligence', 'corporate investigations', 'security training'],
    authors: [{ name: 'ScamNemesis Team' }],
    creator: 'ScamNemesis',
    publisher: 'ScamNemesis',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://scamnemesis.com'),
    alternates: {
      canonical: `https://scamnemesis.com/${locale}`,
      languages: {
        'en': 'https://scamnemesis.com/en',
        'sk': 'https://scamnemesis.com/sk',
        'cs': 'https://scamnemesis.com/cs',
        'de': 'https://scamnemesis.com/de',
        'x-default': 'https://scamnemesis.com/en',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'sk' ? 'sk_SK' : locale === 'cs' ? 'cs_CZ' : locale === 'de' ? 'de_DE' : 'en_US',
      alternateLocale: ['en_US', 'sk_SK', 'cs_CZ', 'de_DE'].filter(l => !l.startsWith(locale)),
      url: `https://scamnemesis.com/${locale}`,
      siteName: 'ScamNemesis',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [
        {
          url: 'https://scamnemesis.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'ScamNemesis - Fraud Prevention Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: ['https://scamnemesis.com/og-image.png'],
      creator: '@scamnemesis',
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
    verification: {
      google: 'your-google-verification-code',
    },
    category: 'Security',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fontClass} antialiased`}>
        <I18nProvider initialLocale={locale as 'sk' | 'en' | 'cs' | 'de'}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
