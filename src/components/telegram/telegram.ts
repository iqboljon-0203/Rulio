// Minimal typings + helpers for the Telegram Mini App SDK (telegram-web-app.js).

interface TgBackButton {
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

interface TgWebApp {
  initData: string;
  version: string;
  platform: string;
  ready(): void;
  expand(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  disableVerticalSwipes?: () => void;
  isVersionAtLeast(v: string): boolean;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  BackButton: TgBackButton;
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

/** The Mini App object, only when the page is actually opened inside Telegram. */
export function getWebApp(): TgWebApp | null {
  if (typeof window === 'undefined') return null;
  const wa = window.Telegram?.WebApp;
  return wa && wa.initData ? wa : null;
}

export function isTelegramApp(): boolean {
  return getWebApp() !== null;
}

export function haptic(kind: 'success' | 'error' | 'tap') {
  const h = getWebApp()?.HapticFeedback;
  if (!h) return;
  try {
    if (kind === 'tap') h.impactOccurred('light');
    else h.notificationOccurred(kind);
  } catch {}
}

/** Opens an external page (payment checkout). Inside Telegram it leaves the Mini App open. */
export function openExternal(url: string) {
  const wa = getWebApp();
  if (wa) wa.openLink(url);
  else window.location.href = url;
}
