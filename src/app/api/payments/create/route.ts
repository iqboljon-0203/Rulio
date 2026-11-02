import { NextResponse } from 'next/server';
import { createLoginToken, sessionFromRequest } from '@/lib/auth';
import { createOrder, PLANS, type PaidPlan } from '@/lib/billing';

// Creates an order for the signed-in user and returns the Payme / Click checkout URL.
export async function POST(request: Request) {
  const user = await sessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Avval tizimga kiring' }, { status: 401 });

  const { provider, plan } = (await request.json().catch(() => ({}))) as { provider?: string; plan?: string };
  if (!plan || !(plan in PLANS) || (provider !== 'payme' && provider !== 'click')) {
    return NextResponse.json({ error: "Noto'g'ri tarif yoki to'lov tizimi" }, { status: 400 });
  }

  const order = await createOrder(user.telegramId, plan as PaidPlan, provider);
  const returnToken = await createLoginToken({
    id: user.telegramId,
    first_name: user.name,
    username: user.username,
  });

  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const back = `${site}/pricing?order=${order.id}${returnToken ? `&return_token=${encodeURIComponent(returnToken)}` : ''}`;

  let checkoutUrl: string;
  if (provider === 'payme') {
    const merchant = process.env.PAYME_MERCHANT_ID;
    if (!merchant) return NextResponse.json({ error: 'Payme hali ulanmagan' }, { status: 503 });
    const params = `m=${merchant};ac.order_id=${order.id};a=${order.amount * 100};c=${back}`;
    checkoutUrl = `${process.env.PAYME_CHECKOUT_URL || 'https://checkout.paycom.uz'}/${Buffer.from(params).toString('base64')}`;
  } else {
    const service = process.env.CLICK_SERVICE_ID;
    const merchant = process.env.CLICK_MERCHANT_ID;
    if (!service || !merchant) return NextResponse.json({ error: 'Click hali ulanmagan' }, { status: 503 });
    const q = new URLSearchParams({
      service_id: service,
      merchant_id: merchant,
      amount: String(order.amount),
      transaction_param: order.id,
      return_url: back,
    });
    checkoutUrl = `https://my.click.uz/services/pay?${q}`;
  }

  return NextResponse.json({ orderId: order.id, amount: order.amount, checkoutUrl });
}
