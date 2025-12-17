'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

export interface FooterProps {
  locale?: 'en' | 'sk';
}

const translations = {
  en: {
    description: 'We protect the community from scammers. Report, search, and stay informed.',
    quickLinks: 'Quick Links',
    search: 'Search',
    report: 'Report Scam',
    stats: 'Statistics',
    verify: 'Quick Verification',
    information: 'Information',
    about: 'About',
    faq: 'FAQ',
    apiDocs: 'API Documentation',
    contact: 'Contact',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    gdpr: 'GDPR',
    copyright: 'All rights reserved.',
  },
  sk: {
    description: 'Chránime komunitu pred podvodníkmi. Nahlasujte, vyhľadávajte a buďte informovaní.',
    quickLinks: 'Rýchle odkazy',
    search: 'Vyhľadávanie',
    report: 'Nahlásiť podvod',
    stats: 'Štatistiky',
    verify: 'Rýchle overenie',
    information: 'Informácie',
    about: 'O projekte',
    faq: 'FAQ',
    apiDocs: 'API dokumentácia',
    contact: 'Kontakt',
    legal: 'Právne',
    privacy: 'Ochrana súkromia',
    terms: 'Podmienky používania',
    gdpr: 'GDPR',
    copyright: 'Všetky práva vyhradené.',
  },
};

// Static year to prevent hydration mismatch
const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC<FooterProps> = ({ locale = 'en' }) => {
  const pathname = usePathname();
  const currentLocale = pathname?.startsWith('/sk') ? 'sk' : pathname?.startsWith('/en') ? 'en' : locale;
  const t = translations[currentLocale] || translations.en;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main footer content */}
        <div className={styles.grid}>
          {/* Brand section */}
          <div className={styles.brand}>
            <Link href={`/${currentLocale}`} className={styles.logo}>
              <span className={styles.logoIcon}>🛡️</span>
              <span className={styles.logoText}>ScamNemesis</span>
            </Link>
            <p className={styles.description}>
              {t.description}
            </p>
          </div>

          {/* Quick links */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkGroupTitle}>{t.quickLinks}</h4>
            <nav className={styles.links}>
              <Link href={`/${currentLocale}/search`} className={styles.link}>{t.search}</Link>
              <Link href={`/${currentLocale}/report/new`} className={styles.link}>{t.report}</Link>
              <Link href={`/${currentLocale}/support-us`} className={styles.link}>{currentLocale === 'sk' ? 'Podporte nás' : 'Support Us'}</Link>
              <Link href={`/${currentLocale}/training-courses`} className={styles.link}>{currentLocale === 'sk' ? 'Školenia' : 'Training'}</Link>
            </nav>
          </div>

          {/* Info links */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkGroupTitle}>{t.information}</h4>
            <nav className={styles.links}>
              <Link href={`/${currentLocale}/about`} className={styles.link}>{t.about}</Link>
              <Link href={`/${currentLocale}/money-recovery`} className={styles.link}>{currentLocale === 'sk' ? 'Vymáhanie peňazí' : 'Money Recovery'}</Link>
              <Link href={`/${currentLocale}/scammer-removal`} className={styles.link}>{currentLocale === 'sk' ? 'Vyšetrovania' : 'Investigations'}</Link>
              <Link href={`/${currentLocale}/contact-us`} className={styles.link}>{t.contact}</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkGroupTitle}>{t.legal}</h4>
            <nav className={styles.links}>
              <Link href={`/${currentLocale}/privacy`} className={styles.link}>{t.privacy}</Link>
              <Link href={`/${currentLocale}/terms`} className={styles.link}>{t.terms}</Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {CURRENT_YEAR} ScamNemesis. {t.copyright}
          </p>
          <div className={styles.social}>
            <a
              href="https://github.com/scamnemesis"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/scamnemesis"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Twitter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
