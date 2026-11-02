'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getWebApp } from './telegram';

const ROOT_PAGES = ['/home', '/'];
const PUBLIC_PAGES = ['/', '/login', '/register'];

// Runs on every page. Does nothing in a normal browser; inside Telegram it
// signs the user in from initData, wires the native Back button and colours.
export function TelegramProvider() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const authed = useRef(false);

  // One-time setup + automatic sign-in
  useEffect(() => {
    const wa = getWebApp();
    if (!wa) return;
    document.documentElement.classList.add('tg-app');
    try {
      wa.ready();
      wa.expand();
      if (wa.isVersionAtLeast('6.1')) {
        wa.setHeaderColor('#F3F5F9');
        wa.setBackgroundColor('#F3F5F9');
      }
      if (wa.isVersionAtLeast('7.7')) wa.disableVerticalSwipes?.();
    } catch {}

    (async () => {
      const me = await fetch('/api/auth/me').catch(() => null);
      if (!me?.ok) {
        const res = await fetch('/api/auth/telegram-webapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: wa.initData }),
        }).catch(() => null);
        if (!res?.ok) return;
      }
      authed.current = true;
      if (PUBLIC_PAGES.includes(window.location.pathname)) router.replace('/home');
      else router.refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Native Back button on inner pages
  useEffect(() => {
    const wa = getWebApp();
    if (!wa) return;
    const back = () => router.back();
    try {
      if (ROOT_PAGES.includes(pathname)) wa.BackButton.hide();
      else {
        wa.BackButton.show();
        wa.BackButton.onClick(back);
      }
    } catch {}
    return () => {
      try {
        wa.BackButton.offClick(back);
      } catch {}
    };
  }, [pathname, router]);

  return null;
}
