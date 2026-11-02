'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useLocale } from '@/components/i18n/LocaleProvider';
import styles from './profile.module.css';

interface Profile {
  name: string;
  username?: string;
  subscriptionPlan: string;
  subscriptionExpiresAt: number | null;
}

const planName: Record<string, [string, string]> = {
  '2_week': ['2 hafta', '2 недели'],
  '1_month': ['1 oy', '1 месяц'],
  '3_month': ['3 oy', '3 месяца'],
};

export default function ProfilePage() {
  const { t } = useLocale();
  const router = useRouter();
  const [p, setP] = useState<Profile | null>(null);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user && setP(d.user))
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/login');
  };

  const resetProgress = () => {
    try {
      localStorage.removeItem('rulio_ticket_results');
      localStorage.removeItem('rulio_mistakes');
    } catch {}
    router.push('/home');
  };

  const name = p?.name ?? '…';
  const premium = p && p.subscriptionPlan !== 'free' && p.subscriptionExpiresAt;
  const pn = p ? planName[p.subscriptionPlan] : undefined;

  return (
    <div className={styles.profilePage}>
      <h1 className={styles.title}>{t('Profil', 'Профиль')}</h1>
      <p className={styles.subtitle}>{t('Hisobingiz Telegram orqali ulangan.', 'Аккаунт привязан к Telegram.')}</p>

      <div className={styles.profileCard}>
        <div className={styles.userHeader}>
          <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{name}</h2>
            <p className={styles.userPhone}>{p?.username ? `@${p.username}` : 'Telegram'}</p>
            <span className={`${styles.badge} ${premium ? styles.badgePro : styles.badgeFree}`}>
              {premium && pn
                ? `PREMIUM · ${t(pn[0], pn[1])} · ${t('gacha', 'до')} ${new Date(p!.subscriptionExpiresAt!).toLocaleDateString('ru-RU')}`
                : t('Bepul tarif · 5 bilet', 'Бесплатно · 5 билетов')}
            </span>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>{t('Interfeys tili', 'Язык интерфейса')}</label>
            <LanguageSelector fullWidth />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {!premium && (
            <Link href="/pricing">
              <Button variant="accent">{t('Premium olish', 'Купить Premium')}</Button>
            </Link>
          )}
          <Button variant="secondary" onClick={logout}>
            {t('Chiqish', 'Выйти')}
          </Button>
        </div>
      </div>

      <div className={styles.profileCard}>
        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: 8 }}>{t('Natijalar', 'Результаты')}</h3>
        <p className={styles.subtitle} style={{ marginBottom: 16 }}>
          {t(
            "Natijalar va xatolar shu qurilmada saqlanadi. Qaytadan boshlamoqchi bo'lsangiz, tozalang.",
            'Результаты и ошибки хранятся на этом устройстве. Чтобы начать заново, очистите их.',
          )}
        </p>
        <Button variant="ghost" onClick={resetProgress}>
          {t('Natijalarni tozalash', 'Сбросить результаты')}
        </Button>
      </div>
    </div>
  );
}
