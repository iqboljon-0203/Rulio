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
const SAV: Pair = ['Saqlangan savollar va natijalar', 'Сохранённые вопросы и результаты'];
const plans: { id: PlanId; name: Pair; days: number; price: number; popular?: boolean; features: Pair[] }[] = [
  { id: '2_week', name: ['2 hafta', '2 недели'], days: 14, price: 15000, features: [ALL, MIS, RND] },
  { id: '1_month', name: ['1 oy', '1 месяц'], days: 30, price: 25000, popular: true, features: [ALL, MIS, RND, SAV] },
  { id: '3_month', name: ['3 oy', '3 месяца'], days: 90, price: 59000, features: [ALL, MIS, RND, SAV, ['Avtomaktab davri uchun', 'На весь период автошколы']] },
];

const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ');

interface P2P {
  amount: number;
  plan: PlanId;
  expiresAt: number;
  card: string;
  holder: string;
  admin: string;
  providers: { payme: boolean; click: boolean };
  baseExpiry: number; // subscription expiry before paying, to detect activation
}

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
  const [p2p, setP2p] = useState<P2P | null>(null);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [now, setNow] = useState(() => Date.now());
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

  const choose = async (plan: PlanId) => {
    setSelected(plan);
    setP2p(null);
    setError(null);
    setCopied(false);
    setCopiedAmount(false);
    try {
      const res = await fetch('/api/payments/p2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.status === 401) throw new Error(t('Avval tizimga kiring.', 'Сначала войдите.'));
      if (!res.ok) throw new Error(data.error || t("To'lov ma'lumotini olib bo'lmadi", 'Не удалось получить данные для оплаты'));
      setP2p({ ...data, baseExpiry: me?.subscription?.expiresAt ?? 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("To'lov ma'lumotini olib bo'lmadi", 'Не удалось получить данные для оплаты'));
      setSelected(null);
    }
  };

  // While the card modal is open: tick the countdown and watch for the automatic activation.
  useEffect(() => {
    if (!p2p || !selected) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(async () => {
      const r = await fetch('/api/payments/p2p').catch(() => null);
      const d = r?.ok ? await r.json() : null;
      if (d?.subscription && d.subscription.expiresAt > p2p.baseExpiry) {
        setPaid(true);
        setSelected(null);
        setP2p(null);
        loadMe();
      }
    }, 4000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [p2p, selected, loadMe]);

  const copy = (text: string, which: 'card' | 'amount') => {
    navigator.clipboard?.writeText(text).catch(() => {});
    if (which === 'card') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

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
        <div className={styles.banner} role="status">
          <p style={{ margin: 0, marginBottom: '6px' }}>
            {t("To'lov kutilmoqda… To'lovni tugatgach shu sahifaga qayting, tarif avtomatik faollashadi.", 'Ожидаем оплату… После оплаты вернитесь на эту страницу, тариф включится автоматически.')}
          </p>
          <a
            href="https://t.me/dream_tech_manager"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0088cc', textDecoration: 'underline', fontWeight: 700 }}
          >
            📸 {t("To'lov qildingizmi? Adminga chek tashlash (@dream_tech_manager)", "Оплатили? Отправить чек админу (@dream_tech_manager)")}
          </a>
        </div>
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
            <Button variant={plan.popular ? 'accent' : 'secondary'} onClick={() => choose(plan.id)}>
              {t('Tanlash', 'Выбрать')}
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.supportNote}>
        <p>
          {t("To'lov bo'yicha savol yoki chek yuborish uchun:", 'По вопросам оплаты или для отправки чека:')}{' '}
          <a href="https://t.me/dream_tech_manager" target="_blank" rel="noopener noreferrer">
            @dream_tech_manager
          </a>
        </p>
      </div>

      {selected && (
        <div className={styles.providerModal} onClick={() => setSelected(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className={styles.modalTitle}>{t("Karta orqali to'lov", 'Оплата картой')}</h2>
            <p className={styles.modalSub}>
              Premium {t(...plans.find((p) => p.id === selected)!.name)}
            </p>

            {!p2p ? (
              <p className={styles.modalSub}>{t('Yuklanmoqda…', 'Загрузка…')}</p>
            ) : p2p.expiresAt <= now ? (
              <>
                <p className={`${styles.banner} ${styles.bannerErr}`}>
                  {t("Vaqt tugadi. Yangi summa olish uchun qayta bosing.", 'Время вышло. Нажмите ещё раз, чтобы получить новую сумму.')}
                </p>
                <Button variant="accent" onClick={() => choose(selected)}>{t('Yangilash', 'Обновить')}</Button>
              </>
            ) : (
              <>
                <div className={styles.cardBox}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardBankLabel}>{t("Aynan shu summani o'tkazing", 'Переведите ровно эту сумму')}</span>
                    <span className={styles.cardAmountTag}>
                      {Math.floor((p2p.expiresAt - now) / 60000)}:{String(Math.floor(((p2p.expiresAt - now) % 60000) / 1000)).padStart(2, '0')}
                    </span>
                  </div>
                  <div className={styles.cardNumberRow}>
                    <span className={styles.cardNumber}>{fmt(p2p.amount)} {t("so'm", 'сум')}</span>
                    <button type="button" className={styles.copyBtn} onClick={() => copy(String(p2p.amount), 'amount')}>
                      {copiedAmount ? '✓' : t('Nusxa', 'Копировать')}
                    </button>
                  </div>
                  <div className={styles.cardNumberRow}>
                    <span className={styles.cardNumber}>{p2p.card}</span>
                    <button type="button" className={styles.copyBtn} onClick={() => copy(p2p.card.replace(/\s/g, ''), 'card')}>
                      {copied ? '✓' : t('Nusxa', 'Копировать')}
                    </button>
                  </div>
                  <div className={styles.cardHolder}>{p2p.holder}</div>
                </div>

                <div className={styles.instructions}>
                  <p><b>1.</b> {t("Istalgan bank ilovasidan (Click, Payme, Uzum va h.k.) kartaga o'tkazing.", 'Переведите на карту из любого банковского приложения.')}</p>
                  <p><b>2.</b> {t(`Summa aynan ${fmt(p2p.amount)} so'm bo'lsin — shu bilan to'lov sizga bog'lanadi.`, `Сумма должна быть ровно ${fmt(p2p.amount)} сум — по ней платёж привязывается к вам.`)}</p>
                  <p><b>3.</b> {t("Tarif avtomatik ochiladi, shu oynani yopmasangiz ham bo'ladi.", 'Тариф включится автоматически.')}</p>
                </div>

                <a
                  href={`https://t.me/${p2p.admin || 'dream_tech_manager'}?text=${encodeURIComponent(
                    `Assalomu alaykum! Rulio'da to'lov qildim.\nTarif: Premium ${t(...plans.find((p) => p.id === selected)!.name)}\nSumma: ${fmt(p2p.amount)} so'm.\nChekni yubormoqdaman:`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.telegramSendBtn}
                >
                  📸 {t("To'lov qildim (Adminga chek tashlash)", "Я оплатил (Отправить чек админу)")}
                </a>

                <p className={styles.modalSub}>
                  {t("To'lov kutilmoqda…", 'Ожидаем оплату…')}{' '}
                  <a href={`https://t.me/${p2p.admin || 'dream_tech_manager'}`} target="_blank" rel="noopener noreferrer">
                    @{p2p.admin || 'dream_tech_manager'}
                  </a>
                </p>

                {(p2p.providers.payme || p2p.providers.click) && (
                  <>
                    <div className={styles.divider}>
                      <span>{t('yoki', 'или')}</span>
                    </div>
                    <div className={styles.providerGrid}>
                      {p2p.providers.payme && (
                        <button className={`${styles.payBtn} ${styles.paymeBtn}`} disabled={loading} onClick={() => checkout('payme')}>
                          Payme
                        </button>
                      )}
                      {p2p.providers.click && (
                        <button className={`${styles.payBtn} ${styles.clickBtn}`} disabled={loading} onClick={() => checkout('click')}>
                          Click
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <Button variant="ghost" onClick={() => setSelected(null)}>
              {t('Yopish', 'Закрыть')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
