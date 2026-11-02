import { NextResponse, type NextRequest } from 'next/server';
import { createSessionToken, getBotToken, readSession, SESSION_COOKIE, SESSION_MAX_AGE, verifyLoginToken } from '@/lib/auth';

// Dashboard pages require a Telegram session. /login is bounced to /home when already signed in.
export async function proxy(request: NextRequest) {
  // Until the bot token is configured, keep the app open so local development still works.
  if (!getBotToken()) return NextResponse.next();

  let user = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  // Auto-login from payment return token (e.g. returning from Payme/Click)
  const returnToken = request.nextUrl.searchParams.get('return_token');
  if (!user && returnToken) {
    const verifiedUser = await verifyLoginToken(returnToken);
    if (verifiedUser) {
      const session = await createSessionToken(verifiedUser);
      const cleanUrl = new URL(request.url);
      cleanUrl.searchParams.delete('return_token');
      const response = NextResponse.redirect(cleanUrl);
      const secure = request.nextUrl.protocol === 'https:';
      response.cookies.set(SESSION_COOKIE, session ?? '', {
        httpOnly: true,
        secure,
        sameSite: secure ? 'none' : 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });
      return response;
    }
  }

  if (pathname === '/login' || pathname === '/register') {
    return user ? NextResponse.redirect(new URL('/home', request.url)) : NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/home/:path*',
    '/tickets/:path*',
    '/random/:path*',
    '/mistakes/:path*',
    '/saved/:path*',
    '/octagon/:path*',
    '/profile/:path*',
    '/pricing/:path*',
  ],
};
