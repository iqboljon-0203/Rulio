'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { fetchServerUserData } from '@/lib/sync';
import styles from './tickets.module.css';

// 63 total tickets (covering 1251 questions)
const TOTAL_TICKETS = 63;

const statusLabels: Record<string, [string, string]> = {
  new: ['Yangi', 'Новый'],
  passed: ["O'tilgan", 'Сдан'],
  failed: ['Yiqilgan', 'Не сдан'],
};

const statusStyles: Record<string, string> = {
  new: styles.statusNew,
  passed: styles.statusPassed,
  failed: styles.statusFailed,
};

export default function TicketsPage() {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'new'>('all');
  const [isPro, setIsPro] = useState(false);
  const tr = useLocale().t;
  const [ticketResults, setTicketResults] = useState<Record<number, { score: string; passed: boolean; status: 'passed' | 'failed' }>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rulio_ticket_results');
      if (stored) {
        setTicketResults(JSON.parse(stored));
      }
    } catch {}
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setIsPro(!!d?.premium);
        if (d?.user) {
          fetchServerUserData().then((syncData) => {
            if (syncData?.ticketResults) setTicketResults(syncData.ticketResults);
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const tickets = Array.from({ length: TOTAL_TICKETS }, (_, i) => {
    const num = i + 1;
    const res = ticketResults[num];
    const status: 'new' | 'passed' | 'failed' = res ? res.status : 'new';
    const score = res ? res.score : null;
    const locked = num > 5 && !isPro; // Free tier: first 5 tickets

    return { number: num, status, locked, score };
  });

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const passedCount = tickets.filter((t) => t.status === 'passed').length;
  const failedCount = tickets.filter((t) => t.status === 'failed').length;

  return (
    <div className={styles.ticketsPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{tr('Biletlar', 'Билеты')}</h1>
          <p className={styles.pageSubtitle}>{tr('63 ta rasmiy bilet · har birida 20 savol va 25 daqiqa', '63 официальных билета · в каждом 20 вопросов и 25 минут')}</p>
        </div>
        <div className={styles.statsSummary}>
          <span className={styles.statBadgePassed}>{passedCount} {tr("o'tilgan", 'сдано')}</span>
          <span className={styles.statBadgeFailed}>{failedCount} {tr('yiqilgan', 'не сдано')}</span>
        </div>
      </div>

      <div className={styles.strip} aria-label={`${passedCount} ta bilet o'tilgan, ${failedCount} ta yiqilgan`}>
        {tickets.map((t) => (
          <span
            key={t.number}
            className={t.status === 'passed' ? styles.sPassed : t.status === 'failed' ? styles.sFailed : undefined}
          />
        ))}
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('all')}
        >
          {tr('Barchasi', 'Все')} ({TOTAL_TICKETS})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'passed' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('passed')}
        >
          {tr("O'tilganlar", 'Сданные')} ({passedCount})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'failed' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('failed')}
        >
          {tr('Yiqilganlar', 'Не сданные')} ({failedCount})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'new' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('new')}
        >
          {tr('Yechilmagan', 'Не решённые')} ({TOTAL_TICKETS - passedCount - failedCount})
        </button>
      </div>

      <div className={styles.ticketsGrid}>
        {filteredTickets.map((ticket) => (
          <Link
            key={ticket.number}
            href={ticket.locked ? '/pricing?locked=1' : `/tickets/${ticket.number}`}
            className={`${styles.ticketCard} ${ticket.locked ? styles.ticketLocked : ticket.status === 'passed' ? styles.cardPassed : ticket.status === 'failed' ? styles.cardFailed : ''}`}
          >
            {ticket.locked ? (
              <div className={styles.lockBadge}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
                PRO
              </div>
            ) : (
              <span className={`${styles.ticketStatus} ${statusStyles[ticket.status]}`}>
                {ticket.score ? `${ticket.score}` : tr(...statusLabels[ticket.status])}
              </span>
            )}
            <p className={styles.ticketNumber}>{ticket.number}</p>
            <p className={styles.ticketLabel}>{tr('Bilet', 'Билет')}</p>
            <div className={styles.ticketCardFooter}>
              <span>{tr('20 savol', '20 вопр.')}</span>
              <span>{tr('25 daq', '25 мин')}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
