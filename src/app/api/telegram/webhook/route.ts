import { NextResponse } from 'next/server';
import { createLoginToken, telegram, webhookSecret, type TelegramUser } from '@/lib/auth';
import { describeSubscription, getSubscription, PLANS, FREE_TICKETS, type PaidPlan } from '@/lib/billing';
import { kvSet } from '@/lib/store';

interface TgUpdate {
  message?: {
    chat: { id: number; type?: string };
    from?: TelegramUser & { is_bot?: boolean; language_code?: string };
    text?: string;
    photo?: unknown[];
    document?: unknown;
  };
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: {
      chat: { id: number };
      message_id: number;
    };
    data?: string;
  };
}

const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ');

// Bottom persistent keyboard
const MENU = {
  keyboard: [
    [{ text: '🟢 Ilovani ochish' }, { text: '💳 Tariflar' }],
    [{ text: '🔑 Kod olish' }, { text: '👤 Mening tarifim' }],
    [{ text: '❓ Yordam' }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

function getTarifSelector() {
  const text =
    `💳 <b>Rulio Premium tariflari:</b>\n\n` +
    `• <b>2 hafta</b> — 15 000 so'm (kuniga ~1 070 so'm)\n` +
    `• <b>1 oy</b> — 25 000 so'm (kuniga ~833 so'm)\n` +
    `• <b>3 oy</b> — 59 000 so'm (kuniga ~655 so'm)\n\n` +
    `✨ <b>Premium imkoniyatlari:</b>\n` +
    `✅ Barcha 63 ta bilet ochiq\n` +
    `✅ Haqiqiy imtihon simulyatori (tasodifiy test)\n` +
    `✅ Xatolar ustida ishlash bo'limi\n` +
    `✅ Saqlangan savollar va to'liq statistika\n` +
    `✅ Har bir savolga audio tushuntirishlar\n\n` +
    `👇 <i>To'lov qilish uchun quyidagi tariflardan birini tanlang:</i>`;

  const inline_keyboard = [
    [{ text: '⚡ 2 hafta — 15 000 so\'m', callback_data: 'buy_2_week' }],
    [{ text: '🔥 1 oy — 25 000 so\'m', callback_data: 'buy_1_month' }],
    [{ text: '👑 3 oy — 59 000 so\'m', callback_data: 'buy_3_month' }],
    [{ text: '🏠 Asosiy menyu', callback_data: 'menu_main' }],
  ];

  return { text, reply_markup: { inline_keyboard } };
}

function getPaymentCardMessage(planKey: PaidPlan, exactAmount?: number, offset?: number) {
  const plan = PLANS[planKey] || PLANS['1_month'];
  const amount = exactAmount || plan.price;
  const formattedPrice = fmt(amount);

  const text =
    `💳 <b>Balans to'ldirish (Avto-to'lov)</b>\n\n` +
    `💰 <b>O'tkazish summasi:</b> <code>${amount}</code> so'm <i>(nusxalash uchun bosing)</i>\n` +
    `🎁 <b>Tarif:</b> Premium ${plan.name} (${plan.days} kun)\n\n` +
    `🔢 <b>Karta raqami:</b> <code>5614681806639203</code> <i>(nusxalash uchun bosing)</i>\n` +
    `👤 <b>Karta egasi:</b> IQBOLJON YULDASHEV\n\n` +
    `⚠️ <b>DIQQAT:</b> Aynan ko'rsatilgan <b>${formattedPrice} so'm</b>ni o'tkazing${offset ? ` (${offset} so'm kam ham, ko'p ham emas)` : ''}!\n` +
    `⚡ <i>To'lov amalga oshishi bilan tarifingiz 1 soniyada avtomatik faollashtiriladi.</i>`;

  const inline_keyboard = [
    [{ text: '🔄 To\'lovni tekshirish', callback_data: `check_${planKey}` }],
    [{ text: '📸 Chek yuborish', url: 'https://t.me/musulman_0201' }],
    [
      { text: '◀️ Orqaga', callback_data: 'menu_tarifs' },
      { text: '🏠 Asosiy menyu', callback_data: 'menu_main' },
    ],
  ];

  return { text, reply_markup: { inline_keyboard } };
}

export async function POST(request: Request) {
  const expected = await webhookSecret();
  if (!expected || request.headers.get('x-telegram-bot-api-secret-token') !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = (await request.json().catch(() => ({}))) as TgUpdate;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  // Handle button clicks (Callback Queries)
  if (update.callback_query) {
    const cb = update.callback_query;
    const { id: user_id, first_name, last_name, username } = cb.from;
    const chat_id = cb.message?.chat.id || user_id;
    const message_id = cb.message?.message_id;
    const data = cb.data || '';

    try {
      if (data.startsWith('buy_')) {
        await telegram('answerCallbackQuery', { callback_query_id: cb.id });
        const planKey = data.replace('buy_', '') as PaidPlan;
        const { createP2PRequest } = await import('@/lib/p2p');
        const p2pReq = await createP2PRequest(user_id, planKey);
        const msgData = getPaymentCardMessage(planKey, p2pReq.amount, p2pReq.offset);
        if (message_id) {
          await telegram('editMessageText', {
            chat_id,
            message_id,
            text: msgData.text,
            parse_mode: 'HTML',
            reply_markup: msgData.reply_markup,
          }).catch(() =>
            telegram('sendMessage', { chat_id, text: msgData.text, parse_mode: 'HTML', reply_markup: msgData.reply_markup })
          );
        } else {
          await telegram('sendMessage', { chat_id, text: msgData.text, parse_mode: 'HTML', reply_markup: msgData.reply_markup });
        }
      } else if (data.startsWith('check_')) {
        const sub = await getSubscription(user_id);
        if (sub) {
          await telegram('answerCallbackQuery', {
            callback_query_id: cb.id,
            text: `✅ Tabriklaymiz! Sizning Premium tarifingiz faol! 🚗`,
            show_alert: true,
          });
        } else {
          await telegram('answerCallbackQuery', {
            callback_query_id: cb.id,
            text: `⏳ To'lovingiz kutilmoqda. Agar to'lov qilgan bo'lsangiz, "📸 Chek yuborish" orqali chekni yuboring yoki adminga (@musulman_0201) yozing.`,
            show_alert: true,
          });
        }
      } else if (data === 'menu_tarifs') {
        await telegram('answerCallbackQuery', { callback_query_id: cb.id });
        const msgData = getTarifSelector();
        if (message_id) {
          await telegram('editMessageText', {
            chat_id,
            message_id,
            text: msgData.text,
            parse_mode: 'HTML',
            reply_markup: msgData.reply_markup,
          });
        }
      } else if (data === 'menu_main') {
        await telegram('answerCallbackQuery', { callback_query_id: cb.id });
        const token = await createLoginToken({ id: user_id, first_name, last_name, username });
        const link = `${origin}/auth/telegram?token=${encodeURIComponent(token ?? '')}`;
        const welcomeText =
          `Assalomu alaykum, ${first_name}! Rulio botiga xush kelibsiz! 🚗\n\n` +
          `Bu yerda siz YHQ qoidalari bo'yicha 1250+ rasmiy testlar va 63 ta biletlarni yechishingiz mumkin.\n\n` +
          `✨ ${FREE_TICKETS} ta bilet mutlaqo bepul!\n` +
          `📱 Ilovani ochish yoki saytga kirish uchun quyidagi tugmalardan foydalaning:`;
        const inline_keyboard = [
          [{ text: '🟢 Ilovani ochish', web_app: { url: `${origin}/home` } }],
          [{ text: '🔑 Kod olish', url: link }],
        ];
        if (message_id) {
          await telegram('editMessageText', {
            chat_id,
            message_id,
            text: welcomeText,
            reply_markup: { inline_keyboard },
          });
        }
      } else {
        await telegram('answerCallbackQuery', { callback_query_id: cb.id });
      }
    } catch (e) {
      console.error('callback_query error', e);
    }
    return NextResponse.json({ ok: true });
  }

  // Handle standard messages
  const msg = update.message;
  if (!msg?.from || msg.from.is_bot) return NextResponse.json({ ok: true });

  const chat_id = msg.chat.id;
  const text = (msg.text || '').trim();
  const cmd = text.split(/[\s@]/)[0].toLowerCase();
  const { id, first_name, last_name, username } = msg.from;

  try {
    const token = await createLoginToken({ id, first_name, last_name, username });
    const link = `${origin}/auth/telegram?token=${encodeURIComponent(token ?? '')}`;

    if (cmd === '/grant' && (id === 1332582307 || username === 'musulman_0201')) {
      const parts = text.split(/\s+/);
      const targetId = Number(parts[1]);
      const planKey = (parts[2] || '1_month') as PaidPlan;
      if (targetId && PLANS[planKey]) {
        const start = Date.now();
        const sub = { plan: planKey, expiresAt: start + PLANS[planKey].days * 86_400_000 };
        await kvSet(`sub:${targetId}`, sub);
        await telegram('sendMessage', {
          chat_id: targetId,
          text: `🎉 Tabriklaymiz! Sizning to'lovingiz tasdiqlandi. Premium (${PLANS[planKey].name}) faollashtirildi! 🚗`,
          reply_markup: { inline_keyboard: [[{ text: '🟢 Testlarni ochish', web_app: { url: `${origin}/tickets` } }]] },
        }).catch(() => null);
        await telegram('sendMessage', {
          chat_id,
          text: `✅ Foydalanuvchi ${targetId} uchun Premium (${PLANS[planKey].name}) muvaffaqiyatli faollashtirildi!`,
        });
        return NextResponse.json({ ok: true });
      }
    } else if (msg.photo || msg.document || (/chek|to'ladim|toladim|to'lov|tolov/i.test(text) && !/mening|tarif/i.test(text))) {
      await telegram('sendMessage', {
        chat_id,
        text:
          `✅ To'lov chekingiz qabul qilindi!\n\n` +
          `Admin (@musulman_0201) to'lovni tekshirib, 5–10 daqiqa ichida Premium tarifingizni faollashtirib beradi.`,
        reply_markup: MENU,
      });
      if (id !== 1332582307) {
        await telegram('sendMessage', {
          chat_id: 1332582307,
          text: `🔔 Yangi to'lov cheki keldi!\nFoydalanuvchi: ${first_name} ${last_name || ''} (@${username || 'yo\'q'}, ID: ${id})\n\nTarifni yoqish uchun bosing: /grant ${id} 1_month`,
        }).catch(() => null);
      }
      return NextResponse.json({ ok: true });
    } else if (cmd === '/start') {
      await telegram('sendMessage', {
        chat_id,
        text:
          `Assalomu alaykum, ${first_name}! Rulio botiga xush kelibsiz! 🚗\n\n` +
          `Bu yerda siz YHQ qoidalari bo'yicha 1250+ rasmiy testlar va 63 ta biletlarni yechishingiz mumkin.\n\n` +
          `✨ ${FREE_TICKETS} ta bilet mutlaqo bepul!\n` +
          `📱 Ilovani ochish yoki saytga kirish uchun quyidagi tugmalardan foydalaning:`,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🟢 Ilovani ochish', web_app: { url: `${origin}/home` } }],
            [{ text: '🔑 Kod olish', url: link }],
          ],
        },
      });
      await telegram('sendMessage', {
        chat_id,
        text: `Menyudan ham foydalanishingiz mumkin:`,
        reply_markup: MENU,
      });
    } else if (cmd === '/login' || /kod|kirish|войти/i.test(text)) {
      const { createOtpCode } = await import('@/lib/auth');
      const otpCode = await createOtpCode({ id, first_name, last_name, username });
      const loginUrl = `${origin}/login`;
      await telegram('sendMessage', {
        chat_id,
        text:
          `🔑 <b>Sizning saytga kirish kodingiz:</b>\n\n` +
          `<code>${otpCode}</code> <i>(nusxalash uchun ustiga bosing)</i>\n\n` +
          `🌐 Kompyuterda <b>${loginUrl}</b> sahifasiga shu 6 xonali kodni kiriting.\n` +
          `⏱ Kod <b>10 daqiqa</b> davomida amal qiladi.`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Saytga to\'g\'ridan-to\'g\'ri kirish', url: link }],
            [{ text: '🏠 Asosiy menyu', callback_data: 'menu_main' }],
          ],
        },
      });
    } else if (/ilovani ochish|testlar|boshlash/i.test(text)) {
      await telegram('sendMessage', {
        chat_id,
        text: `🚗 Testlarni boshlash uchun quyidagi tugmani bosing:`,
        reply_markup: {
          inline_keyboard: [[{ text: '🟢 Ilovani ochish', web_app: { url: `${origin}/home` } }]],
        },
      });
    } else if (cmd === '/tarif' || cmd === '/tariflar' || (/tarif|тариф|premium/i.test(text) && !/mening/i.test(text))) {
      const msgData = getTarifSelector();
      await telegram('sendMessage', {
        chat_id,
        text: msgData.text,
        parse_mode: 'HTML',
        reply_markup: msgData.reply_markup,
      });
    } else if (cmd === '/status' || /mening tarif|мой тариф/i.test(text)) {
      const sub = await getSubscription(id);
      await telegram('sendMessage', {
        chat_id,
        text: `👤 Haydovchi: ${first_name}\n${describeSubscription(sub)}`,
        reply_markup: sub
          ? { inline_keyboard: [[{ text: '🟢 Testlarni ochish', web_app: { url: `${origin}/tickets` } }]] }
          : { inline_keyboard: [[{ text: '💳 Premium olish', callback_data: 'menu_tarifs' }]] },
      });
    } else if (cmd === '/help' || /yordam|помощь/i.test(text)) {
      await telegram('sendMessage', {
        chat_id,
        text:
          `❓ Yordam va ma'lumot:\n\n` +
          `/start — Botni qayta ishga tushirish\n` +
          `/tarif — Tariflar va narxlar\n` +
          `/login — Saytga kirish havolasi / kodi\n` +
          `/status — Mening tarifim\n\n` +
          `To'lov bo'yicha savol bo'lsa (pul o'tkazildi, tarif ochilmadi), to'lov chekining skrinshotini shu yerga yuboring yoki adminga yozing: @musulman_0201`,
        reply_markup: MENU,
      });
    } else {
      await telegram('sendMessage', {
        chat_id,
        text: `Quyidagi menyu tugmalaridan birini tanlang yoki /help deb yozing:`,
        reply_markup: MENU,
      });
    }
  } catch (e) {
    console.error('webhook error', e);
  }

  return NextResponse.json({ ok: true });
}

