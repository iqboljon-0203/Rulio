import { NextResponse } from 'next/server';

// Phone/password auth was replaced by Telegram login (/login, /api/telegram/webhook).
export function POST() {
  return NextResponse.json({ error: 'Telegram orqali kiring: /login' }, { status: 410 });
}
