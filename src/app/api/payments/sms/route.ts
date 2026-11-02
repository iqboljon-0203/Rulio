import { NextResponse } from 'next/server';
import { parseSmsAmount, fulfillP2PPayment } from '@/lib/p2p';

// Webhook endpoint for Android SMS-Forwarder app
// Example SMS Forwarder configuration:
// URL: https://rulio.uz/api/payments/sms?secret=rulio_sms_2026
// Method: POST
// Body (JSON): { "text": "%SMS_BODY%", "from": "%SMS_FROM%" }
export async function POST(request: Request) {
  const url = new URL(request.url);
  const secretParam = url.searchParams.get('secret');
  const expectedSecret = process.env.SMS_WEBHOOK_SECRET || 'rulio_sms_2026';

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
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'unauthorized_secret' }, { status: 401 });
  }

  if (!bodyText) {
    return NextResponse.json({ ok: false, error: 'empty_sms_text' }, { status: 400 });
  }

  console.log(`[SMS Webhook] Kelgan SMS (${fromSender}):`, bodyText);

  // Extract amount
  const amount = parseSmsAmount(bodyText);
  if (!amount) {
    console.log('[SMS Webhook] Summa aniqlanmadi:', bodyText);
    return NextResponse.json({ ok: true, amount: null, matched: false, message: 'SMS ichida tushum summasi topilmadi' });
  }

  // Fulfill payment
  const result = await fulfillP2PPayment(amount, bodyText);
  console.log(`[SMS Webhook] To'lov natijasi (${amount} so'm):`, result);

  return NextResponse.json({
    ok: true,
    amount,
    matched: result.success,
    message: result.message,
    plan: result.request?.plan,
    userId: result.request?.tgId,
  });
}

// GET method to test the webhook in browser or via test SMS
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  const expectedSecret = process.env.SMS_WEBHOOK_SECRET || 'rulio_sms_2026';

  if (secret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'unauthorized_secret' }, { status: 401 });
  }

  const text = url.searchParams.get('text');
  if (!text) {
    return NextResponse.json({
      ok: true,
      status: 'SMS Webhook faol!',
      usage: 'SMS matnini test qilish uchun: /api/payments/sms?secret=rulio_sms_2026&text=Karta+5614+ga+25001+UZS+tushdi',
    });
  }

  const amount = parseSmsAmount(text);
  if (!amount) {
    return NextResponse.json({ ok: true, amount: null, matched: false, message: 'Summa topilmadi' });
  }

  const result = await fulfillP2PPayment(amount, text);
  return NextResponse.json({ ok: true, amount, matched: result.success, message: result.message });
}
