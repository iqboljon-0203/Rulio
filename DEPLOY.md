# Rulio — Vercel'ga chiqarish

## 0. Lokal tekshiruv (1 marta)
```bash
npm install
copy .dev.vars .env.local      # Windows (bot tokeni shu faylda)
npm run build                  # xatosiz o'tishi kerak
npm run dev                    # http://localhost:3000
```

## 1. GitHub
Loyihani GitHub'ga private repo qilib yuklang (`.env.local`, `.dev.vars` git'ga tushmaydi).

## 2. Vercel
1. vercel.com → **Add New → Project** → GitHub repo'ni tanlang. Framework: Next.js (avtomatik).
2. **Storage → Marketplace → Upstash (Redis)** → Create → loyihaga ulang.
   `KV_REST_API_URL` va `KV_REST_API_TOKEN` o'zi qo'shiladi.
   Busiz to'lovlar va obunalar server qayta ishga tushganda yo'qoladi.
3. **Settings → Environment Variables** — `.env.example` dagilarni kiriting:
   `TELEGRAM_BOT_TOKEN`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL=https://rulio.uz`,
   Payme va Click kalitlari (hozircha bo'lmasa keyin qo'shasiz, sayt ishlayveradi,
   faqat "To'lov tizimi hali ulanmagan" chiqadi).
4. **Deploy**.

> Vercel Hobby (bepul) tarifi faqat shaxsiy, notijorat loyihalar uchun.
> Pul qabul qiladigan sayt uchun **Pro** tarif kerak.

## 3. Domen rulio.uz
Vercel → Settings → Domains → `rulio.uz` va `www.rulio.uz` qo'shing.
Domen panelida (ahost / uzdomain va h.k.) Vercel ko'rsatgan DNS yozuvlarini kiriting:
- `A  @  76.76.21.21`
- `CNAME  www  cname.vercel-dns.com`
(aniq qiymatlarni Vercel sahifasidan oling). SSL o'zi ulanadi.

## 4. Telegram bot
Sayt https'da ochilgach, kompyuterda bir marta:
```bash
npm run bot:webhook https://rulio.uz
```
Bu webhook, buyruqlar (/login /tarif /status /help), Mini App menyu tugmasi va bot tavsifini o'rnatadi.
Keyin **BotFather → /mybots → Bot Settings → Configure Mini App** ga ham `https://rulio.uz/home` qo'ying.
Token chatda ochiq ko'ringani uchun: BotFather → /revoke → yangi tokenni Vercel'ga yozing → `npm run bot:webhook https://rulio.uz` ni qayta ishga tushiring.

## 5. Payme
business.payme.uz → kassa yarating → Sozlamalar:
- **Endpoint URL:** `https://rulio.uz/api/payments/payme`
- Hisob maydoni (account): **`order_id`**
- Kassa ID → `PAYME_MERCHANT_ID`, kalit → `PAYME_MERCHANT_KEY`
- Avval test kalit + `PAYME_CHECKOUT_URL=https://test.paycom.uz` bilan test.paycom.uz sandbox'idan barcha testlardan o'ting, keyin production kalitga almashtiring va `PAYME_CHECKOUT_URL` ni o'chiring.

## 6. Click
merchant.click.uz → servis sozlamalari:
- **Prepare URL:** `https://rulio.uz/api/payments/click`
- **Complete URL:** `https://rulio.uz/api/payments/click`
- `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID`, `CLICK_SECRET_KEY`

## 7. Google
search.google.com/search-console → `rulio.uz` domen sifatida qo'shing (DNS TXT orqali) →
Sitemaps → `https://rulio.uz/sitemap.xml`.

## Foydalanuvchi to'lov qilganda nima bo'ladi
1. Botda **/tarif** yoki "💳 Tariflar" → narxlar + "💳 Tarif tanlash" (Mini App'da /pricing ochiladi).
2. Tarif → Payme/Click → to'lov sahifasi ochiladi.
3. Payme/Click serveri `/api/payments/...` ga xabar beradi → obuna yoziladi (muddat ustiga qo'shiladi).
4. Bot darhol yozadi: "✅ To'lov qabul qilindi! Tarif… Summa… Amal qiladi: … gacha" + "📱 Testlarni boshlash".
5. Sahifa o'zi yangilanadi, 6–63 biletlar ochiladi. **/status** har doim joriy tarifni ko'rsatadi.
