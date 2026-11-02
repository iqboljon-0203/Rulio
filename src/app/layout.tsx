import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { SEO_DESCRIPTION, SEO_KEYWORDS, SEO_TITLE, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SEO_TITLE} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: 'Rulio', url: SITE_URL }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'uz_UZ',
    alternateLocale: ['ru_RU'],
    title: 'Prava test 2026 — imtihonga Rulio bilan tayyorlaning',
    description:
      "1250+ rasmiy savol, 63 bilet, imtihon rejimi va xatolar tahlili. Telegram orqali bir bosishda kiring, 5 ta bilet bepul.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prava test 2026 — Rulio',
    description: '1250+ rasmiy savol, 63 bilet, xatolar tahlili. 5 ta bilet bepul.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'education',
  // Google Search Console tasdiqlash kodi kelganda shu yerga qo'shing:
  // verification: { google: 'XXXXXXXX' },
};

export const viewport: Viewport = {
  themeColor: '#F3F5F9',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Telegram Mini App SDK: harmless in a normal browser, enables the bot WebApp */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramProvider />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
