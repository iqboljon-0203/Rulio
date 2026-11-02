import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, verifyLoginToken } from '@/lib/auth';

// The bot's "Rulio'ga kirish" button lands here.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = await verifyLoginToken(url.searchParams.get('token'));

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=expired', url.origin));
  }

  const session = await createSessionToken(user);
  const response = NextResponse.redirect(new URL('/home', url.origin));
  response.cookies.set(SESSION_COOKIE, session ?? '', {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: url.protocol === 'https:' ? 'none' : 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return response;
}
