// Single place for SEO copy and keywords (uz-Latin, uz-Cyrillic, ru).

// Must match the primary domain in Vercel (rulio.uz currently redirects to www.rulio.uz).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rulio.uz').replace(/\/$/, '');
export const SITE_NAME = 'Rulio';

export const SEO_TITLE = 'Prava test 2026 — YHQ imtihon savollari va biletlari onlayn';
export const SEO_DESCRIPTION =
  "Prava imtihoniga onlayn tayyorlaning: YHXBB rasmiy bazasidagi 1250+ test savoli, 63 bilet, 25 daqiqalik imtihon rejimi va xatolar tahlili. Lotin va kirill alifbosida, interfeys rus tilida ham. 5 ta bilet bepul.";

export const SEO_KEYWORDS = [
  // uz (lotin)
  'prava test',
  'prava test 2026',
  'prava test savollari',
  'prava test savollari 2026',
  'prava imtihon',
  'prava olish',
  'prava biletlari',
  'biletlar javoblari',
  'avtotest',
  'avto test uz',
  'onlayn test prava',
  'yhq test',
  'yhq biletlari',
  "yo'l harakati qoidalari test",
  "yo'l harakati qoidalari 2026",
  'haydovchilik guvohnomasi imtihon',
  'haydovchilik guvohnomasi test',
  'nazariy imtihon',
  'YHXBB test',
  'B toifa test',
  'avtomaktab test',
  "yo'l belgilari test",
  // uz (kirill)
  'права тест',
  'ЙҲҚ тест',
  'ҳайдовчилик гувоҳномаси',
  'йўл ҳаракати қоидалари',
  // ru
  'тесты ПДД Узбекистан',
  'тесты ПДД 2026',
  'экзамен на права Узбекистан',
  'билеты ПДД Узбекистан',
  'автотест Узбекистан',
];
