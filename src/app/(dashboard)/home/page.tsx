'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { fetchServerUserData } from '@/lib/sync';
import styles from './home.module.css';

const TOTAL_TICKETS = 63;
const FREE_TICKETS = 5;

interface TicketResult {
  score: string;
  passed: boolean;
  timestamp: number;
}

interface Progress {
  results: [number, TicketResult][];
  mistakes: number;
}

function readProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem('rulio_ticket_results') || '{}') as Record<string, TicketResult>;
    const results = Object.entries(raw)
      .map(([k, v]) => [Number(k), v] as [number, TicketResult])
      .sort((a, b) => b[1].timestamp - a[1].timestamp);
    const mistakes = JSON.parse(localStorage.getItem('rulio_mistakes') || '[]');
    return { results, mistakes: Array.isArray(mistakes) ? mistakes.length : 0 };
  } catch {
    return { results: [], mistakes: 0 };
  }
}

export default function HomePage() {
  const { t } = useLocale();
  const [name, setName] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [p, setP] = useState<Progress>({ results: [], mistakes: 0 });

  useEffect(() => {
    setP(readProgress());
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setName(d?.user?.name?.split(' ')[0] ?? null);
        setPremium(!!d?.premium);
        if (d?.user) {
          fetchServerUserData().then(() => setP(readProgress())).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const solved = p.results.length;
  const passed = p.results.filter(([, r]) => r.passed).length;
  const avg = solved
    ? Math.round(
        (p.results.reduce((s, [, r]) => {
          const [a, b] = r.score.split('/').map(Number);
          return s + (b ? a / b : 0);
        }, 0) /
          solved) *
          100,
      )
    : 0;
  const available = premium ? TOTAL_TICKETS : FREE_TICKETS;
  const done = new Set(p.results.filter(([, r]) => r.passed).map(([n]) => n));
  let next = 1;
  while (done.has(next) && next < available) next++;
  const readiness = Math.round((passed / TOTAL_TICKETS) * 100);

  const ago = (ts: number) => {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 60) return t(`${Math.max(m, 1)} daqiqa oldin`, `${Math.max(m, 1)} мин назад`);
    const h = Math.round(m / 60);
    if (h < 24) return t(`${h} soat oldin`, `${h} ч назад`);
    return t(`${Math.round(h / 24)} kun oldin`, `${Math.round(h / 24)} дн назад`);
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.heroBanner}>
        <div className={styles.heroTop}>
          <div>
            <h1 className={styles.heroGreeting}>
              {t('Salom', 'Привет')}, {name ?? t('haydovchi', 'водитель')}! 👋
            </h1>
            <p className={styles.heroSub}>
              {solved === 0
                ? t("Birinchi biletdan boshlang. 20 savol, 25 daqiqa, 2 tagacha xato mumkin.", 'Начните с первого билета. 20 вопросов, 25 минут, до 2 ошибок.')
                : p.mistakes > 0
                ? t(`Bugungi reja: Bilet ${next} va ${p.mistakes} ta xatoni takrorlash.`, `План на сегодня: билет ${next} и повтор ${p.mistakes} ошибок.`)
                : t(`Bugungi reja: Bilet ${next}.`, `План на сегодня: билет ${next}.`)}
            </p>
          </div>
          <Link href={`/tickets/${next}`} className={styles.heroCta}>
            <span>{t(`Bilet ${next} ni boshlash`, `Начать билет ${next}`)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}>📊</div>
          </div>
          <div>
            <p className={styles.statValue}>{readiness}%</p>
            <p className={styles.statLabel}>{t('Umumiy tayyorgarlik', 'Общая готовность')}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>✅</div>
            <span className={`${styles.statTrend} ${styles.statTrendNeutral}`}>
              {passed} / {TOTAL_TICKETS}
            </span>
          </div>
          <div>
            <p className={styles.statValue}>{passed}</p>
            <p className={styles.statLabel}>{t("O'tilgan biletlar", 'Сданные билеты')}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>🎯</div>
          </div>
          <div>
            <p className={styles.statValue}>{solved ? `${avg}%` : '—'}</p>
            <p className={styles.statLabel}>{t("O'rtacha natija", 'Средний результат')}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>❌</div>
          </div>
          <div>
            <p className={styles.statValue}>{p.mistakes}</p>
            <p className={styles.statLabel}>{t('Takrorlanadigan xatolar', 'Ошибки на повтор')}</p>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.gridColumn}>
          <div className={styles.examCard}>
            <div className={styles.examCardHeader}>
              <span className={styles.examBadge}>{t('IMTIHON REJIMI', 'РЕЖИМ ЭКЗАМЕНА')}</span>
            </div>
            <div>
              <h2 className={styles.examTitle}>{t('Imtihon simulyatori', 'Симулятор экзамена')}</h2>
              <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '4px' }}>
                {premium
                  ? t('Butun bazadan 20 ta aralash savol.', '20 случайных вопросов из всей базы.')
                  : t('Bepul tarifda 1–5 biletlar savollaridan aralash.', 'В бесплатном тарифе — вопросы из билетов 1–5.')}
              </p>
            </div>
            <div className={styles.examTags}>
              <span className={styles.examTag}>⏱️ {t('25 daqiqa', '25 минут')}</span>
              <span className={styles.examTag}>📝 {t('20 savol', '20 вопросов')}</span>
              <span className={styles.examTag}>❌ {t('Maksimal 2 ta xato', 'Максимум 2 ошибки')}</span>
            </div>
            <Link href="/random" className={styles.examStartBtn}>
              <span>{t('Boshlash', 'Начать')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
              </svg>
            </Link>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>
              {t('Tezkor harakatlar', 'Быстрые действия')}
            </h2>
            <div className={styles.quickActionsGrid}>
              <Link href="/tickets" className={styles.quickActionCard}>
                <div className={styles.quickActionTop}>
                  <span className={styles.quickActionIcon}>📋</span>
                </div>
                <p className={styles.quickActionTitle}>{t('Biletlar', 'Билеты')}</p>
                <p className={styles.quickActionDesc}>
                  {premium ? t('63 ta bilet ochiq', 'Открыто 63 билета') : t('5 ta bilet bepul', '5 билетов бесплатно')}
                </p>
              </Link>
              <Link href="/random" className={styles.quickActionCard}>
                <div className={styles.quickActionTop}>
                  <span className={styles.quickActionIcon}>🎲</span>
                </div>
                <p className={styles.quickActionTitle}>{t('Random test', 'Случайный тест')}</p>
                <p className={styles.quickActionDesc}>{t('20 ta aralash savol', '20 случайных вопросов')}</p>
              </Link>
              <Link href="/mistakes" className={styles.quickActionCard}>
                <div className={styles.quickActionTop}>
                  <span className={styles.quickActionIcon}>❌</span>
                </div>
                <p className={styles.quickActionTitle}>{t('Xatolar ustida ishlash', 'Работа над ошибками')}</p>
                <p className={styles.quickActionDesc}>{t(`${p.mistakes} ta savol`, `${p.mistakes} вопросов`)}</p>
              </Link>
              <Link href="/saved" className={styles.quickActionCard}>
                <div className={styles.quickActionTop}>
                  <span className={styles.quickActionIcon}>★</span>
                </div>
                <p className={styles.quickActionTitle}>{t('Saqlanganlar', 'Сохранённые')}</p>
                <p className={styles.quickActionDesc}>{t("Belgilab qo'yilgan savollar", 'Отмеченные вопросы')}</p>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.gridColumn}>
          <div className={styles.dailyGoalCard}>
            <h2 className={styles.sectionTitle}>{t('Imtihonga tayyorgarlik', 'Готовность к экзамену')}</h2>
            <div className={styles.goalProgressWrap}>
              <div className={styles.goalCircle}>{readiness}%</div>
              <div className={styles.goalMeta}>
                <p className={styles.goalTitle}>{t(`${passed} / ${TOTAL_TICKETS} bilet o'tildi`, `Сдано ${passed} / ${TOTAL_TICKETS} билетов`)}</p>
                <p className={styles.goalSub}>{t("Bilet 18+ to'g'ri javob bilan o'tilgan hisoblanadi.", 'Билет считается сданным при 18+ правильных ответах.')}</p>
              </div>
            </div>
            <ProgressBar value={readiness} showPercentage={false} size="sm" />
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t("So'nggi natijalar", 'Последние результаты')}</h2>
              <Link href="/tickets" className={styles.sectionLink}>{t('Barchasi', 'Все')}</Link>
            </div>
            <div className={styles.activityList}>
              {p.results.length === 0 && (
                <p className={styles.activityTime}>{t("Hali test yechilmagan.", 'Тесты ещё не решались.')}</p>
              )}
              {p.results.slice(0, 4).map(([n, r]) => (
                <div key={n} className={styles.activityItem}>
                  <div className={styles.activityLeft}>
                    <div className={`${styles.activityStatusIcon} ${r.passed ? styles.activityPassed : styles.activityFailed}`}>
                      {r.passed ? '✓' : '✕'}
                    </div>
                    <div>
                      <p className={styles.activityName}>{t('Bilet', 'Билет')} #{n}</p>
                      <p className={styles.activityTime}>{ago(r.timestamp)}</p>
                    </div>
                  </div>
                  <span className={`${styles.activityScore} ${r.passed ? styles.scorePassed : styles.scoreFailed}`}>{r.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>💡</div>
            <div>
              <p className={styles.tipTitle}>{t('Maslahat', 'Совет')}</p>
              <p className={styles.tipText}>
                {t(
                  "Teng ahamiyatli yo'llar chorrahasida o'ng tomondan kelayotgan transportga yo'l bering (o'ng qo'l qoidasi).",
                  'На перекрёстке равнозначных дорог уступайте транспорту, приближающемуся справа (правило правой руки).',
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
