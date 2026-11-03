import { NextResponse } from 'next/server';
import { parseSmsAmount, parseSmsAmounts, fulfillP2PPayment } from '@/lib/p2p';

// Webhook endpoint for Android SMS-Forwarder app
// Example SMS Forwarder configuration:
// URL: https://rulio.uz/api/payments/sms?secret=<SMS_WEBHOOK_SECRET>
// Method: POST
// Body (JSON): { "text": "%SMS_BODY%", "from": "%SMS_FROM%" }
export async function POST(request: Request) {
  const url = new URL(request.url);
  const secretParam = url.searchParams.get('secret');
  const expectedSecret = process.env.SMS_WEBHOOK_SECRET;
  if (!expectedSecret || expectedSecret.length < 24) {
    return NextResponse.json({ ok: false, error: 'sms_webhook_not_configured' }, { status: 503 });
  }

  let bodyText = '';
  let fromSender = '';
  let providedSecret = secretParam;

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await request.json();
      bodyText = json.text || json.message || json.body || json.content || json.msg || '';
      fromSender = json.from || json.sender || '';
      if (json.secret) providedSecret = json.secret;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      bodyText = (formData.get('text') || formData.get('message') || formData.get('body') || formData.get('content') || '') as string;
      fromSender = (formData.get('from') || formData.get('sender') || '') as string;
      if (formData.get('secret')) providedSecret = formData.get('secret') as string;
    } else {
      bodyText = await request.text();
    }
  } catch {
    bodyText = '';
  }

  // Also check query param fallback
  if (!bodyText && url.searchParams.get('text')) {
    bodyText = url.searchParams.get('text') || '';
  }

  // Verify secret token
  if (!sameSecret(providedSecret, expectedSecret)) {
    return NextResponse.json({ ok: false, error: 'unauthorized_secret' }, { status: 401 });
  }

  if (!bodyText) {
    return NextResponse.json({ ok: false, error: 'empty_sms_text' }, { status: 400 });
  }

  console.log(`[SMS Webhook] Kelgan SMS (${fromSender}):`, bodyText);

  // Bank SMS usually contain several sums (transfer, balance, fee). Only an amount that
  // matches a pending unique request (e.g. 25 001) activates a plan.
  const candidates = parseSmsAmounts(bodyText);
  let amount: number | null = null;
  let result: Awaited<ReturnType<typeof fulfillP2PPayment>> = { success: false, message: 'SMS ichida tushum summasi topilmadi' };
  for (const c of candidates) {
    const r = await fulfillP2PPayment(c, bodyText);
    if (r.success) { amount = c; result = r; break; }
    result = r;
  }
  if (amount === null) amount = candidates[0] ?? parseSmsAmount(bodyText);
  console.log(`[SMS Webhook] Natija (${amount} so'm):`, result.message);

  return NextResponse.json({
    ok: true,
    amount,
    matched: result.success,
    message: result.message,
    plan: result.request?.plan,
    userId: result.request?.tgId,
  });
}

// GET only reports that the endpoint is alive. It never activates a payment
// (a GET link can be opened by anyone, so it must not change data).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const expectedSecret = process.env.SMS_WEBHOOK_SECRET;
  if (!expectedSecret || !sameSecret(url.searchParams.get('secret'), expectedSecret)) {
    return NextResponse.json({ ok: false, error: 'unauthorized_secret' }, { status: 401 });
  }
  const text = url.searchParams.get('text');
  return NextResponse.json({ ok: true, status: 'SMS Webhook faol', parsedAmount: text ? parseSmsAmount(text) : null });
}

function sameSecret(a: string | null | undefined, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
