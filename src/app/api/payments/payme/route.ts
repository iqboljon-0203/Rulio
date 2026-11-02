import { NextResponse } from 'next/server';
import { fulfillOrder, getOrder, saveOrder, type Order } from '@/lib/billing';
import { kvGet, kvList, kvPush, kvSet } from '@/lib/store';

// Payme Merchant API (JSON-RPC). Register this URL in the Payme cabinet:
//   https://rulio.uz/api/payments/payme
// Account field name in the cabinet: order_id

const E = {
  ACCESS_DENIED: -32504,
  PARSE: -32700,
  METHOD_NOT_FOUND: -32601,
  INVALID_AMOUNT: -31001,
  TX_NOT_FOUND: -31003,
  CANT_CANCEL: -31007,
  CANT_PERFORM: -31008,
  INVALID_ACCOUNT: -31050,
};

const TIMEOUT = 12 * 60 * 60 * 1000; // 12h, per Payme spec

const ok = (id: unknown, result: unknown) => NextResponse.json({ jsonrpc: '2.0', id, result });
const err = (id: unknown, code: number, uz: string, data?: string) =>
  NextResponse.json({ jsonrpc: '2.0', id, error: { code, message: { uz, ru: uz, en: uz }, data } });

async function orderByPaymeId(paymeId: string): Promise<Order | null> {
  const orderId = await kvGet<string>(`payme_tx:${paymeId}`);
  return orderId ? getOrder(orderId) : null;
}

function txView(o: Order) {
  const p = o.payme!;
  return {
    create_time: p.create_time,
    perform_time: p.perform_time,
    cancel_time: p.cancel_time,
    transaction: o.id,
    state: p.state,
    reason: p.reason,
  };
}

export async function POST(request: Request) {
  const key = process.env.PAYME_MERCHANT_KEY;
  const expected = key ? `Basic ${Buffer.from(`Paycom:${key}`).toString('base64')}` : null;
  let body: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return err(null, E.PARSE, "JSON xato");
  }
  const { id, method, params = {} } = body;
  if (!expected || request.headers.get('authorization') !== expected) {
    return err(id, E.ACCESS_DENIED, "Ruxsat yo'q");
  }

  const account = (params.account || {}) as { order_id?: string };
  const amount = Number(params.amount);

  switch (method) {
    case 'CheckPerformTransaction': {
      const order = account.order_id ? await getOrder(String(account.order_id)) : null;
      if (!order || order.state !== 'new') return err(id, E.INVALID_ACCOUNT, 'Buyurtma topilmadi', 'order_id');
      if (amount !== order.amount * 100) return err(id, E.INVALID_AMOUNT, "Noto'g'ri summa");
      return ok(id, { allow: true });
    }

    case 'CreateTransaction': {
      const paymeId = String(params.id);
      const existing = await orderByPaymeId(paymeId);
      if (existing?.payme) {
        if (existing.payme.state !== 1) return err(id, E.CANT_PERFORM, "Tranzaksiyani bajarib bo'lmaydi");
        if (Date.now() - existing.payme.create_time > TIMEOUT) {
          existing.payme = { ...existing.payme, state: -1, reason: 4, cancel_time: Date.now() };
          await saveOrder(existing);
          return err(id, E.CANT_PERFORM, "Tranzaksiya muddati o'tgan");
        }
        return ok(id, { create_time: existing.payme.create_time, transaction: existing.id, state: 1 });
      }

      const order = account.order_id ? await getOrder(String(account.order_id)) : null;
      if (!order || order.state !== 'new') return err(id, E.INVALID_ACCOUNT, 'Buyurtma topilmadi', 'order_id');
      if (amount !== order.amount * 100) return err(id, E.INVALID_AMOUNT, "Noto'g'ri summa");
      if (order.payme && order.payme.state === 1) {
        return err(id, E.INVALID_ACCOUNT, "Buyurtma boshqa tranzaksiya bilan band", 'order_id');
      }

      order.payme = {
        id: paymeId,
        time: Number(params.time),
        create_time: Date.now(),
        perform_time: 0,
        cancel_time: 0,
        state: 1,
        reason: null,
      };
      await saveOrder(order);
      await kvSet(`payme_tx:${paymeId}`, order.id);
      await kvPush('payme_txs', paymeId);
      return ok(id, { create_time: order.payme.create_time, transaction: order.id, state: 1 });
    }

    case 'PerformTransaction': {
      const order = await orderByPaymeId(String(params.id));
      if (!order?.payme) return err(id, E.TX_NOT_FOUND, 'Tranzaksiya topilmadi');
      if (order.payme.state === 2) return ok(id, { transaction: order.id, perform_time: order.payme.perform_time, state: 2 });
      if (order.payme.state !== 1) return err(id, E.CANT_PERFORM, "Tranzaksiyani bajarib bo'lmaydi");
      if (Date.now() - order.payme.create_time > TIMEOUT) {
        order.payme = { ...order.payme, state: -1, reason: 4, cancel_time: Date.now() };
        await saveOrder(order);
        return err(id, E.CANT_PERFORM, "Tranzaksiya muddati o'tgan");
      }
      order.payme = { ...order.payme, state: 2, perform_time: Date.now() };
      await fulfillOrder(order); // saves order + extends subscription + notifies in Telegram
      return ok(id, { transaction: order.id, perform_time: order.payme.perform_time, state: 2 });
    }

    case 'CancelTransaction': {
      const order = await orderByPaymeId(String(params.id));
      if (!order?.payme) return err(id, E.TX_NOT_FOUND, 'Tranzaksiya topilmadi');
      if (order.payme.state === 1 || order.payme.state === 2) {
        const wasPaid = order.payme.state === 2;
        order.payme = {
          ...order.payme,
          state: wasPaid ? -2 : -1,
          reason: Number(params.reason) || null,
          cancel_time: Date.now(),
        };
        order.state = 'cancelled';
        await saveOrder(order);
      }
      return ok(id, { transaction: order.id, cancel_time: order.payme.cancel_time, state: order.payme.state });
    }

    case 'CheckTransaction': {
      const order = await orderByPaymeId(String(params.id));
      if (!order?.payme) return err(id, E.TX_NOT_FOUND, 'Tranzaksiya topilmadi');
      return ok(id, txView(order));
    }

    case 'GetStatement': {
      const from = Number(params.from);
      const to = Number(params.to);
      const transactions = [];
      for (const paymeId of await kvList('payme_txs')) {
        const o = await orderByPaymeId(paymeId);
        if (!o?.payme || o.payme.time < from || o.payme.time > to) continue;
        transactions.push({
          id: o.payme.id,
          time: o.payme.time,
          amount: o.amount * 100,
          account: { order_id: o.id },
          ...txView(o),
        });
      }
      return ok(id, { transactions });
    }

    default:
      return err(id, E.METHOD_NOT_FOUND, 'Metod topilmadi');
  }
}
