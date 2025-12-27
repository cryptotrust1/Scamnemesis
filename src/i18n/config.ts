/**
 * i18n Configuration
 *
 * Re-exports from the main i18n module for backwards compatibility.
 * All translations are managed in /src/lib/i18n/
 */

export type Locale = 'sk' | 'en' | 'cs' | 'de';

export const i18n = {
  defaultLocale: 'en' as const,
  locales: ['en', 'sk', 'cs', 'de'] as const,
} as const;

export type I18nConfig = typeof i18n;
