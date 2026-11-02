// Minimal .env.local reader for the Telegram scripts (no dependencies).
import { readFileSync, existsSync } from 'node:fs';
import { createHmac } from 'node:crypto';

export function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN topilmadi. .env.local fayliga qo\'shing.');
    process.exit(1);
  }
  return token;
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// Same derivations as src/lib/auth.ts
export function webhookSecret(token) {
  return b64url(createHmac('sha256', `rulio-webhook:${token}`).update('webhook').digest()).slice(0, 48);
}

export function createLoginToken(token, u) {
  const secret = process.env.SESSION_SECRET || `rulio:${token}`;
  const body = b64url(JSON.stringify({ u, t: 'login', exp: Math.floor(Date.now() / 1000) + 600 }));
  return `${body}.${b64url(createHmac('sha256', secret).update(body).digest())}`;
}

export async function tg(token, method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}
