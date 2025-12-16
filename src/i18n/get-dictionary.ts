import 'server-only';
import type { Locale } from './config';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  sk: () => import('./dictionaries/sk.json').then((module) => module.default),
  cs: () => import('./dictionaries/cs.json').then((module) => module.default),
  de: () => import('./dictionaries/de.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};
