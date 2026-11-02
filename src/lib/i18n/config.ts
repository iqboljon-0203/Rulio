export type Locale = 'uz-lat' | 'uz-cyr' | 'ru';

export const locales: Locale[] = ['uz-lat', 'uz-cyr', 'ru'];
export const defaultLocale: Locale = 'uz-lat';

export const localeNames: Record<Locale, string> = {
  'uz-lat': "O'zbekcha",
  'uz-cyr': 'Kirillcha',
  'ru': 'Русский',
};

export const localeFlags: Record<Locale, string> = {
  'uz-lat': '🇺🇿',
  'uz-cyr': '🇺🇿',
  'ru': '🇷🇺',
};

export function getLocaleFromCookie(cookieValue?: string): Locale {
  if (cookieValue && locales.includes(cookieValue as Locale)) {
    return cookieValue as Locale;
  }
  return defaultLocale;
}
