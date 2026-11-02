// Stateless Telegram login + signed session cookies.
// Works in Node.js and Cloudflare Workers (Web Crypto only, no DB needed).
//
// Flow:
//   1. /login opens t.me/<bot>?start=login
//   2. Telegram calls /api/telegram/webhook, the bot replies with a button
//      linking to /auth/telegram?token=<signed, 10 min>
//   3. /auth/telegram verifies the token, sets the `rulio_session` cookie
//      (signed, 30 days) and redirects to /home.

export const SESSION_COOKIE = 'rulio_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const LOGIN_TOKEN_TTL = 60 * 10; // 10 minutes

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface SessionUser {
  id: string; // "tg_<telegram id>"
  telegramId: number;
  name: string;
  username?: string;
}

interface SignedPayload {
  u: TelegramUser;
  exp: number; // unix seconds
  t: 'login' | 'session';
}

const enc = new TextEncoder();

export function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): string {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// One secret for everything, derived from the bot token unless SESSION_SECRET is set.
// Scripts in /scripts use the same derivation, keep them in sync.
function signingSecret(): string | null {
  const token = getBotToken();
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  return token ? `rulio:${token}` : null;
}

async function sign(payload: SignedPayload): Promise<string | null> {
  const secret = signingSecret();
  if (!secret) return null;
  const body = b64url(enc.encode(JSON.stringify(payload)));
  return `${body}.${await hmac(secret, body)}`;
}

async function verify(token: string | undefined | null, type: SignedPayload['t']): Promise<TelegramUser | null> {
  const secret = signingSecret();
  if (!secret || !token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  if (!safeEqual(sig, await hmac(secret, body))) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body)) as SignedPayload;
    if (payload.t !== type) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.u;
  } catch {
    return null;
  }
}

export function createLoginToken(u: TelegramUser) {
  return sign({ u, t: 'login', exp: Math.floor(Date.now() / 1000) + LOGIN_TOKEN_TTL });
}

export function verifyLoginToken(token: string | null) {
  return verify(token, 'login');
}

export function createSessionToken(u: TelegramUser) {
  return sign({ u, t: 'session', exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE });
}

export async function readSession(token: string | undefined | null): Promise<SessionUser | null> {
  const u = await verify(token, 'session');
  if (!u) return null;
  return {
    id: `tg_${u.id}`,
    telegramId: u.id,
    name: [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Haydovchi',
    username: u.username,
  };
}

// Secret Telegram sends back in X-Telegram-Bot-Api-Secret-Token (A-Z, a-z, 0-9, _ and -).
export async function webhookSecret(): Promise<string | null> {
  const token = getBotToken();
  if (!token) return null;
  return (await hmac(`rulio-webhook:${token}`, 'webhook')).slice(0, 48);
}

// ---- Telegram Bot API helpers -------------------------------------------

export async function telegram<T = unknown>(method: string, body?: Record<string, unknown>): Promise<T | null> {
  const token = getBotToken();
  if (!token) return null;
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!data.ok) {
    console.error(`Telegram ${method} failed:`, data.description);
    return null;
  }
  return data.result ?? null;
}

let cachedBotUsername: string | null = null;

export async function getBotUsername(): Promise<string | null> {
  const envVal = process.env.TELEGRAM_BOT_USERNAME;
  if (envVal) {
    const clean = envVal.replace(/^https?:\/\/t\.me\//, '').replace(/^@/, '').replace(/\/$/, '').trim();
    if (clean) return clean;
  }
  if (cachedBotUsername) return cachedBotUsername;
  const me = await telegram<{ username: string }>('getMe');
  cachedBotUsername = me?.username ?? null;
  return cachedBotUsername;
}

// ---- Telegram Mini App (WebApp) ------------------------------------------
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// secret_key = HMAC_SHA256(key="WebAppData", msg=bot_token)
// hash       = hex(HMAC_SHA256(key=secret_key, msg=data_check_string))

async function hmacRaw(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, enc.encode(data));
}

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function verifyWebAppInitData(initData: string, maxAgeSec = 60 * 60 * 24): Promise<TelegramUser | null> {
  const token = getBotToken();
  if (!token || !initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = await hmacRaw(enc.encode('WebAppData'), token);
  const calc = toHex(await hmacRaw(secret, dataCheckString));
  if (!safeEqual(calc, hash)) return null;

  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return null;

  try {
    const u = JSON.parse(params.get('user') || 'null') as TelegramUser | null;
    if (!u?.id) return null;
    return { id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username };
  } catch {
    return null;
  }
}

/** Session user for Route Handlers (reads the cookie from the request). */
export async function sessionFromRequest(request: Request): Promise<SessionUser | null> {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return readSession(m ? decodeURIComponent(m[1]) : null);
}

/** Generates a random 6-digit OTP code for Telegram login. */
export async function createOtpCode(user: TelegramUser): Promise<string> {
  const { kvSet } = await import('./store');
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await kvSet(`otp:${code}`, {
    user,
    exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes
  });
  return code;
}

