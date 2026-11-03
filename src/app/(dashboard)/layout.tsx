'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { fetchServerUserData } from '@/lib/sync';
import styles from './dashboard.module.css';

const navItems = [
  {
    href: '/home',
    label: ['Bosh sahifa', 'Главная'] as [string, string],
    badge: null,
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/tickets',
    label: ['Biletlar', 'Билеты'] as [string, string],
    badge: '63',
    badgeType: 'normal',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
      </svg>
    ),
  },
  {
    href: '/octagon',
    label: ['AI Trenajyor', 'AI Тренажёр'] as [string, string],
    badge: null,
    badgeType: 'hot',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <path d="M12 22V12" />
        <path d="M22 8.5L12 12 2 8.5" />
      </svg>
    ),
  },
  {
    href: '/random',
    label: ['Random Test', 'Случайный тест'] as [string, string],
    badge: null,
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    href: '/saved',
    label: ['Saqlanganlar', 'Сохранённые'] as [string, string],
    badge: null,
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    href: '/mistakes',
    label: ['Xatolar', 'Ошибки'] as [string, string],
    badge: null,
    badgeType: 'warning',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    href: '/pricing',
    label: ['Tariflar', 'Тарифы'] as [string, string],
    badge: 'PRO',
    badgeType: 'hot',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: ['Profil', 'Профиль'] as [string, string],
    badge: null,
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; username?: string } | null>(null);
  const [premiumUntil, setPremiumUntil] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const { t } = useLocale();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setUser(d?.user ?? null);
        setPremiumUntil(d?.premium ? d.subscription?.expiresAt ?? null : null);
        if (d?.user) {
          fetchServerUserData().then((syncData) => {
            if (syncData?.mistakes) setMistakes(syncData.mistakes.length);
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const m = JSON.parse(localStorage.getItem('rulio_mistakes') || '[]');
      setMistakes(Array.isArray(m) ? m.length : 0);
    } catch {
      setMistakes(0);
    }
  }, [pathname]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/login');
  };

  const displayName = user?.name ?? 'Haydovchi';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'H';

  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarMobile : ''}`}>
        {/* Top: Logo & Navigation */}
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarHeader}>
            <Logo href="/home" size="sm" />
            <span className={styles.versionBadge}>v1.2</span>
          </div>

          <nav className={styles.sidebarNav}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/home' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={styles.navItemLeft}>
                    {item.icon}
                    <span>{t(item.label[0], item.label[1])}</span>
                  </div>
                  {item.href === '/mistakes' && mistakes > 0 && (
                    <span className={`${styles.navBadge} ${styles.navBadgeWarning}`}>{mistakes}</span>
                  )}
                  {item.badge && (
                    <span
                      className={`${styles.navBadge} ${
                        item.badgeType === 'hot'
                          ? styles.navBadgeHot
                          : item.badgeType === 'warning'
                          ? styles.navBadgeWarning
                          : isActive
                          ? styles.navBadgeActive
                          : ''
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Pro Upgrade & User status */}
        <div className={styles.sidebarBottom}>
          {premiumUntil ? (
            <Link href="/pricing" className={styles.proMiniCard}>
              <div className={styles.proMiniTop}>
                <span className={styles.proMiniTitle}>Rulio PRO</span>
                <span className={styles.proMiniBadge}>{t('FAOL', 'АКТИВЕН')}</span>
              </div>
              <p className={styles.proMiniDesc}>
                {t('Amal qiladi:', 'Действует до:')} {new Date(premiumUntil).toLocaleDateString('ru-RU')}
              </p>
            </Link>
          ) : (
          <Link href="/pricing" className={styles.proMiniCard}>
            <div className={styles.proMiniTop}>
              <span className={styles.proMiniTitle}>Rulio PRO</span>
              <span className={styles.proMiniBadge}>PREMIUM</span>
            </div>
            <p className={styles.proMiniDesc}>
              {t('Barcha 63 ta bilet va xatolar tahlili', 'Все 63 билета и разбор ошибок')}
            </p>
            <div className={styles.proMiniBtn}>
              <span>{t('Faollashtirish', 'Активировать')}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </Link>
          )}

          <Link href="/profile" className={styles.userRow}>
            <div className={styles.userRowLeft}>
              <div className={styles.userRowAvatar}>{initial}</div>
              <div className={styles.userRowMeta}>
                <span className={styles.userRowName}>{displayName}</span>
                <span className={styles.userRowStatus}>{user?.username ? `@${user.username}` : 'B toifa'}</span>
              </div>
            </div>
          </Link>
          <button type="button" className={styles.logoutBtn} onClick={logout}>
            {t('Chiqish', 'Выйти')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Navbar */}
        <header className={styles.topNavbar}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label={t('Menyuni ochish', 'Открыть меню')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!premiumUntil && (
              <Link href="/pricing" className={styles.streakPill}>
                <span>⭐</span>
                <span>{t('Premium olish', 'Купить Premium')}</span>
              </Link>
            )}
          </div>

          <div className={styles.topNavRight}>
            <LanguageSelector variant="compact" />
            <Link href="/profile" style={{ display: 'flex', alignItems: 'center' }}>
              <div className={styles.userRowAvatar} style={{ width: 32, height: 32, fontSize: 12 }}>{initial}</div>
            </Link>
          </div>
        </header>

        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
