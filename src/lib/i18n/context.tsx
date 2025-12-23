'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Locale,
  defaultLocale,
  getInitialLocale,
  setStoredLocale,
  getTranslation,
  getTranslations,
} from './index';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  translations: ReturnType<typeof getTranslations>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate with stored/browser locale on client, and sync with URL locale changes
  useEffect(() => {
    if (initialLocale) {
      // URL locale takes priority - sync state with URL
      setLocaleState(initialLocale);
    } else {
      // No URL locale - use stored/browser preference
      setLocaleState(getInitialLocale());
    }
    setIsHydrated(true);
  }, [initialLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      let translation = getTranslation(locale, path);

      // Replace parameters like {{name}} with values
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          translation = translation.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
      }

      return translation;
    },
    [locale]
  );

  const translations = useMemo(() => getTranslations(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      translations,
    }),
    [locale, setLocale, t, translations]
  );

  // Prevent flash of wrong locale during hydration
  if (!isHydrated) {
    return (
      <I18nContext.Provider value={value}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Simple hook that only returns the translation function
 * Use this when you don't need locale switching capabilities
 */
export function useTranslation() {
  const { t, locale, translations } = useI18n();
  return { t, locale, translations };
}
