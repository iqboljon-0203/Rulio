import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { fulfillOrder, getOrder, saveOrder } from '@/lib/billing';

// Click SHOP API (Prepare / Complete). Register in the Click merchant cabinet:
//   Prepare URL:  https://rulio.uz/api/payments/click
//   Complete URL: https://rulio.uz/api/payments/click

const C = {
  SUCCESS: 0,
  SIGN_FAILED: -1,
  BAD_AMOUNT: -2,
  ACTION_NOT_FOUND: -3,
  ALREADY_PAID: -4,
  ORDER_NOT_FOUND: -5,
  TX_NOT_FOUND: -6,
  CANCELLED: -9,
};

const md5 = (s: string) => createHash('md5').update(s).digest('hex');

export async function POST(request: Request) {
  const f = await request.formData();
  const g = (k: string) => (f.get(k) ?? '').toString();
  const click_trans_id = g('click_trans_id');
  const service_id = g('service_id');
  const merchant_trans_id = g('merchant_trans_id');
  const merchant_prepare_id = g('merchant_prepare_id');
  const amount = g('amount');
  const action = g('action');
  const error = Number(g('error') || 0);
  const sign_time = g('sign_time');
  const sign_string = g('sign_string');

  const reply = (code: number, note: string, extra: Record<string, unknown> = {}) =>
    NextResponse.json({ click_trans_id, merchant_trans_id, error: code, error_note: note, ...extra });

  const secret = process.env.CLICK_SECRET_KEY || '';
  const expected = md5(
    `${click_trans_id}${service_id}${secret}${merchant_trans_id}${action === '1' ? merchant_prepare_id : ''}${amount}${action}${sign_time}`
  );
  if (!secret || expected !== sign_string) return reply(C.SIGN_FAILED, 'SIGN CHECK FAILED');

  const order = await getOrder(merchant_trans_id);
  if (!order) return reply(C.ORDER_NOT_FOUND, 'Order not found');
  if (Math.abs(Number(amount) - order.amount) > 0.01) return reply(C.BAD_AMOUNT, 'Incorrect amount');
  if (order.state === 'paid') return reply(C.ALREADY_PAID, 'Already paid');
  if (order.state === 'cancelled') return reply(C.CANCELLED, 'Transaction cancelled');

  if (action === '0') {
    const prepare_id = Number(order.id);
    order.click = { trans_id: click_trans_id, prepare_id };
    await saveOrder(order);
    return reply(C.SUCCESS, 'Success', { merchant_prepare_id: prepare_id });
  }

  if (action === '1') {
    if (!order.click || String(order.click.prepare_id) !== merchant_prepare_id) {
      return reply(C.TX_NOT_FOUND, 'Transaction not found');
    }
    if (error < 0) {
      order.state = 'cancelled';
      await saveOrder(order);
      return reply(C.CANCELLED, 'Transaction cancelled');
    }
    await fulfillOrder(order);
    return reply(C.SUCCESS, 'Success', { merchant_confirm_id: Number(order.id) });
  }

  return reply(C.ACTION_NOT_FOUND, 'Action not found');
}
