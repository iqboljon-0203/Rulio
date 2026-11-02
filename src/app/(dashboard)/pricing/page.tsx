'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { openExternal } from '@/components/telegram/telegram';
import { useLocale } from '@/components/i18n/LocaleProvider';
import styles from './pricing.module.css';

type PlanId = '2_week' | '1_month' | '3_month';

type Pair = [string, string];
const ALL: Pair = ['Barcha 63 bilet', 'Все 63 билета'];
const MIS: Pair = ['Xatolar tahlili', 'Разбор ошибок'];
const RND: Pair = ['Random test butun bazadan', 'Случайный тест по всей базе'];
const STA: Pair = ['Batafsil statistika', 'Подробная статистика'];
const plans: { id: PlanId; name: Pair; days: number; price: number; popular?: boolean; features: Pair[] }[] = [
  { id: '2_week', name: ['2 hafta', '2 недели'], days: 14, price: 15000, features: [ALL, MIS, RND] },
  { id: '1_month', name: ['1 oy', '1 месяц'], days: 30, price: 25000, popular: true, features: [ALL, MIS, RND, STA] },
  { id: '3_month', name: ['3 oy', '3 месяца'], days: 90, price: 59000, features: [ALL, MIS, RND, STA, ['Avtomaktab davri uchun', 'На весь период автошколы']] },
];

const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ');

interface Me {
  premium: boolean;
  subscription: { plan: PlanId; expiresAt: number } | null;
}

