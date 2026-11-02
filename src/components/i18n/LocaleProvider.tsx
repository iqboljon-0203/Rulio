'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { defaultLocale, locales, type Locale } from '@/lib/i18n/config';
import { toCyrillic } from '@/lib/i18n/translit';

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** t(uzLatin, russian) — Cyrillic is transliterated from the Latin text. */
  t: (uz: string, ru?: string) => string;
  /** Transliterate content that only exists in Uzbek Latin (questions, explanations). */
  tc: (uz: string) => string;
}

const htmlLang: Record<Locale, string> = { 'uz-lat': 'uz', 'uz-cyr': 'uz-Cyrl', ru: 'ru' };

function translate(locale: Locale, uz: string, ru?: string) {
  if (locale === 'ru') return ru ?? uz;
  if (locale === 'uz-cyr') return toCyrillic(uz);
  return uz;
}

export const LocaleContext = createContext<Ctx>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (uz) => uz,
  tc: (uz) => uz,
});

function readStored(): Locale | null {
  try {
    const s = localStorage.getItem('rulio_locale') as Locale | null;
    if (s && locales.includes(s)) return s;
    const m = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
    if (m && locales.includes(m[1] as Locale)) return m[1] as Locale;
  } catch {
    /* storage blocked */
  }
  return null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const s = readStored();
    if (s) setLocaleState(s);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'rulio_locale' && e.newValue && locales.includes(e.newValue as Locale)) setLocaleState(e.newValue as Locale);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = htmlLang[locale];
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('rulio_locale', l);
      document.cookie = `locale=${l}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (uz, ru) => translate(locale, uz, ru),
      tc: (uz) => (locale === 'uz-cyr' ? toCyrillic(uz) : uz),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
export const useT = () => useContext(LocaleContext).t;
