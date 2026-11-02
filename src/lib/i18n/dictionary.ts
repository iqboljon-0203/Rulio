import type { Locale } from './config';
import uzLat from './uz-lat.json';
import uzCyr from './uz-cyr.json';
import ru from './ru.json';

const dictionaries: Record<Locale, typeof uzLat> = {
  'uz-lat': uzLat,
  'uz-cyr': uzCyr,
  'ru': ru,
};

export type Dictionary = typeof uzLat;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries['uz-lat'];
}

/** Get a nested translation key like "nav.home" */
export function t(dict: Dictionary, key: string): string {
  const keys = key.split('.');
  let result: unknown = dict;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key; // fallback to key if not found
    }
  }
  return typeof result === 'string' ? result : key;
}
