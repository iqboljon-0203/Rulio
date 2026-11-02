import { NextResponse } from 'next/server';
import { sessionFromRequest } from '@/lib/auth';
import { getSubscription } from '@/lib/billing';

export async function GET(request: Request) {
  const user = await sessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const sub = await getSubscription(user.telegramId);
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      telegramId: user.telegramId,
      subscriptionPlan: sub?.plan ?? 'free',
      subscriptionExpiresAt: sub?.expiresAt ?? null,
    },
  });
}

// Name and photo come from Telegram; language is stored on the device.
export async function PUT(request: Request) {
  const user = await sessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true });
}
