// Production: point the bot at your deployed site.
//   node scripts/telegram-webhook.mjs https://rulio.uz
// Remove the webhook (e.g. to use scripts/telegram-dev.mjs locally):
//   node scripts/telegram-webhook.mjs --delete
import { loadEnv, tg, webhookSecret } from './_env.mjs';

const token = loadEnv();
const arg = process.argv[2];

if (arg === '--delete') {
  console.log(await tg(token, 'deleteWebhook'));
} else if (arg?.startsWith('https://')) {
  const url = `${arg.replace(/\/$/, '')}/api/telegram/webhook`;
  const res = await tg(token, 'setWebhook', {
    url,
    secret_token: webhookSecret(token),
    allowed_updates: ['message', 'callback_query'],
  });
  console.log(res.ok ? `Webhook o'rnatildi: ${url}` : res);
  await tg(token, 'setMyCommands', {
    commands: [
      { command: 'start', description: 'Botni ishga tushirish' },
      { command: 'tarif', description: 'Tariflar va narxlar' },
      { command: 'login', description: 'Saytga kirish (kod / havola)' },
      { command: 'status', description: 'Mening tarifim' },
      { command: 'help', description: 'Yordam' },
    ],
  });
  // Chat menu button that opens the Mini App
  const menu = await tg(token, 'setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Ochish', web_app: { url: `${arg.replace(/\/$/, '')}/home` } },
  });
  console.log(menu.ok ? 'Menyu tugmasi (Mini App) o\'rnatildi' : menu);
  await tg(token, 'setMyDescription', {
    description: "Prava imtihoniga tayyorgarlik: 1250+ rasmiy savol, 63 bilet, xatolar tahlili. 5 ta bilet bepul.",
  });
  await tg(token, 'setMyShortDescription', { short_description: 'Prava testlari 2026 — Rulio' });
} else {
  console.log('Foydalanish: node scripts/telegram-webhook.mjs https://sizning-domen.uz  |  --delete');
}
