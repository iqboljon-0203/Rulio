import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readSession, SESSION_COOKIE } from '@/lib/auth';
import { getSubscription } from '@/lib/billing';

export async function GET() {
  const cookieStore = await cookies();
  const user = await readSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  const subscription = await getSubscription(user.telegramId).catch(() => null);
  return NextResponse.json({ user, subscription, premium: Boolean(subscription) });
}
