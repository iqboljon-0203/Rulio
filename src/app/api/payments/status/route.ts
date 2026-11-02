import { NextResponse } from 'next/server';
import { sessionFromRequest } from '@/lib/auth';
import { getOrder } from '@/lib/billing';

// Lets the pricing page poll an order after returning from Payme / Click.
export async function GET(request: Request) {
  const user = await sessionFromRequest(request);
  const id = new URL(request.url).searchParams.get('order') || '';
  const order = id ? await getOrder(id) : null;
  if (!user || !order || order.tgId !== user.telegramId) {
    return NextResponse.json({ state: 'unknown' }, { status: 404 });
  }
  return NextResponse.json({ state: order.state, plan: order.plan });
}
