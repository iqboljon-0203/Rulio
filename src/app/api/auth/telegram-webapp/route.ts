import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, verifyWebAppInitData } from '@/lib/auth';

// Called by the Mini App on open: exchanges Telegram's signed initData for a Rulio session.
export async function POST(request: Request) {
  const { initData } = (await request.json().catch(() => ({}))) as { initData?: string };
  const user = await verifyWebAppInitData(initData || '');
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const session = await createSessionToken(user);
  const secure = new URL(request.url).protocol === 'https:';
  const response = NextResponse.json({ ok: true, name: user.first_name });
  response.cookies.set(SESSION_COOKIE, session ?? '', {
    httpOnly: true,
    secure,
    // Telegram Desktop/Web opens Mini Apps inside an iframe, which needs SameSite=None
    sameSite: secure ? 'none' : 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return response;
}
