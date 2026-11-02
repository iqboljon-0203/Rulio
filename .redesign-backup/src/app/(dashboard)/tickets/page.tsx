'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './tickets.module.css';

// 63 total tickets (covering 1251 questions)
const TOTAL_TICKETS = 63;

const statusLabels: Record<string, string> = {
  new: 'Yangi',
  passed: "O'tilgan",
  failed: "Yiqilgan",
};

const statusStyles: Record<string, string> = {
  new: styles.statusNew,
  passed: styles.statusPassed,
  failed: styles.statusFailed,
};

export default function TicketsPage() {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'new'>('all');
  const [ticketResults, setTicketResults] = useState<Record<number, { score: string; passed: boolean; status: 'passed' | 'failed' }>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rulio_ticket_results');
      if (stored) {
        setTicketResults(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const tickets = Array.from({ length: TOTAL_TICKETS }, (_, i) => {
    const num = i + 1;
    const res = ticketResults[num];
    const status: 'new' | 'passed' | 'failed' = res ? res.status : 'new';
    const score = res ? res.score : null;
    const locked = num > 5 && !localStorage.getItem('rulio_is_pro'); // Free tier: first 5 tickets

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
          <h1 className={styles.pageTitle}>Imtihon Biletlari</h1>
          <p className={styles.pageSubtitle}>63 ta rasmiy bilet (har birida 20 tadan test savollari)</p>
        </div>
        <div className={styles.statsSummary}>
          <span className={styles.statBadgePassed}>✅ {passedCount} o&apos;tilgan</span>
          <span className={styles.statBadgeFailed}>❌ {failedCount} yiqilgan</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('all')}
        >
          Barchasi ({TOTAL_TICKETS})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'passed' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('passed')}
        >
          O&apos;tilganlar ({passedCount})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'failed' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('failed')}
        >
          Yiqilganlar ({failedCount})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'new' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('new')}
        >
          Yechilmagan ({TOTAL_TICKETS - passedCount - failedCount})
        </button>
      </div>

      <div className={styles.ticketsGrid}>
        {filteredTickets.map((ticket) => (
          <Link
            key={ticket.number}
            href={ticket.locked ? '/pricing' : `/tickets/${ticket.number}`}
            className={`${styles.ticketCard} ${ticket.locked ? styles.ticketLocked : ''}`}
          >
            {ticket.locked ? (
              <div className={styles.lockBadge}>
                <span>🔒 PRO</span>
              </div>
            ) : (
              <span className={`${styles.ticketStatus} ${statusStyles[ticket.status]}`}>
                {ticket.score ? `${ticket.score}` : statusLabels[ticket.status]}
              </span>
            )}
            <p className={styles.ticketNumber}>#{ticket.number}</p>
            <p className={styles.ticketLabel}>Bilet {ticket.number}</p>
            <div className={styles.ticketCardFooter}>
              <span>20 savol</span>
              <span>25 daq</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
