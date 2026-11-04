// Automated P2P (Card transfer) payment handler with unique amounts and SMS parsing.
import { kvGet, kvSet, kvDel } from './store';
import { PLANS, type PaidPlan, getSubscription } from './billing';
import { telegram } from './auth';

// Set these in Vercel → Environment Variables. The fallbacks keep the current setup working.
export const CARD_NUMBER = (process.env.P2P_CARD_NUMBER || '5614681806639203').replace(/\s/g, '');
export const CARD_HOLDER = process.env.P2P_CARD_HOLDER || 'IQBOLJON YULDASHEV';
export const ADMIN_TG_ID = Number(process.env.ADMIN_TG_ID || 1332582307);
export const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'dream_tech_manager').replace(/^@/, '');
export const cardPretty = () => CARD_NUMBER.replace(/(\d{4})(?=\d)/g, '$1 ');

export interface P2PPaymentRequest {
  id: string;
  tgId: number;
  plan: PaidPlan;
  basePrice: number;
  amount: number; // e.g. 25001
  offset: number; // e.g. 1
  createdAt: number;
  expiresAt: number;
  state: 'pending' | 'paid' | 'expired';
}

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tashkent' });

/** Creates or reuses an active payment request with a unique offset amount (e.g. 25001, 25002...) */
export async function createP2PRequest(tgId: number, planKey: PaidPlan): Promise<P2PPaymentRequest> {
  const plan = PLANS[planKey] || PLANS['1_month'];
  const basePrice = plan.price;

  // Check if this user already has an active request for this plan
  const existing = await kvGet<P2PPaymentRequest>(`p2p_user:${tgId}`);
  if (existing && existing.plan === planKey && existing.expiresAt > Date.now() + 60000 && existing.state === 'pending') {
    return existing;
  }

  // Find a free offset from 1 to 99
  let chosenOffset = 1;
  for (let o = 1; o <= 99; o++) {
    const candidate = basePrice + o;
    const taken = await kvGet<P2PPaymentRequest>(`p2p_amt:${candidate}`);
    if (!taken || taken.expiresAt < Date.now() || taken.tgId === tgId) {
      chosenOffset = o;
      break;
    }
  }

  const amount = basePrice + chosenOffset;
  const req: P2PPaymentRequest = {
    id: `p2p_${Date.now()}_${tgId}`,
    tgId,
    plan: planKey,
    basePrice,
    amount,
    offset: chosenOffset,
    createdAt: Date.now(),
    expiresAt: Date.now() + 20 * 60 * 1000, // 20 minutes
    state: 'pending',
  };

  await kvSet(`p2p_amt:${amount}`, req);
  await kvSet(`p2p_user:${tgId}`, req);
  return req;
}

export function getP2PRequestByUser(tgId: number) {
  return kvGet<P2PPaymentRequest>(`p2p_user:${tgId}`);
}

/** Parses incoming SMS text from Uzbek banks and extracts the transferred UZS amount. */
export function parseSmsAmount(smsText: string): number | null {
  if (!smsText) return null;
  const s = smsText.toLowerCase().replace(/\s+/g, ' ');

  // Look for patterns like:
  // "karta ... +25001 uzs"
  // "popolnenie na 25001.00 uzs"
  // "schet popolnen na 25 001 uzs"
  // "tushum: 25001 som"
  // "25001 uzs tushdi"
  const patterns = [
    /(?:popolnenie|popolnen|tushum|tushdi|perevod|prikhod|vash schet|nachisleno|oplata)\D*?(\d[\d\s,.]*?)\s*(?:uzs|so'?m|sum)/i,
    /\+?\s*(\d[\d\s,.]*?)\s*(?:uzs|so'?m|sum)/i,
    /(?:uzs|so'?m|sum)\s*(\d[\d\s,.]*)/i,
  ];

  for (const pat of patterns) {
    const m = s.match(pat);
    if (m && m[1]) {
      // Remove spaces, handle decimals like 25001.00 or 25,001.00
      let raw = m[1].replace(/\s/g, '');
      // If ends with .00 or ,00, strip the cents
      raw = raw.replace(/[.,]00$/, '').replace(/,/g, '');
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num >= 10000 && num <= 2000000) {
        return num;
      }
    }
  }

  return null;
}

/** All UZS amounts mentioned in an SMS (transfer amount, balance, fee…). */
export function parseSmsAmounts(smsText: string): number[] {
  const s = (smsText || '').toLowerCase().replace(/\s+/g, ' ');
  const out: number[] = [];
  for (const m of s.matchAll(/(\d[\d\s,.]*?)\s*(?:uzs|so'?m|sum)/gi)) {
    const raw = m[1].replace(/\s/g, '').replace(/[.,]\d{2}$/, '').replace(/[,.]/g, '');
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 10000 && n <= 2000000 && !out.includes(n)) out.push(n);
  }
  return out;
}

/** Fulfills payment by exact received amount, activating subscription and notifying user + admin. */
export async function fulfillP2PPayment(amount: number, rawSms = ''): Promise<{ success: boolean; request?: P2PPaymentRequest; message: string }> {
  const req = await kvGet<P2PPaymentRequest>(`p2p_amt:${amount}`);
  if (!req) {
    return { success: false, message: `Bu summaga (${amount.toLocaleString('ru-RU')} so'm) mos keluvchi faol to'lov topilmadi.` };
  }

  if (req.expiresAt < Date.now()) {
    return { success: false, message: `To'lov muddati tugagan (${amount} so'm).` };
  }

  // Grant subscription
  const current = await getSubscription(req.tgId);
  const start = Math.max(Date.now(), current?.expiresAt ?? 0);
  const planInfo = PLANS[req.plan] || PLANS['1_month'];
  const sub = { plan: req.plan, expiresAt: start + planInfo.days * 86_400_000 };

  await kvSet(`sub:${req.tgId}`, sub);
  await kvDel(`p2p_amt:${amount}`);
  await kvSet(`p2p_paid:${req.id}`, { ...req, state: 'paid', paidAt: Date.now(), rawSms });
  await kvSet(`p2p_user:${req.tgId}`, { ...req, state: 'paid' });

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://rulio.uz';

  // 1. Notify the User in Telegram
  await telegram('sendMessage', {
    chat_id: req.tgId,
    text:
      `⚡ <b>To'lov avtomatik qabul qilindi!</b>\n\n` +
      `Tarif: <b>Premium ${planInfo.name}</b>\n` +
      `Summa: <b>${amount.toLocaleString('ru-RU')} so'm</b>\n` +
      `Amal qiladi: <b>${fmtDate(sub.expiresAt)} gacha</b>\n\n` +
      `Barcha 63 ta bilet, xatolar tahlili va imtihon simulyatori ochildi! Omad! 🚗`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '🟢 Testlarni boshlash', web_app: { url: `${site}/tickets` } }]],
    },
  }).catch(() => null);

  // 2. Notify Admin
  if (req.tgId !== ADMIN_TG_ID) {
    await telegram('sendMessage', {
      chat_id: ADMIN_TG_ID,
      text:
        `💰 <b>Avto-to'lov qabul qilindi!</b>\n\n` +
        `Foydalanuvchi: <code>${req.tgId}</code>\n` +
        `Tarif: Premium ${planInfo.name}\n` +
        `Summa: ${amount.toLocaleString('ru-RU')} so'm\n` +
        `SMS: <i>${rawSms.slice(0, 100)}</i>`,
      parse_mode: 'HTML',
    }).catch(() => null);
  }

  return { success: true, request: req, message: `Foydalanuvchi ${req.tgId} uchun Premium faollashtirildi.` };
}
