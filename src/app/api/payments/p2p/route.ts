import { NextResponse } from 'next/server';
import { sessionFromRequest } from '@/lib/auth';
import { PLANS, type PaidPlan, getSubscription } from '@/lib/billing';
import { createP2PRequest, getP2PRequestByUser, CARD_HOLDER, ADMIN_USERNAME, cardPretty } from '@/lib/p2p';

// Card transfer with a unique amount (e.g. 25 001). The SMS forwarder posts the bank SMS to
// /api/payments/sms and the matching request is activated automatically — same flow as the bot.

const providers = () => ({
  payme: Boolean(process.env.PAYME_MERCHANT_ID),
  click: Boolean(process.env.CLICK_SERVICE_ID && process.env.CLICK_MERCHANT_ID),
});

export async function POST(request: Request) {
  const user = await sessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Avval tizimga kiring' }, { status: 401 });
  const { plan } = (await request.json().catch(() => ({}))) as { plan?: string };
  if (!plan || !(plan in PLANS)) return NextResponse.json({ error: "Noto'g'ri tarif" }, { status: 400 });

  const req = await createP2PRequest(user.telegramId, plan as PaidPlan);
  return NextResponse.json({
    amount: req.amount,
    plan: req.plan,
    expiresAt: req.expiresAt,
    card: cardPretty(),
    holder: CARD_HOLDER,
    admin: ADMIN_USERNAME,
    providers: providers(),
  });
}

export async function GET(request: Request) {
  const user = await sessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const [req, sub] = await Promise.all([getP2PRequestByUser(user.telegramId), getSubscription(user.telegramId)]);
  return NextResponse.json({
    pending: req && req.state === 'pending' && req.expiresAt > Date.now() ? { amount: req.amount, plan: req.plan, expiresAt: req.expiresAt } : null,
    subscription: sub,
    providers: providers(),
  });
}
