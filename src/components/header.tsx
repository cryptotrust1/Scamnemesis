'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { i18n, type Locale } from '@/i18n/config';

const primaryNav = [
  { name: { en: 'Scam Checker', sk: 'Kontrola podvodov', cs: 'Kontrola podvodů', de: 'Betrugscheck' }, href: '/search' },
  { name: { en: 'Report Scam', sk: 'Nahlásiť podvod', cs: 'Nahlásit podvod', de: 'Betrug melden' }, href: '/report/new' },
  { name: { en: 'I was scammed', sk: 'Bol som podvedený', cs: 'Byl jsem podveden', de: 'Ich wurde betrogen' }, href: '/i-was-scammed-need-help' },
];

const secondaryNav = [
  { name: { en: 'Verify service/product', sk: 'Overiť službu/produkt', cs: 'Ověřit službu/produkt', de: 'Service/Produkt prüfen' }, href: '/verify-serviceproduct' },
  { name: { en: 'Scam Prevention', sk: 'Prevencia podvodov', cs: 'Prevence podvodů', de: 'Betrugsprävention' }, href: '/scam-prevention' },
  { name: { en: 'Scammer Removal', sk: 'Odstránenie podvodníkov', cs: 'Odstranění podvodníků', de: 'Betrügerentfernung' }, href: '/scammer-removal' },
  { name: { en: 'Money Recovery', sk: 'Vymáhanie peňazí', cs: 'Vymáhání peněz', de: 'Geldrückgewinnung' }, href: '/money-recovery' },
  { name: { en: 'Training Courses', sk: 'Školenia a kurzy', cs: 'Školení a kurzy', de: 'Schulungen' }, href: '/training-courses' },
  { name: { en: 'Support us', sk: 'Podporte nás', cs: 'Podpořte nás', de: 'Unterstützen Sie uns' }, href: '/support-us' },
  { name: { en: 'Contact us', sk: 'Kontaktujte nás', cs: 'Kontaktujte nás', de: 'Kontaktieren Sie uns' }, href: '/contact-us' },
];

const languages = [
  { code: 'en' as Locale, name: 'English', flag: '🇬🇧' },
  { code: 'sk' as Locale, name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'cs' as Locale, name: 'Čeština', flag: '🇨🇿' },
  { code: 'de' as Locale, name: 'Deutsch', flag: '🇩🇪' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

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

  // Get path without locale prefix
  const getPathWithoutLocale = (): string => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    if (i18n.locales.includes(segments[1] as Locale)) {
      return '/' + segments.slice(2).join('/') || '/';
    }
    return pathname;
  };

  // Navigate to new locale
  const changeLocale = (newLocale: Locale) => {
    console.log('[LanguageSwitch] Changing locale to:', newLocale);
    console.log('[LanguageSwitch] Current pathname:', pathname);

    const pathWithoutLocale = getPathWithoutLocale();
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

    console.log('[LanguageSwitch] Path without locale:', pathWithoutLocale);
    console.log('[LanguageSwitch] New path:', newPath);

    // Store locale preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }

    setLangOpen(false);
    router.push(newPath);
  };

  // Build localized href
  const getLocalizedHref = (href: string): string => {
    return `/${currentLocale}${href}`;
  };

  // Check if current path matches href
  const isActive = (href: string): boolean => {
    const localizedHref = getLocalizedHref(href);
    return pathname === localizedHref || pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={`/${currentLocale}`} className="flex items-center space-x-2">
          <Image
            src="/images/logo-scam-blue.png"
            alt="ScamNemesis"
            width={180}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {/* Primary Nav */}
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={getLocalizedHref(item.href)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-[#0E74FF] text-white'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {item.name[currentLocale]}
            </Link>
          ))}

          {/* Others Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOthersOpen(!othersOpen)}
              onBlur={() => setTimeout(() => setOthersOpen(false), 150)}
              className={cn(
                'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                'text-foreground hover:bg-muted'
              )}
            >
              {{ en: 'Others', sk: 'Ďalšie', cs: 'Další', de: 'Weitere' }[currentLocale]}
              <ChevronDown className={cn('ml-1 h-4 w-4 transition-transform', othersOpen && 'rotate-180')} />
            </button>
            {othersOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-background border rounded-lg shadow-lg py-2 z-50">
                {secondaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={getLocalizedHref(item.href)}
                    className={cn(
                      'block px-4 py-2 text-sm transition-colors',
                      isActive(item.href)
                        ? 'bg-[#0E74FF] text-white'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {item.name[currentLocale]}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Selector - FIXED VERSION */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                console.log('[LanguageSwitch] Dropdown clicked, current state:', langOpen);
                setLangOpen(!langOpen);
              }}
              onBlur={() => setTimeout(() => setLangOpen(false), 200)}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" />
              <span className="mr-1">{languages.find(l => l.code === currentLocale)?.flag}</span>
              {languages.find(l => l.code === currentLocale)?.name}
              <ChevronDown className={cn('ml-1 h-4 w-4 transition-transform', langOpen && 'rotate-180')} />
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-background border rounded-lg shadow-lg py-2 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      console.log('[LanguageSwitch] Language button clicked:', lang.code);
                      changeLocale(lang.code);
                    }}
                    className={cn(
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      currentLocale === lang.code
                        ? 'bg-[#0E74FF] text-white'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Report Button */}
          <Button asChild className="hidden md:inline-flex bg-[#0E74FF] hover:bg-[#0E74FF]/90">
            <Link href={getLocalizedHref('/report/new')}>
              {{ en: 'Report Scam', sk: 'Nahlásiť podvod', cs: 'Nahlásit podvod', de: 'Betrug melden' }[currentLocale]}
            </Link>
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t">
          <nav className="container py-4 space-y-1">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={getLocalizedHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-md text-base font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-[#0E74FF] text-white'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {item.name[currentLocale]}
              </Link>
            ))}
            <div className="border-t my-2" />
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={getLocalizedHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-md text-base font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-[#0E74FF] text-white'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {item.name[currentLocale]}
              </Link>
            ))}
            <div className="border-t my-2" />
            {/* Mobile Language Selector - FIXED */}
            <div className="px-4 py-2">
              <p className="text-sm text-muted-foreground mb-2">
                {{ en: 'Language', sk: 'Jazyk', cs: 'Jazyk', de: 'Sprache' }[currentLocale]}
              </p>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      console.log('[LanguageSwitch] Mobile button clicked:', lang.code);
                      changeLocale(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                      currentLocale === lang.code
                        ? 'bg-[#0E74FF] text-white'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <span>{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
