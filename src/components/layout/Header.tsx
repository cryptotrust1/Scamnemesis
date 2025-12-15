'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
  locale?: 'en' | 'sk';
}

const translations = {
  en: {
    search: 'Search',
    report: 'Report Scam',
    stats: 'Statistics',
    about: 'About',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
  },
  sk: {
    search: 'Vyhľadávanie',
    report: 'Nahlásiť podvod',
    stats: 'Štatistiky',
    about: 'O projekte',
    login: 'Prihlásiť',
    register: 'Registrovať',
    logout: 'Odhlásiť',
  },
};

export const Header: React.FC<HeaderProps> = ({
  isLoggedIn = false,
  userName,
  onLogout,
  locale = 'en',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = translations[locale] || translations.en;

  // Get current locale from path or use provided locale
  const currentLocale = pathname?.startsWith('/sk') ? 'sk' : pathname?.startsWith('/en') ? 'en' : locale;
  const otherLocale = currentLocale === 'en' ? 'sk' : 'en';

  // Get path without locale prefix for language switch
  const pathWithoutLocale = pathname?.replace(/^\/(en|sk)/, '') || '/';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href={`/${currentLocale}`} className={styles.logo}>
          <span className={styles.logoIcon}>🛡️</span>
          <span className={styles.logoText}>ScamNemesis</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <Link href={`/${currentLocale}/search`} className={styles.navLink}>
            {t.search}
          </Link>
          <Link href={`/${currentLocale}/report/new`} className={styles.navLink}>
            {t.report}
          </Link>
          <Link href={`/${currentLocale}/about`} className={styles.navLink}>
            {t.about}
          </Link>
        </nav>

        {/* Language Switcher & Auth section */}
        <div className={styles.auth}>
          {/* Language Switcher */}
          <Link
            href={`/${otherLocale}${pathWithoutLocale}`}
            className={styles.langSwitch}
            title={otherLocale === 'sk' ? 'Slovenčina' : 'English'}
          >
            {otherLocale.toUpperCase()}
          </Link>

          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>{userName}</span>
              <button onClick={onLogout} className={styles.logoutBtn}>
                {t.logout}
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href={`/${currentLocale}/auth/login`} className={styles.loginBtn}>
                {t.login}
              </Link>
              <Link href={`/${currentLocale}/auth/register`} className={styles.registerBtn}>
                {t.register}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <Link href={`/${currentLocale}/search`} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {t.search}
            </Link>
            <Link href={`/${currentLocale}/report/new`} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {t.report}
            </Link>
            <Link href={`/${currentLocale}/about`} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {t.about}
            </Link>
            {/* Language switcher in mobile */}
            <Link
              href={`/${otherLocale}${pathWithoutLocale}`}
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              🌐 {otherLocale === 'sk' ? 'Slovenčina' : 'English'}
            </Link>
          </nav>
          <div className={styles.mobileAuth}>
            {isLoggedIn ? (
              <>
                <span className={styles.userName}>{userName}</span>
                <button onClick={onLogout} className={styles.logoutBtn}>
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href={`/${currentLocale}/auth/login`} className={styles.loginBtn} onClick={() => setMobileMenuOpen(false)}>
                  {t.login}
                </Link>
                <Link href={`/${currentLocale}/auth/register`} className={styles.registerBtn} onClick={() => setMobileMenuOpen(false)}>
                  {t.register}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
