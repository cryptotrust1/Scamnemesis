'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLoggedIn = false,
  userName,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🛡️</span>
          <span className={styles.logoText}>ScamNemesis</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <Link href="/search" className={styles.navLink}>
            Vyhľadávanie
          </Link>
          <Link href="/report" className={styles.navLink}>
            Nahlásiť podvod
          </Link>
          <Link href="/stats" className={styles.navLink}>
            Štatistiky
          </Link>
          <Link href="/about" className={styles.navLink}>
            O projekte
          </Link>
        </nav>

        {/* Auth section */}
        <div className={styles.auth}>
          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>{userName}</span>
              <button onClick={onLogout} className={styles.logoutBtn}>
                Odhlásiť
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/auth/login" className={styles.loginBtn}>
                Prihlásiť
              </Link>
              <Link href="/auth/register" className={styles.registerBtn}>
                Registrovať
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
            <Link href="/search" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              Vyhľadávanie
            </Link>
            <Link href="/report" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              Nahlásiť podvod
            </Link>
            <Link href="/stats" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              Štatistiky
            </Link>
            <Link href="/about" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              O projekte
            </Link>
          </nav>
          <div className={styles.mobileAuth}>
            {isLoggedIn ? (
              <>
                <span className={styles.userName}>{userName}</span>
                <button onClick={onLogout} className={styles.logoutBtn}>
                  Odhlásiť
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={styles.loginBtn} onClick={() => setMobileMenuOpen(false)}>
                  Prihlásiť
                </Link>
                <Link href="/auth/register" className={styles.registerBtn} onClick={() => setMobileMenuOpen(false)}>
                  Registrovať
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
