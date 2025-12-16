'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { i18n, type Locale } from '@/i18n/config';

const footerLinks = {
  services: [
    { name: { en: 'Scam Checker', sk: 'Kontrola podvodov', cs: 'Kontrola podvodů', de: 'Betrugscheck' }, href: '/search' },
    { name: { en: 'Report Scam', sk: 'Nahlásiť podvod', cs: 'Nahlásit podvod', de: 'Betrug melden' }, href: '/report/new' },
    { name: { en: 'Money Recovery', sk: 'Vymáhanie peňazí', cs: 'Vymáhání peněz', de: 'Geldrückgewinnung' }, href: '/money-recovery' },
    { name: { en: 'Verify Service/Product', sk: 'Overiť službu/produkt', cs: 'Ověřit službu/produkt', de: 'Service/Produkt prüfen' }, href: '/verify-serviceproduct' },
  ],
  resources: [
    { name: { en: 'I Was Scammed', sk: 'Bol som podvedený', cs: 'Byl jsem podveden', de: 'Ich wurde betrogen' }, href: '/i-was-scammed-need-help' },
    { name: { en: 'Scam Prevention', sk: 'Prevencia podvodov', cs: 'Prevence podvodů', de: 'Betrugsprävention' }, href: '/scam-prevention' },
    { name: { en: 'Training Courses', sk: 'Školenia a kurzy', cs: 'Školení a kurzy', de: 'Schulungen' }, href: '/training-courses' },
    { name: { en: 'Scammer Removal', sk: 'Odstránenie podvodníkov', cs: 'Odstranění podvodníků', de: 'Betrügerentfernung' }, href: '/scammer-removal' },
  ],
  company: [
    { name: { en: 'About Us', sk: 'O nás', cs: 'O nás', de: 'Über uns' }, href: '/about' },
    { name: { en: 'Contact Us', sk: 'Kontaktujte nás', cs: 'Kontaktujte nás', de: 'Kontaktieren Sie uns' }, href: '/contact-us' },
    { name: { en: 'Support Us', sk: 'Podporte nás', cs: 'Podpořte nás', de: 'Unterstützen Sie uns' }, href: '/support-us' },
  ],
  legal: [
    { name: { en: 'Privacy Policy', sk: 'Ochrana súkromia', cs: 'Ochrana soukromí', de: 'Datenschutz' }, href: '/privacy' },
    { name: { en: 'Terms of Service', sk: 'Podmienky používania', cs: 'Podmínky použití', de: 'Nutzungsbedingungen' }, href: '/terms' },
  ],
};

const sectionTitles = {
  services: { en: 'Services', sk: 'Služby', cs: 'Služby', de: 'Dienste' },
  resources: { en: 'Resources', sk: 'Zdroje', cs: 'Zdroje', de: 'Ressourcen' },
  company: { en: 'Company', sk: 'Spoločnosť', cs: 'Společnost', de: 'Unternehmen' },
};

const descriptions: Record<string, string> = {
  en: 'We help victims of crypto scams and investment frauds. Our team of lawyers, forensic analysts, and ethical hackers provides rapid fraud assistance, scammer investigations, and money recovery support.',
  sk: 'Pomáhame obetiam crypto podvodov a investičných podvodov. Náš tím právnikov, forenzných analytikov a etických hackerov poskytuje rýchlu pomoc pri podvodoch, vyšetrovanie podvodníkov a podporu pri vymáhaní peňazí.',
  cs: 'Pomáháme obětem krypto podvodů a investičních podvodů. Náš tým právníků, forenzních analytiků a etických hackerů poskytuje rychlou pomoc při podvodech, vyšetřování podvodníků a podporu při vymáhání peněz.',
  de: 'Wir helfen Opfern von Krypto-Betrug und Investitionsbetrug. Unser Team aus Anwälten, forensischen Analysten und ethischen Hackern bietet schnelle Betrugshilfe, Betrügerermittlungen und Unterstützung bei der Geldrückgewinnung.',
};

const copyright: Record<string, string> = {
  en: 'All rights reserved.',
  sk: 'Všetky práva vyhradené.',
  cs: 'Všechna práva vyhrazena.',
  de: 'Alle Rechte vorbehalten.',
};

export function Footer() {
  const pathname = usePathname();

  // Get current locale from pathname
  const getCurrentLocale = (): Locale => {
    if (!pathname) return i18n.defaultLocale;
    const segments = pathname.split('/');
    const potentialLocale = segments[1];
    if (i18n.locales.includes(potentialLocale as Locale)) {
      return potentialLocale as Locale;
    }
    return i18n.defaultLocale;
  };

  const currentLocale = getCurrentLocale();

  // Build localized href
  const getLocalizedHref = (href: string): string => {
    return `/${currentLocale}${href}`;
  };

  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href={`/${currentLocale}`} className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/logo-scam-blue.png"
                alt="ScamNemesis"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="font-bold text-xl">ScamNemesis</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              {descriptions[currentLocale]}
            </p>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href="mailto:info@scamnemesis.com"
                className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
              >
                info@scamnemesis.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">{sectionTitles.services[currentLocale]}</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getLocalizedHref(link.href)}
                    className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
                  >
                    {link.name[currentLocale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">{sectionTitles.resources[currentLocale]}</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getLocalizedHref(link.href)}
                    className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
                  >
                    {link.name[currentLocale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{sectionTitles.company[currentLocale]}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getLocalizedHref(link.href)}
                    className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
                  >
                    {link.name[currentLocale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ScamNemesis. {copyright[currentLocale]}
          </p>
          <div className="flex space-x-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={getLocalizedHref(link.href)}
                className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
              >
                {link.name[currentLocale]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
