// Local development & bot testing (with SMS-Forwarder simulation and auto-payment)
import { loadEnv, tg, createLoginToken } from './_env.mjs';

const token = loadEnv();
const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.DEV_SITE_URL || 'http://localhost:3000';
const isHttps = site.startsWith('https://');

await tg(token, 'deleteWebhook');
const me = await tg(token, 'getMe');
console.log(`@${me.result?.username} ishga tushdi. Manzil: ${site} (HTTPS: ${isHttps})`);

await tg(token, 'setMyCommands', {
  commands: [
    { command: 'start', description: 'Botni ishga tushirish' },
    { command: 'tarif', description: 'Tariflar va narxlar' },
    { command: 'login', description: 'Saytga kirish kodi / havolasi' },
    { command: 'status', description: 'Mening tarifim' },
    { command: 'help', description: 'Yordam' },
  ],
});

if (isHttps) {
  await tg(token, 'setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Ochish', web_app: { url: `${site.replace(/\/$/, '')}/home` } },
  });
}

const MENU = {
  keyboard: [
    [{ text: '🟢 Ilovani ochish' }, { text: '💳 Tariflar' }],
    [{ text: '🔑 Kod olish' }, { text: '👤 Mening tarifim' }],
    [{ text: '❓ Yordam' }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

const PLANS = {
  '2_week': { price: 15000, days: 14, name: '2 hafta' },
  '1_month': { price: 25000, days: 30, name: '1 oy' },
  '3_month': { price: 59000, days: 90, name: '3 oy' },
};

const fmt = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');

// In-memory active subscriptions and P2P pending requests
const devSubs = new Map();
const devP2PAmounts = new Map(); // amount -> { tgId, planKey, amount, offset, expiresAt }
const devP2PUsers = new Map(); // tgId -> { tgId, planKey, amount, offset, expiresAt }

function createDevP2PRequest(tgId, planKey) {
  const plan = PLANS[planKey] || PLANS['1_month'];
  const basePrice = plan.price;

  const existing = devP2PUsers.get(tgId);
  if (existing && existing.planKey === planKey && existing.expiresAt > Date.now() + 60000) {
    return existing;
  }

  let chosenOffset = 1;
  for (let o = 1; o <= 99; o++) {
    const candidate = basePrice + o;
    const taken = devP2PAmounts.get(candidate);
    if (!taken || taken.expiresAt < Date.now() || taken.tgId === tgId) {
      chosenOffset = o;
      break;
    }
  }

  const amount = basePrice + chosenOffset;
  const req = {
    tgId,
    planKey,
    basePrice,
    amount,
    offset: chosenOffset,
    createdAt: Date.now(),
    expiresAt: Date.now() + 20 * 60 * 1000,
  };

  devP2PAmounts.set(amount, req);
  devP2PUsers.set(tgId, req);
  return req;
}

function parseDevSmsAmount(smsText) {
  if (!smsText) return null;
  const s = smsText.toLowerCase().replace(/\s+/g, ' ');
  const patterns = [
    /(?:popolnenie|popolnen|tushum|tushdi|perevod|prikhod|vash schet|nachisleno|oplata)\D*?(\d[\d\s,.]*?)\s*(?:uzs|so'?m|sum)/i,
    /\+?\s*(\d[\d\s,.]*?)\s*(?:uzs|so'?m|sum)/i,
    /(?:uzs|so'?m|sum)\s*(\d[\d\s,.]*)/i,
  ];

  for (const pat of patterns) {
    const m = s.match(pat);
    if (m && m[1]) {
      let raw = m[1].replace(/\s/g, '').replace(/[.,]00$/, '').replace(/,/g, '');
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num >= 10000 && num <= 2000000) return num;
    }
  }
  return null;
}

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

function getPaymentCardMessage(planKey, exactAmount, offset) {
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

let offset = 0;
for (;;) {
  let res;
  try {
    res = await tg(token, 'getUpdates', { offset, timeout: 30, allowed_updates: ['message', 'callback_query'] });
  } catch (err) {
    console.error('getUpdates xatolik:', err.message);
    await new Promise((r) => setTimeout(r, 2000));
    continue;
  }

  for (const upd of res.result ?? []) {
    offset = upd.update_id + 1;

    // Handle Inline Button clicks (Callback Queries)
    if (upd.callback_query) {
      const cb = upd.callback_query;
      const { id: user_id, first_name, last_name, username } = cb.from;
      const chat_id = cb.message?.chat.id || user_id;
      const message_id = cb.message?.message_id;
      const data = cb.data || '';

      try {
        if (data.startsWith('buy_')) {
          await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id });
          const planKey = data.replace('buy_', '');
          const p2pReq = createDevP2PRequest(user_id, planKey);
          const msgData = getPaymentCardMessage(planKey, p2pReq.amount, p2pReq.offset);
          if (message_id) {
            await tg(token, 'editMessageText', {
              chat_id,
              message_id,
              text: msgData.text,
              parse_mode: 'HTML',
              reply_markup: msgData.reply_markup,
            }).catch(() =>
              tg(token, 'sendMessage', { chat_id, text: msgData.text, parse_mode: 'HTML', reply_markup: msgData.reply_markup })
            );
          } else {
            await tg(token, 'sendMessage', { chat_id, text: msgData.text, parse_mode: 'HTML', reply_markup: msgData.reply_markup });
          }
        } else if (data.startsWith('check_')) {
          const sub = devSubs.get(user_id);
          if (sub && sub > Date.now()) {
            await tg(token, 'answerCallbackQuery', {
              callback_query_id: cb.id,
              text: `✅ Tabriklaymiz! Sizning Premium tarifingiz faol! 🚗`,
              show_alert: true,
            });
          } else {
            await tg(token, 'answerCallbackQuery', {
              callback_query_id: cb.id,
              text: `⏳ To'lovingiz kutilmoqda. Agar to'lov qilgan bo'lsangiz, "📸 Chek yuborish" orqali chekni yuboring yoki adminga (@musulman_0201) yozing.`,
              show_alert: true,
            });
          }
        } else if (data === 'menu_tarifs') {
          await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id });
          const msgData = getTarifSelector();
          if (message_id) {
            await tg(token, 'editMessageText', {
              chat_id,
              message_id,
              text: msgData.text,
              parse_mode: 'HTML',
              reply_markup: msgData.reply_markup,
            });
          }
        } else if (data === 'menu_main') {
          await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id });
          const tokenStr = createLoginToken(token, { id: user_id, first_name, last_name, username });
          const link = `${site}/auth/telegram?token=${encodeURIComponent(tokenStr)}`;
          const welcomeText =
            `Assalomu alaykum, ${first_name}! Rulio botiga xush kelibsiz! 🚗\n\n` +
            `Bu yerda siz YHQ qoidalari bo'yicha 1250+ rasmiy testlar va 63 ta biletlarni yechishingiz mumkin.\n\n` +
            `✨ 5 ta bilet mutlaqo bepul!\n\n` +
            (isHttps
              ? `Ilovani ochish yoki saytga kirish uchun quyidagi tugmalardan foydalaning:`
              : `🔗 Saytga kirish havolangiz (10 daqiqa amal qiladi):\n${link}`);

          const inline_keyboard = [];
          if (isHttps) {
            inline_keyboard.push([{ text: '🟢 Ilovani ochish', web_app: { url: `${site}/home` } }]);
            inline_keyboard.push([{ text: '🔑 Kod olish', url: link }]);
          }
          if (message_id && inline_keyboard.length) {
            await tg(token, 'editMessageText', {
              chat_id,
              message_id,
              text: welcomeText,
              reply_markup: { inline_keyboard },
            });
          } else {
            await tg(token, 'sendMessage', { chat_id, text: welcomeText, reply_markup: MENU });
          }
        } else {
          await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id });
        }
      } catch (err) {
        console.error('callback error:', err);
      }
      continue;
    }

    // Handle normal message
    const msg = upd.message;
    if (!msg?.from || msg.from.is_bot) continue;

    const { id, first_name, last_name, username } = msg.from;
    const chat_id = msg.chat.id;
    const text = (msg.text || '').trim();
    const cmd = text.split(/[\s@]/)[0].toLowerCase();
    const link = `${site}/auth/telegram?token=${encodeURIComponent(createLoginToken(token, { id, first_name, last_name, username }))}`;

    try {
      // Test command: Simulate SMS received (e.g. /sms Karta 5614 ga 25001 UZS tushdi or /pay 25001)
      if ((cmd === '/sms' || cmd === '/pay') && (id === 1332582307 || username === 'musulman_0201')) {
        const parts = text.split(/\s+/);
        const amount = cmd === '/pay' ? Number(parts[1]) : parseDevSmsAmount(text);
        if (amount) {
          const req = devP2PAmounts.get(amount);
          if (req) {
            const plan = PLANS[req.planKey];
            devSubs.set(req.tgId, Date.now() + plan.days * 86_400_000);
            devP2PAmounts.delete(amount);
            devP2PUsers.delete(req.tgId);
            await tg(token, 'sendMessage', {
              chat_id: req.tgId,
              text: `⚡ <b>To'lov avtomatik qabul qilindi!</b>\n\nTarif: Premium ${plan.name}\nSumma: ${amount.toLocaleString('ru-RU')} so'm\n\nBarcha 63 ta bilet ochildi! Omad! 🚗`,
              parse_mode: 'HTML',
            }).catch(() => null);
            await tg(token, 'sendMessage', {
              chat_id,
              text: `✅ [SMS Test] ${amount} so'm qabul qilindi va foydalanuvchi ${req.tgId} ga Premium faollashtirildi!`,
            });
          } else {
            await tg(token, 'sendMessage', {
              chat_id,
              text: `⚠️ [SMS Test] ${amount} so'mlik faol to'lov so'rovi topilmadi. Avval tarifni tanlang.`,
            });
          }
        } else {
          await tg(token, 'sendMessage', { chat_id, text: `SMS matnidan summa aniqlanmadi.` });
        }
      } else if (cmd === '/grant' && (id === 1332582307 || username === 'musulman_0201')) {
        const parts = text.split(/\s+/);
        const targetId = Number(parts[1]);
        const plan = parts[2] || '1_month';
        const days = plan === '3_month' ? 90 : plan === '2_week' ? 14 : 30;
        if (targetId) {
          devSubs.set(targetId, Date.now() + days * 86_400_000);
          await tg(token, 'sendMessage', {
            chat_id: targetId,
            text: `🎉 Tabriklaymiz! Sizning to'lovingiz tasdiqlandi. Premium (${plan}, ${days} kun) faollashtirildi! 🚗`,
          }).catch(() => null);
          await tg(token, 'sendMessage', {
            chat_id,
            text: `✅ Foydalanuvchi ${targetId} uchun Premium (${plan}) faollashtirildi!`,
          });
        }
      } else if (msg.photo || msg.document || (/chek|to'ladim|toladim|to'lov|tolov/i.test(text) && !/mening|tarif/i.test(text))) {
        await tg(token, 'sendMessage', {
          chat_id,
          text:
            `✅ To'lov chekingiz qabul qilindi!\n\n` +
            `Admin (@musulman_0201) to'lovni tekshirib, 5–10 daqiqa ichida Premium tarifingizni faollashtirib beradi.`,
          reply_markup: MENU,
        });
        if (id !== 1332582307) {
          await tg(token, 'sendMessage', {
            chat_id: 1332582307,
            text: `🔔 Yangi to'lov cheki keldi!\nFoydalanuvchi: ${first_name} ${last_name || ''} (@${username || 'yo\'q'}, ID: ${id})\n\nTarifni yoqish uchun bosing: /grant ${id} 1_month`,
          }).catch(() => null);
        }
      } else if (cmd === '/start') {
        const welcomeText =
          `Assalomu alaykum, ${first_name}! Rulio botiga xush kelibsiz! 🚗\n\n` +
          `Bu yerda siz YHQ qoidalari bo'yicha 1250+ rasmiy testlar va 63 ta biletlarni yechishingiz mumkin.\n\n` +
          `✨ 5 ta bilet mutlaqo bepul!\n\n` +
          (isHttps
            ? `Ilovani ochish yoki saytga kirish uchun quyidagi tugmalardan foydalaning:`
            : `🔗 Saytga kirish havolangiz (10 daqiqa amal qiladi):\n${link}\n\n` +
              `ℹ️ (Hozir lokal dev rejimidasiz. Sayt internetga https bilan chiqqanda "🟢 Ilovani ochish" tugmasi to'g'ridan-to'g'ri Telegram ichida ochiladi).`);

        if (isHttps) {
          await tg(token, 'sendMessage', {
            chat_id,
            text: welcomeText,
            reply_markup: {
              inline_keyboard: [
                [{ text: '🟢 Ilovani ochish', web_app: { url: `${site}/home` } }],
                [{ text: '🔑 Kod olish', url: link }],
              ],
            },
          });
          await tg(token, 'sendMessage', {
            chat_id,
            text: `Menyudan ham foydalanishingiz mumkin:`,
            reply_markup: MENU,
          });
        } else {
          await tg(token, 'sendMessage', {
            chat_id,
            text: welcomeText,
            reply_markup: MENU,
            disable_web_page_preview: true,
          });
        }
      } else if (cmd === '/tarif' || cmd === '/tariflar' || /tarif|тариф|premium/i.test(text)) {
        const msgData = getTarifSelector();
        await tg(token, 'sendMessage', {
          chat_id,
          text: msgData.text,
          parse_mode: 'HTML',
          reply_markup: msgData.reply_markup,
        });
      } else if (cmd === '/login' || /kod|kirish|войти/i.test(text)) {
        const otpCode = String(Math.floor(100000 + Math.random() * 900000));
        await fetch(`${site}/api/auth/code`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: otpCode, user: { id, first_name, last_name, username } }),
        }).catch((err) => console.error('OTP register error:', err.message));

        const otpText =
          `🔑 <b>Sizning saytga kirish kodingiz:</b>\n\n` +
          `<code>${otpCode}</code> <i>(nusxalash uchun ustiga bosing)</i>\n\n` +
          `🌐 Kompyuterda <b>${site}/login</b> sahifasiga shu 6 xonali kodni kiriting.\n` +
          `⏱ Kod <b>10 daqiqa</b> davomida amal qiladi.`;

        await tg(token, 'sendMessage', {
          chat_id,
          text: otpText,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Saytga to\'g\'ridan-to\'g\'ri kirish', url: link }],
              [{ text: '🏠 Asosiy menyu', callback_data: 'menu_main' }],
            ],
          },
        });
      } else if (/ilovani ochish|testlar|boshlash/i.test(text)) {
        await tg(token, 'sendMessage', {
          chat_id,
          text: isHttps
            ? `📱 Rulio ilovasi orqali testlarni boshlang:`
            : `📱 Testlarni boshlash uchun saytga kiring:\n${link}`,
          reply_markup: isHttps
            ? { inline_keyboard: [[{ text: '🟢 Ilovani ochish', web_app: { url: `${site}/home` } }]] }
            : MENU,
          disable_web_page_preview: true,
        });
      } else if (cmd === '/status' || /mening tarif|tarifim/i.test(text)) {
        const subExp = devSubs.get(id);
        const isPrem = subExp && subExp > Date.now();
        await tg(token, 'sendMessage', {
          chat_id,
          text:
            `👤 Haydovchi: ${first_name} ${last_name || ''}\n` +
            `📊 Holat: ${isPrem ? '✅ Premium tarif faol!' : 'Bepul tarif (1–5 biletlar ochiq)'}\n\n` +
            (isPrem ? 'Barcha 63 ta bilet ochiq. Omad!' : 'Barcha 63 ta biletni ochish uchun "💳 Tariflar" bo\'limidan Premium xarid qiling.'),
          reply_markup: MENU,
        });
      } else if (cmd === '/help' || /yordam|помощь/i.test(text)) {
        await tg(token, 'sendMessage', {
          chat_id,
          text:
            `❓ Yordam va ma'lumot:\n\n` +
            `/start — Botni qayta ishga tushirish\n` +
            `/tarif — Tariflar va narxlar\n` +
            `/login — Saytga kirish havolasi / kodi\n` +
            `/status — Sizning faol tarifingiz\n\n` +
            `To'lov bo'yicha savol bo'lsa (pul o'tkazildi, tarif ochilmadi), to'lov chekini shu yerga yuboring yoki adminga yozing: @musulman_0201`,
          reply_markup: MENU,
        });
      } else {
        await tg(token, 'sendMessage', {
          chat_id,
          text: `Quyidagi menyu tugmalaridan birini tanlang yoki /help deb yozing:`,
          reply_markup: MENU,
        });
      }
      console.log(`Javob berildi: ${first_name} (${id}) -> "${text}"`);
    } catch (e) {
      console.error('Xabar yuborishda xatolik:', e.message);
    }
  }
}
