'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, Globe, User, LogOut, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { i18n, type Locale } from '@/i18n/config';
import { useUser } from '@/lib/auth/user-context';

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

const authTranslations = {
  en: {
    login: 'Log in',
    register: 'Sign up',
    logout: 'Log out',
    profile: 'Profile',
    settings: 'Settings',
    dashboard: 'Dashboard',
  },
  sk: {
    login: 'Prihlásiť sa',
    register: 'Registrovať sa',
    logout: 'Odhlásiť sa',
    profile: 'Profil',
    settings: 'Nastavenia',
    dashboard: 'Prehľad',
  },
  cs: {
    login: 'Přihlásit se',
    register: 'Registrovat se',
    logout: 'Odhlásit se',
    profile: 'Profil',
    settings: 'Nastavení',
    dashboard: 'Přehled',
  },
  de: {
    login: 'Anmelden',
    register: 'Registrieren',
    logout: 'Abmelden',
    profile: 'Profil',
    settings: 'Einstellungen',
    dashboard: 'Dashboard',
  },
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side hydration to complete
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Prevent hydration mismatch by showing default locale until mounted
  const displayLocale = mounted ? currentLocale : i18n.defaultLocale;
  const t = authTranslations[displayLocale] || authTranslations.en;

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
    const pathWithoutLocale = getPathWithoutLocale();
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }

    setLangOpen(false);
    router.push(newPath);
  };

  // Build localized href
  const getLocalizedHref = (href: string): string => {
    return `/${displayLocale}${href}`;
  };

  // Check if current path matches href
  const isActive = (href: string): boolean => {
    const localizedHref = getLocalizedHref(href);
    return pathname === localizedHref || pathname === href;
  };

  // Handle logout
  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
  };

  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!user) return '?';
    const name = user.displayName || user.name || user.email;
    if (!name) return '?';
    const parts = name.split(/[\s@]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get display name
  const getDisplayName = (): string => {
    if (!user) return '';
    return user.displayName || user.name || user.email.split('@')[0];
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={`/${displayLocale}`} className="flex items-center space-x-2 flex-shrink-0">
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
                'px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                isActive(item.href)
                  ? 'bg-[#0E74FF] text-white'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {item.name[displayLocale]}
            </Link>
          ))}

          {/* Others Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOthersOpen(!othersOpen)}
              onBlur={() => setTimeout(() => setOthersOpen(false), 150)}
              className={cn(
                'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                'text-foreground hover:bg-muted'
              )}
            >
              {{ en: 'Others', sk: 'Ďalšie', cs: 'Další', de: 'Weitere' }[displayLocale]}
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
                    {item.name[displayLocale]}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              onBlur={() => setTimeout(() => setLangOpen(false), 200)}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" />
              <span className="mr-1">{languages.find(l => l.code === displayLocale)?.flag}</span>
              <span className="hidden xl:inline">{languages.find(l => l.code === displayLocale)?.name}</span>
              <ChevronDown className={cn('ml-1 h-4 w-4 transition-transform', langOpen && 'rotate-180')} />
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-background border rounded-lg shadow-lg py-2 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLocale(lang.code)}
                    className={cn(
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      displayLocale === lang.code
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

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {authLoading ? (
              // Loading skeleton
              <div className="flex items-center space-x-2">
                <div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
              </div>
            ) : isAuthenticated && user ? (
              // User Menu
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0E74FF] to-blue-700 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    {getUserInitials()}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate hidden xl:block">
                    {getDisplayName()}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-background border rounded-xl shadow-lg py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-foreground truncate">{getDisplayName()}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-3 text-muted-foreground" />
                        {t.dashboard}
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-muted-foreground" />
                        {t.profile}
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                        {t.settings}
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Login/Register Buttons
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {t.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0E74FF] hover:bg-[#0a5fd6] rounded-lg transition-colors shadow-sm"
                >
                  {t.register}
                </Link>
              </>
            )}
          </div>

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
        <div className="lg:hidden border-t bg-background">
          <nav className="container py-4 space-y-1">
            {/* Auth Section - Mobile */}
            {!authLoading && (
              <div className="pb-4 mb-4 border-b">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-3 bg-muted/50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0E74FF] to-blue-700 flex items-center justify-center text-white text-sm font-semibold">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{getDisplayName()}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Mobile Menu Links */}
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
                      {t.dashboard}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3 text-muted-foreground" />
                      {t.profile}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      {t.logout}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/auth/login"
                      className="block px-4 py-3 text-center text-base font-medium text-foreground border border-border rounded-lg hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.login}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-4 py-3 text-center text-base font-medium text-white bg-[#0E74FF] hover:bg-[#0a5fd6] rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.register}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Links */}
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
                {item.name[displayLocale]}
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
                {item.name[displayLocale]}
              </Link>
            ))}
            <div className="border-t my-2" />

            {/* Mobile Language Selector */}
            <div className="px-4 py-2">
              <p className="text-sm text-muted-foreground mb-2">
                {{ en: 'Language', sk: 'Jazyk', cs: 'Jazyk', de: 'Sprache' }[displayLocale]}
              </p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLocale(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                      displayLocale === lang.code
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
