export const i18n = {
  defaultLocale: 'sk',
  locales: ['sk', 'en', 'cs', 'de'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