export default function PricingPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [selected, setSelected] = useState<PlanId | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<string | null>(null); // order id being paid
  const [paid, setPaid] = useState(false);
  const [locked, setLocked] = useState(false);
  const { t } = useLocale();

  const loadMe = useCallback(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMe({ premium: d.premium, subscription: d.subscription }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadMe();
    const q = new URLSearchParams(window.location.search);
    setLocked(q.get('locked') === '1');
    const order = q.get('order');
    if (order) setWaiting(order);
  }, [loadMe]);

  // Poll the order after the user went to Payme / Click
  useEffect(() => {
    if (!waiting) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries++;
      const r = await fetch(`/api/payments/status?order=${waiting}`).catch(() => null);
      const d = r?.ok ? await r.json() : null;
      if (d?.state === 'paid') {
        clearInterval(timer);
        setPaid(true);
        setWaiting(null);
        loadMe();
      } else if (d?.state === 'cancelled' || tries > 100) {
        clearInterval(timer);
        setWaiting(null);
        if (d?.state === 'cancelled') setError(t("To'lov bekor qilindi. Qaytadan urinib ko'ring.", 'Платёж отменён. Попробуйте ещё раз.'));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [waiting, loadMe]);

  const checkout = async (provider: 'payme' | 'click') => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, plan: selected }),
      });
      const data = await res.json();
      if (res.status === 401) throw new Error(t('Avval tizimga kiring.', 'Сначала войдите.'));
      if (res.status === 503) throw new Error(t("To'lov tizimi hali ulanmagan. Birozdan keyin urinib ko'ring.", 'Платёжная система ещё не подключена. Попробуйте позже.'));
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || t("To'lov havolasini yaratib bo'lmadi", 'Не удалось создать ссылку на оплату'));
      setWaiting(data.orderId);
      setSelected(null);
      openExternal(data.checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("To'lov havolasini yaratib bo'lmadi", 'Не удалось создать ссылку на оплату'));
    } finally {
      setLoading(false);
    }
  };

  const until = me?.subscription
    ? new Date(me.subscription.expiresAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className={styles.pricingPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('Tariflar', 'Тарифы')}</h1>
        <p className={styles.subtitle}>{t("Bir marta to'laysiz, pul avtomatik yechilmaydi.", 'Разовая оплата, без автосписаний.')}</p>
      </div>

      {paid && (
        <p className={`${styles.banner} ${styles.bannerOk}`} role="status">
          ✅ {t("To'lov qabul qilindi! Barcha biletlar ochildi. Tasdiq Telegram botga ham yuborildi.", 'Оплата получена! Все билеты открыты. Подтверждение отправлено в Telegram-бот.')}
        </p>
      )}
      {waiting && !paid && (
        <p className={styles.banner} role="status">
          {t("To'lov kutilmoqda… To'lovni tugatgach shu sahifaga qayting, tarif avtomatik faollashadi.", 'Ожидаем оплату… После оплаты вернитесь на эту страницу, тариф включится автоматически.')}
        </p>
      )}
      {locked && !me?.premium && (
        <p className={styles.banner}>{t('Bu bilet Premium tarifda ochiladi. Bepul tarifda 1–5 biletlar ochiq.', 'Этот билет доступен в Premium. Бесплатно открыты билеты 1–5.')}</p>
      )}
      {me?.premium && until && (
        <p className={`${styles.banner} ${styles.bannerOk}`}>{t(`Sizda Premium bor, ${until} gacha. Yangi tarif shu muddatga qo'shiladi.`, `У вас Premium до ${until}. Новый тариф добавится к этому сроку.`)}</p>
      )}
      {error && <p className={`${styles.banner} ${styles.bannerErr}`}>{error}</p>}

      <div className={styles.grid}>
        {plans.map((plan) => (
          <div key={plan.id} className={`${styles.card} ${plan.popular ? styles.popularCard : ''}`}>
            {plan.popular && <span className={styles.popularBadge}>{t("Ko'p tanlanadi", 'Популярный')}</span>}
            <h3 className={styles.planName}>{t(...plan.name)}</h3>
            <div className={styles.priceBox}>
              <span className={styles.price}>{fmt(plan.price)}</span>
              <span className={styles.currency}> {t("so'm", 'сум')}</span>
            </div>
            <p className={styles.planDesc}>
              {t(`kuniga ~${fmt(Math.round(plan.price / plan.days))} so'm · ${plan.days} kun`, `~${fmt(Math.round(plan.price / plan.days))} сум в день · ${plan.days} дней`)}
            </p>
            <ul className={styles.featureList}>
              {plan.features.map((f) => (
                <li key={f[0]} className={styles.featureItem}>
                  <span className={styles.checkIcon}>✓</span>
                  {t(...f)}
                </li>
              ))}
            </ul>
            <Button variant={plan.popular ? 'accent' : 'secondary'} onClick={() => setSelected(plan.id)}>
              {t('Tanlash', 'Выбрать')}
            </Button>
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.providerModal} onClick={() => setSelected(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className={styles.modalTitle}>{t("To'lov qilish", 'Оплата')}</h2>
            <p className={styles.modalSub}>
              Premium {t(...plans.find((p) => p.id === selected)!.name)} · {fmt(plans.find((p) => p.id === selected)!.price)} {t("so'm", 'сум')}
            </p>

            <div className={styles.cardBox}>
              <div className={styles.cardHeader}>
                <span className={styles.cardBankLabel}>Uzcard / Humo</span>
                <span className={styles.cardAmountTag}>{fmt(plans.find((p) => p.id === selected)!.price)} so&apos;m</span>
              </div>
              <div className={styles.cardNumberRow}>
                <span className={styles.cardNumber}>5614 6818 0663 9203</span>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => {
                    navigator.clipboard.writeText('5614681806639203');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? '✓ Nusxalandi' : 'Nusxa olish'}
                </button>
              </div>
              <div className={styles.cardHolder}>IQBOLJON YULDASHEV</div>
            </div>

            <div className={styles.instructions}>
              <p><b>1.</b> Istalgan bank ilovasidan (Click, Payme, Uzum va h.k.) kartaga to&apos;lov qiling.</p>
              <p><b>2.</b> To&apos;lov chekini Telegram orqali adminga yuboring.</p>
              <p><b>3.</b> 5 daqiqa ichida tarifingiz faollashadi.</p>
            </div>

            <a
              href={`https://t.me/musulman_0201?text=${encodeURIComponent(`Assalomu alaykum! Men Rulio'da Premium ${plans.find((p) => p.id === selected)!.name[0]} (${fmt(plans.find((p) => p.id === selected)!.price)} so'm) tarifiga to'lov qildim. Chekni biriktiryapman.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.telegramSendBtn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.94 4.3a1.2 1.2 0 0 0-1.62-1.36L2.9 9.66c-.98.38-.97 1.77.02 2.13l4.34 1.57 1.66 5.3c.2.66 1.03.87 1.52.38l2.43-2.4 4.53 3.33c.67.5 1.63.13 1.8-.69zM9.9 14.1l-.43 3.32-1.2-3.86 9.88-7.04z" />
              </svg>
              Chekni Telegram&apos;ga yuborish
            </a>

            <div className={styles.divider}>
              <span>yoki avtomatik to&apos;lov</span>
            </div>

            <div className={styles.providerGrid}>
              <button className={`${styles.payBtn} ${styles.paymeBtn}`} disabled={loading} onClick={() => checkout('payme')}>
                Payme
              </button>
              <button className={`${styles.payBtn} ${styles.clickBtn}`} disabled={loading} onClick={() => checkout('click')}>
                Click
              </button>
            </div>

            <Button variant="ghost" onClick={() => setSelected(null)}>
              {t('Yopish', 'Закрыть')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
