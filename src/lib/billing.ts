// Plans, subscriptions and orders (shared by Payme, Click, the site and the bot).
import { kvGet, kvIncr, kvSet } from './store';
import { telegram } from './auth';

export type PaidPlan = '2_week' | '1_month' | '3_month';

export const PLANS: Record<PaidPlan, { price: number; days: number; name: string }> = {
  '2_week': { price: 15000, days: 14, name: '2 hafta' },
  '1_month': { price: 25000, days: 30, name: '1 oy' },
  '3_month': { price: 59000, days: 90, name: '3 oy' },
};

export const FREE_TICKETS = 5;

export interface Subscription {
  plan: PaidPlan;
  expiresAt: number; // ms
}

export interface Order {
  id: string; // numeric string, sent to Payme as account.order_id / Click merchant_trans_id
  tgId: number;
  plan: PaidPlan;
  amount: number; // UZS
  provider: 'payme' | 'click';
  state: 'new' | 'paid' | 'cancelled';
  createdAt: number;
  paidAt?: number;
  payme?: {
    id: string;
    time: number;
    create_time: number;
    perform_time: number;
    cancel_time: number;
    state: 1 | 2 | -1 | -2;
    reason: number | null;
  };
  click?: { trans_id: string; prepare_id: number };
}

export async function getSubscription(tgId: number): Promise<Subscription | null> {
  const s = await kvGet<Subscription>(`sub:${tgId}`);
  return s && s.expiresAt > Date.now() ? s : null;
}

export async function isPremium(tgId: number | null | undefined): Promise<boolean> {
  if (!tgId) return false;
  return (await getSubscription(tgId)) !== null;
}

export async function createOrder(tgId: number, plan: PaidPlan, provider: Order['provider']): Promise<Order> {
  const n = await kvIncr('order:seq');
  const order: Order = {
    id: String(100000 + n),
    tgId,
    plan,
    amount: PLANS[plan].price,
    provider,
    state: 'new',
    createdAt: Date.now(),
  };
  await kvSet(`order:${order.id}`, order);
  return order;
}

export const getOrder = (id: string) => kvGet<Order>(`order:${id}`);
export const saveOrder = (o: Order) => kvSet(`order:${o.id}`, o);

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tashkent' });

/** Marks the order paid, extends the subscription and tells the user in Telegram. */
export async function fulfillOrder(order: Order): Promise<Subscription> {
  const current = await getSubscription(order.tgId);
  const start = Math.max(Date.now(), current?.expiresAt ?? 0);
  const sub: Subscription = { plan: order.plan, expiresAt: start + PLANS[order.plan].days * 86_400_000 };
  await kvSet(`sub:${order.tgId}`, sub);

  order.state = 'paid';
  order.paidAt = Date.now();
  await saveOrder(order);

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://rulio.uz';
  await telegram('sendMessage', {
    chat_id: order.tgId,
    text:
      `✅ To'lov qabul qilindi!\n\n` +
      `Tarif: Premium ${PLANS[order.plan].name}\n` +
      `Summa: ${order.amount.toLocaleString('ru-RU')} so'm\n` +
      `Amal qiladi: ${fmtDate(sub.expiresAt)} gacha\n\n` +
      `Endi barcha 63 bilet va xatolar tahlili ochiq. Omad! 🚗`,
    reply_markup: { inline_keyboard: [[{ text: '📱 Testlarni boshlash', web_app: { url: `${site}/tickets` } }]] },
  }).catch(() => null);

  return sub;
}

export function describeSubscription(sub: Subscription | null): string {
  if (!sub) return "Sizda hozir bepul tarif: 5 ta bilet ochiq.";
  return `Premium ${PLANS[sub.plan].name}, ${fmtDate(sub.expiresAt)} gacha amal qiladi.`;
}
