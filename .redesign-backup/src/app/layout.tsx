import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rulio — Haydovchilik guvohnomasi imtihoniga tayyorgarlik",
  description:
    "O'zbekistonda haydovchilik guvohnomasi imtihoniga 100% tayyor bo'ling. 1000+ haqiqiy savollar, 3 tilda qo'llab-quvvatlash, interaktiv mashg'ulotlar.",
  keywords: [
    "prava",
    "haydovchilik guvohnomasi",
    "imtihon",
    "test",
    "YHXBB",
    "yo'l harakati qoidalari",
    "O'zbekiston",
  ],
  openGraph: {
    title: "Rulio — Prava imtihoniga 100% tayyor bo'ling",
    description:
      "Haqiqiy imtihon savollari, xatolar tahlili va interaktiv mashg'ulotlar. Zamonaviy platforma.",
    type: "website",
    locale: "uz_UZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
