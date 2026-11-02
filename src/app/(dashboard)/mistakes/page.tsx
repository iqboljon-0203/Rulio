'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LogoIcon } from '@/components/ui/Logo';
import { QuestionWithAnswer } from '@/types/test';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { fetchServerUserData, syncUserData } from '@/lib/sync';
import styles from '../tickets/[id]/test.module.css';

export default function MistakesPage() {
  const { t, tc } = useLocale();
  const [mistakes, setMistakes] = useState<QuestionWithAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [resolved, setResolved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rulio_mistakes');
      if (stored) {
        const list: QuestionWithAnswer[] = JSON.parse(stored);
        if (list.length > 0) {
          setMistakes(list);
          return;
        }
      }
    } catch {}

    fetchServerUserData()
      .then((data) => {
        if (data?.mistakes && data.mistakes.length > 0) {
          setMistakes(data.mistakes);
        } else {
          setMistakes([]);
        }
      })
      .catch(() => {
        setMistakes([]);
      });
  }, []);

  if (mistakes.length === 0) {
    return (
      <div className={styles.testPage}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '48px' }}>🎉</span>
          <h2 style={{ marginTop: '16px', color: 'var(--text-primary)' }}>{t("Sizda xatolar yo'q!", 'У вас нет ошибок!')}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{t("Barcha savollarga to'g'ri javob bergansiz.", 'Вы ответили правильно на все вопросы.')}</p>
          <Link href="/tickets">
            <Button variant="primary">{t('Biletlarni yechish', 'Решать билеты')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = mistakes[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const handleSelect = (idx: number) => {
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (idx === currentQuestion.correctAnswer) {
      setResolved((prev) => ({ ...prev, [currentQuestion.questionId]: true }));
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentIndex < mistakes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className={styles.testPage}>
      <div className={styles.testHeader}>
        <div>
          <h1 className={styles.testTitle}>❌ {t('Xatolar ustida ishlash', 'Работа над ошибками')}</h1>
          <p className={styles.progressText}>
            Jami {mistakes.length} ta xatoli savol ({currentIndex + 1}/{mistakes.length})
          </p>
        </div>
      </div>

      <div className={styles.navGrid}>
        {mistakes.map((q, idx) => (
          <button
            key={q.questionId}
            onClick={() => {
              setCurrentIndex(idx);
              setSelectedAnswer(null);
              setShowExplanation(false);
            }}
            className={`${styles.gridItem} ${idx === currentIndex ? styles.gridItemActive : ''} ${resolved[q.questionId] ? styles.gridItemAnswered : ''}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <div className={styles.questionCard}>
        <div className={styles.cardHeaderRow}>
          <span className={styles.categoryBadge}>{tc(currentQuestion.category)}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Bilet #{currentQuestion.ticketNumber}
          </span>
        </div>
        {/* Question image */}
        {currentQuestion.imageUrl && (
          <div className={styles.questionImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentQuestion.imageUrl} alt={t('Savol rasmi', 'Изображение к вопросу')} />
            <div className={styles.brandWatermarkCover}>
              <LogoIcon size={18} />
              <span>Rulio</span>
            </div>
          </div>
        )}

        <h2 className={styles.questionText}>{tc(currentQuestion.text)}</h2>

        <div className={styles.answers}>
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswer === answer.index;
            const letter = String.fromCharCode(65 + answer.index);
            const isRight = answer.index === currentQuestion.correctAnswer;

            let borderStyle = '';
            if (isAnswered) {
              if (isRight) borderStyle = '2px solid var(--success)';
              else if (isSelected) borderStyle = '2px solid var(--error)';
            }

            return (
              <button
                key={answer.index}
                className={`${styles.answerOption} ${isSelected ? styles.answerSelected : ''}`}
                style={{ border: borderStyle || undefined }}
                onClick={() => handleSelect(answer.index)}
              >
                <span className={`${styles.answerLetter} ${isSelected ? styles.answerLetterSelected : ''}`}>
                  {letter}
                </span>
                <span className={styles.answerText}>{tc(answer.text)}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div style={{ marginTop: '16px', fontWeight: 600, color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
            {isCorrect ? "✅ To'g'ri javob!" : "❌ Noto'g'ri! Qoidani qaytadan ko'rib chiqing."}
          </div>
        )}

        {(showExplanation || isAnswered) && (
          <div className={styles.explanationBox}>
            <p className={styles.explanationTitle}>📌 {t('Qoida tushuntirishi:', 'Пояснение:')}</p>
            <p>{tc(currentQuestion.explanation || "Tushuntirish mavjud emas.")}</p>
          </div>
        )}
      </div>

      <div className={styles.testNav}>
        <button className={styles.navBtn} onClick={handlePrev} disabled={currentIndex === 0}>
          ← Oldingi
        </button>

        <Button variant="primary" onClick={handleNext} disabled={currentIndex === mistakes.length - 1}>
          Keyingi →
        </Button>
      </div>
    </div>
  );
}
