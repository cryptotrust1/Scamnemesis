export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'sk'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
