/**
 * i18n - Internationalization Module
 *
 * Simple i18n implementation for the Scamnemesis application
 * Supports: Slovak (sk), English (en), Czech (cs), German (de)
 */

import sk from './locales/sk.json';
import en from './locales/en.json';
import cs from './locales/cs.json';
import de from './locales/de.json';

export type Locale = 'sk' | 'en' | 'cs' | 'de';

export const locales: Locale[] = ['sk', 'en', 'cs', 'de'];

export const localeNames: Record<Locale, string> = {
  sk: 'Slovensky',
  en: 'English',
  cs: 'Cesky',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  sk: '🇸🇰',
  en: '🇬🇧',
  cs: '🇨🇿',
  de: '🇩🇪',
};

const translations: Record<Locale, typeof sk> = {
  sk,
  en,
  cs,
  de,
};

export const defaultLocale: Locale = 'en'; // Standardized: English is default for international platform

/**
 * Get the browser's preferred locale
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const browserLang = navigator.language.split('-')[0];

  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  return defaultLocale;
}

/**
 * Get locale from localStorage
 */
export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('locale');
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }

  return null;
}

/**
 * Store locale in localStorage
 */
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
}

/**
 * Get initial locale (stored > browser > default)
 */
export function getInitialLocale(): Locale {
  return getStoredLocale() || getBrowserLocale() || defaultLocale;
}

/**
 * Get translation value by dot-notation path (returns string only)
 */
export function getTranslation(locale: Locale, path: string): string {
  const value = getTranslationValue(locale, path);
  return typeof value === 'string' ? value : path;
}

/**
 * Get any translation value by dot-notation path (returns string, array, or object)
 */
export function getTranslationValue(locale: Locale, path: string): unknown {
  const keys = path.split('.');
  let value: unknown = translations[locale];

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      // Fallback to default locale
      value = translations[defaultLocale];
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return undefined; // Return undefined if not found
        }
      }
      break;
    }
  }

  return value;
}

/**
 * Get all translations for a locale
 */
export function getTranslations(locale: Locale): typeof sk {
  return translations[locale] || translations[defaultLocale];
}

export { sk, en, cs, de };
