'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { isTelegramApp } from '@/components/telegram/telegram';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botLink, setBotLink] = useState<string | null>(null);
  const [botName, setBotName] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [inTelegram, setInTelegram] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    // Inside the Telegram Mini App sign-in is automatic (TelegramProvider).
    if (isTelegramApp()) {
      setInTelegram(true);
      return;
    }
    const err = new URLSearchParams(window.location.search).get('error');
    if (err === 'expired') {
      setError(t('Kirish havolasi eskirgan. Botdan yangi kod oling.', 'Ссылка для входа устарела. Получите новый код в боте.'));
    }
    fetch('/api/telegram/bot')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { link: string; username: string }) => {
        setBotLink(d.link);
        setBotName(d.username);
      })
      .catch(() => setUnavailable(true));
  }, [t]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      setError(t("Kodni 6 xonali qilib kiriting", "Введите 6-значный код"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || t("Kod noto'g'ri yoki muddati eskirgan", "Неверный или устаревший код"));
      }
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Xatolik yuz berdi", "Произошла ошибка"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authLogoRow}>
          <Logo href="/" size="lg" />
          <LanguageSelector variant="compact" />
        </div>

        {inTelegram ? (
          <>
            <h1 className={styles.authTitle}>{t('Kirilmoqda…', 'Входим…')}</h1>
            <p className={styles.authSubtitle}>{t('Telegram hisobingiz orqali tizimga kiryapmiz.', 'Входим через ваш аккаунт Telegram.')}</p>
          </>
        ) : (
          <>
            <h1 className={styles.authTitle}>{t('Saytga kirish', 'Вход на сайт')}</h1>
            <p className={styles.authSubtitle}>
              {t('Telegram botdan olingan 6 xonali kodni kiriting.', 'Введите 6-значный код, полученный в Telegram-боте.')}
            </p>

            {error && (
              <p className={styles.authAlert} role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleCodeSubmit} className={styles.codeForm}>
              <div className={styles.codeInputWrapper}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  className={styles.codeInput}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={code.length !== 6 || loading}
                className={styles.submitCodeBtn}
              >
                {loading ? t('Tekshirilmoqda…', 'Проверка…') : t('Saytga kirish →', 'Войти на сайт →')}
              </button>
            </form>

            <div className={styles.authDivider}>
              <span>{t('Kodni qayerdan olaman?', 'Где взять код?')}</span>
            </div>

            <a
              href={botLink ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.telegramBtn} ${!botLink ? styles.telegramBtnDisabled : ''}`}
              aria-disabled={!botLink}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.94 4.3a1.2 1.2 0 0 0-1.62-1.36L2.9 9.66c-.98.38-.97 1.77.02 2.13l4.34 1.57 1.66 5.3c.2.66 1.03.87 1.52.38l2.43-2.4 4.53 3.33c.67.5 1.63.13 1.8-.69zM9.9 14.1l-.43 3.32-1.2-3.86 9.88-7.04z"
                />
              </svg>
              {botLink
                ? t('Telegram botdan kod olish', 'Получить код в боте')
                : unavailable
                ? t('Bot hali ulanmagan', 'Бот ещё не подключён')
                : t('Yuklanmoqda…', 'Загрузка…')}
            </a>

            <p className={styles.codeHint}>
              {t(
                'Telegram botingizda "🔑 Kod olish" tugmasini bosing yoki /login deb yozing.',
                'Нажмите кнопку "🔑 Kod olish" в боте или напишите /login.'
              )}
            </p>

            {unavailable && (
              <p className={styles.authHint}>
                Administrator uchun: <code>.env.local</code> fayliga <code>TELEGRAM_BOT_TOKEN</code> qo&apos;shing.
              </p>
            )}

            <p className={styles.authFooter}>
              <Link href="/">← {t('Bosh sahifaga qaytish', 'На главную')}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
