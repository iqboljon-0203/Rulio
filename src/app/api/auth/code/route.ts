import { NextResponse } from 'next/server';
import { createSessionToken, getBotToken, SESSION_COOKIE, SESSION_MAX_AGE, TelegramUser } from '@/lib/auth';
import { kvGet, kvSet, kvDel, kvIncrTtl } from '@/lib/store';

// PUT: Registers an OTP code (from bot / webhook)
export async function PUT(request: Request) {
  const token = getBotToken();
  const auth = request.headers.get('authorization') || '';
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { code, user } = (await request.json().catch(() => ({}))) as { code?: string; user?: TelegramUser };
  if (!code || !user?.id) {
    return NextResponse.json({ ok: false, error: 'invalid_data' }, { status: 400 });
  }

  await kvSet(`otp:${code}`, {
    user,
    exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes
  });

  return NextResponse.json({ ok: true, code });
}

// POST: Verifies an OTP code (from /login web page)
export async function POST(request: Request) {
  // Brute-force guard: max 8 attempts per IP per 10 minutes.
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const tries = await kvIncrTtl(`otp_try:${ip}`, 600);
  if (tries > 8) {
    return NextResponse.json({ ok: false, error: "Juda ko'p urinish. 10 daqiqadan keyin qayta urinib ko'ring." }, { status: 429 });
  }

  const { code } = (await request.json().catch(() => ({}))) as { code?: string };
  const clean = (code || '').trim().replace(/\D/g, '');

  if (clean.length !== 6) {
    return NextResponse.json({ ok: false, error: "Kod 6 ta raqamdan iborat bo'lishi kerak" }, { status: 400 });
  }

  const data = await kvGet<{ user: TelegramUser; exp: number }>(`otp:${clean}`);
  if (!data) {
    return NextResponse.json({ ok: false, error: "Kod noto'g'ri yoki eskirgan. Botdan yangi kod oling." }, { status: 400 });
  }

  if (data.exp < Math.floor(Date.now() / 1000)) {
    await kvDel(`otp:${clean}`);
    return NextResponse.json({ ok: false, error: "Kod muddati eskirgan. Botdan yangi kod oling." }, { status: 400 });
  }

  // One-time code: delete after use
  await kvDel(`otp:${clean}`);

  const user = data.user;
  const session = await createSessionToken(user);
  const secure = new URL(request.url).protocol === 'https:';

  const response = NextResponse.json({ ok: true, name: user.first_name, redirect: '/home' });
  response.cookies.set(SESSION_COOKIE, session ?? '', {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return response;
}
