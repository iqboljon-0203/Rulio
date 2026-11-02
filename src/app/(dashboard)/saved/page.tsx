'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LogoIcon } from '@/components/ui/Logo';
import { QuestionWithAnswer } from '@/types/test';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { fetchServerUserData, syncUserData } from '@/lib/sync';
import styles from '../tickets/[id]/test.module.css';

export default function SavedQuestionsPage() {
  const { t, tc } = useLocale();
  const [savedItems, setSavedItems] = useState<QuestionWithAnswer[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadQuestionsForIds = (ids: string[]) => {
    if (ids.length === 0) {
      setSavedItems([]);
      return;
    }
    fetch(`/api/questions?ids=${encodeURIComponent(ids.join(','))}`)
      .then((r) => r.json())
      .then((d) => setSavedItems(d.questions ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    let localIds: string[] = [];
    try {
      const savedMap: Record<string, boolean> = JSON.parse(localStorage.getItem('rulio_saved') || '{}');
      localIds = Object.keys(savedMap).filter((k) => savedMap[k]);
      if (localIds.length > 0) {
        loadQuestionsForIds(localIds);
      }
    } catch {}

    fetchServerUserData()
      .then((syncData) => {
        if (syncData?.saved) {
          const serverIds = Object.keys(syncData.saved).filter((k) => syncData.saved[k]);
          const combined = Array.from(new Set([...localIds, ...serverIds]));
          if (combined.length > localIds.length) {
            loadQuestionsForIds(combined);
          }
        }
      })
      .catch(() => {});
  }, []);

  const removeBookmark = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.questionId !== id));
    try {
      const stored = localStorage.getItem('rulio_saved');
      if (stored) {
        const savedMap = JSON.parse(stored);
        delete savedMap[id];
        localStorage.setItem('rulio_saved', JSON.stringify(savedMap));
        syncUserData({ saved: savedMap }).catch(() => {});
      }
    } catch {}
  };

  if (savedItems.length === 0) {
    return (
      <div className={styles.testPage}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '48px' }}>★</span>
          <h2 style={{ marginTop: '16px', color: 'var(--text-primary)' }}>{t("Saqlangan savollar yo'q", 'Нет сохранённых вопросов')}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Biletlarni yechayotganda qiyin savollarni ⭐ Saqlash tugmasi orqali bu yerga qo&apos;shishingiz mumkin.
          </p>
          <Link href="/tickets">
            <Button variant="primary">{t("Biletlarga o'tish", 'К билетам')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.testPage}>
      <h1 className={styles.testTitle}>★ {t('Saqlangan savollar', 'Сохранённые вопросы')} ({savedItems.length})</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Takrorlash uchun xatcho&apos;pga kiritilgan qiyin savollar ro&apos;yxati
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {savedItems.map((item) => {
          const isExpanded = expandedId === item.questionId;

          return (
            <div key={item.questionId} className={styles.questionCard} style={{ marginBottom: 0 }}>
              <div className={styles.cardHeaderRow}>
                <span className={styles.categoryBadge}>{tc(item.category)}</span>
                <button
                  className={`${styles.bookmarkBtn} ${styles.bookmarked}`}
                  onClick={() => removeBookmark(item.questionId)}
                >
                  ★ O&apos;chirish
                </button>
              </div>

              {/* Question image or sign */}
              {item.imageUrl && (
                <div className={styles.questionImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={t('Savol rasmi', 'Изображение к вопросу')} />
                  <div className={styles.brandWatermarkCover}>
                    <LogoIcon size={18} />
                    <span>Rulio</span>
                  </div>
                </div>
              )}

              <h3 className={styles.questionText} style={{ fontSize: 'var(--text-base)', marginBottom: '12px' }}>
                {t('Bilet', 'Билет')} #{item.ticketNumber}: {tc(item.text)}
              </h3>

              <button
                className={styles.explanationToggle}
                onClick={() => setExpandedId(isExpanded ? null : item.questionId)}
              >
                💡 {isExpanded ? t('Yopish', 'Скрыть') : t("Javob va tushuntirishni ko'rish", 'Показать ответ и пояснение')}
              </button>

              {isExpanded && (
                <div className={styles.explanationBox}>
                  {(item as any).audioUrl && (
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                        🔊 Ovozli tushuntirish:
                      </p>
                      <audio controls src={`/api/audio?url=${encodeURIComponent((item as any).audioUrl)}`} style={{ width: '100%', height: '36px' }}>
                        Brauzeringiz audioni qo&apos;llab-quvvatlamaydi.
                      </audio>
                    </div>
                  )}
                  <p style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>
                    ✅ {t("To'g'ri javob:", 'Правильный ответ:')} {tc(item.answers[item.correctAnswer]?.text ?? '')}
                  </p>
                  <p className={styles.explanationTitle}>📌 {t('Izoh:', 'Пояснение:')}</p>
                  <p style={{ whiteSpace: 'pre-line' }}>{tc(item.explanation ?? '')}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
