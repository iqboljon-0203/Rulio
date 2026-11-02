'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LogoIcon } from '@/components/ui/Logo';
import { QuestionWithAnswer } from '@/types/test';
import { getQuestionsForTicket } from '@/lib/db';
import styles from './test.module.css';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const ticketNumber = parseInt((params?.id as string) || '1', 10);

  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [savedQuestions, setSavedQuestions] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  // Load questions
  useEffect(() => {
    // Attempt fetching from API or use local fallback
    fetch(`/api/tickets/${ticketNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setQuestions(getQuestionsForTicket(ticketNumber));
        }
      })
      .catch(() => {
        setQuestions(getQuestionsForTicket(ticketNumber));
      });
  }, [ticketNumber]);

  // Timer countdown
  useEffect(() => {
    if (showResult || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult, questions]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.values(selectedAnswers).filter((a) => a !== null).length;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = useCallback((answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: answerIndex }));
  }, [currentIndex]);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rulio_saved');
      if (stored) setSavedQuestions(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleBookmark = (questionId: string) => {
    setSavedQuestions((prev) => {
      const next = { ...prev, [questionId]: !prev[questionId] };
      try {
        localStorage.setItem('rulio_saved', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleNext = useCallback(() => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    setShowExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleFinish = useCallback(() => {
    // Calculate and persist results
    const correctCount = Object.entries(selectedAnswers).filter(
      ([idx, answer]) => answer === questions[Number(idx)]?.correctAnswer
    ).length;
    const isPassed = correctCount >= 18;

    // Save ticket status to localStorage
    try {
      const existingResults = JSON.parse(localStorage.getItem('rulio_ticket_results') || '{}');
      existingResults[ticketNumber] = {
        score: `${correctCount}/${questions.length}`,
        passed: isPassed,
        status: isPassed ? 'passed' : 'failed',
        timestamp: Date.now(),
      };
      localStorage.setItem('rulio_ticket_results', JSON.stringify(existingResults));

      // Save mistake questions
      const mistakeList = JSON.parse(localStorage.getItem('rulio_mistakes') || '[]');
      const newMistakes = questions.filter(
        (q, idx) => selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== q.correctAnswer
      );
      const combined = [...newMistakes, ...mistakeList.filter((m: any) => !newMistakes.some((nm) => nm.questionId === m.questionId))];
      localStorage.setItem('rulio_mistakes', JSON.stringify(combined.slice(0, 100)));
    } catch {}

    fetch('/api/test/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testType: 'ticket',
        ticketNumber,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        wrongAnswers: answeredCount - correctCount,
        timeSpent: 25 * 60 - timeLeft,
      }),
    }).catch(() => {});

    setShowResult(true);
  }, [selectedAnswers, questions, ticketNumber, answeredCount, timeLeft]);

  // Calculate results
  const correctCount = Object.entries(selectedAnswers).filter(
    ([idx, answer]) => answer === questions[Number(idx)]?.correctAnswer
  ).length;
  const wrongCount = answeredCount - correctCount;
  const passed = correctCount >= 18;

  if (questions.length === 0) {
    return (
      <div className={styles.testPage}>
        <p style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
          Savollar yuklanmoqda...
        </p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultCard}>
          <div className={`${styles.resultIcon} ${passed ? styles.resultPassed : styles.resultFailed}`}>
            {passed ? '🎉' : '😔'}
          </div>
          <h1 className={styles.resultTitle}>
            {passed ? "Tabriklaymiz! O'tdingiz!" : "Afsuski, yiqildingiz"}
          </h1>
          <p className={styles.resultSubtitle}>
            Bilet #{ticketNumber} — {correctCount}/{questions.length} to&apos;g&apos;ri
          </p>

          <div className={styles.resultStats}>
            <div className={styles.resultStat}>
              <span className={styles.resultStatValue} style={{ color: 'var(--success)' }}>{correctCount}</span>
              <span className={styles.resultStatLabel}>To&apos;g&apos;ri</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatValue} style={{ color: 'var(--error)' }}>{wrongCount}</span>
              <span className={styles.resultStatLabel}>Noto&apos;g&apos;ri</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatValue} style={{ color: 'var(--text-muted)' }}>{questions.length - answeredCount}</span>
              <span className={styles.resultStatLabel}>O&apos;tkazilgan</span>
            </div>
          </div>

          <div className={styles.resultActions}>
            <Button variant="primary" onClick={() => router.push('/tickets')}>
              Biletlarga qaytish
            </Button>
            <Button variant="secondary" onClick={() => {
              setShowResult(false);
              setCurrentIndex(0);
              setSelectedAnswers({});
              setTimeLeft(25 * 60);
              setShowExplanation(false);
            }}>
              Qayta boshlash
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.testPage}>
      {/* Header */}
      <div className={styles.testHeader}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.testTitle}>Bilet #{ticketNumber}</h1>
          <ProgressBar value={progress} showPercentage={false} size="sm" />
          <span className={styles.progressText}>{Math.round(progress)}% tugatildi ({answeredCount}/{questions.length})</span>
        </div>
        <div className={styles.timer}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Navigator Grid */}
      <div className={styles.navGrid}>
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== null;
          const isActive = idx === currentIndex;

          return (
            <button
              key={q.questionId}
              onClick={() => {
                setCurrentIndex(idx);
                setShowExplanation(false);
              }}
              className={`${styles.gridItem} ${isActive ? styles.gridItemActive : ''} ${isAnswered ? styles.gridItemAnswered : ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className={styles.questionCard}>
        {/* Card Header Row */}
        <div className={styles.cardHeaderRow}>
          <span className={styles.categoryBadge}>{currentQuestion.category}</span>
          <button
            className={`${styles.bookmarkBtn} ${savedQuestions[currentQuestion.questionId] ? styles.bookmarked : ''}`}
            onClick={() => toggleBookmark(currentQuestion.questionId)}
          >
            {savedQuestions[currentQuestion.questionId] ? '★ Saqlangan' : '☆ Saqlash'}
          </button>
        </div>

        {/* Question image or Sign badge */}
        {currentQuestion.imageUrl ? (
          <div className={styles.questionImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentQuestion.imageUrl} alt="Savol rasmi" />
            <div className={styles.brandWatermarkCover}>
              <LogoIcon size={18} />
              <span>Rulio</span>
            </div>
          </div>
        ) : (currentQuestion as any).signCode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🚸</span>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Yo&apos;l belgisi № {(currentQuestion as any).signCode}</span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>O&apos;zbekiston Respublikasi YHQ rasmiy belgisi</p>
            </div>
          </div>
        ) : null}

        {/* Question text */}
        <h2 className={styles.questionText}>{currentQuestion.text}</h2>

        {/* Answer options */}
        <div className={styles.answers}>
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswers[currentIndex] === answer.index;
            const letter = String.fromCharCode(65 + answer.index);

            return (
              <button
                key={answer.index}
                className={`${styles.answerOption} ${isSelected ? styles.answerSelected : ''}`}
                onClick={() => handleAnswer(answer.index)}
              >
                <span className={`${styles.answerLetter} ${isSelected ? styles.answerLetterSelected : ''}`}>
                  {letter}
                </span>
                <span className={styles.answerText}>{answer.text}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation Toggle */}
        <button
          className={styles.explanationToggle}
          onClick={() => setShowExplanation(!showExplanation)}
        >
          💡 {showExplanation ? "Tushuntirishni yopish" : "Tushuntirishni ko'rish"}
        </button>

        {showExplanation && (
          <div className={styles.explanationBox}>
            {(currentQuestion as any).audioUrl && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                  🔊 Ovozli tushuntirish:
                </p>
                <audio controls src={(currentQuestion as any).audioUrl} style={{ width: '100%', height: '36px' }}>
                  Brauzeringiz audioni qo&apos;llab-quvvatlamaydi.
                </audio>
              </div>
            )}
            <p className={styles.explanationTitle}>📌 Qoida tushuntirishi:</p>
            <p style={{ whiteSpace: 'pre-line' }}>{currentQuestion.explanation || "Ushbu savol bo'yicha qo'shimcha izoh mavjud emas."}</p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className={styles.testNav}>
        <button
          className={styles.navBtn}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← Oldingi
        </button>

        {currentIndex === questions.length - 1 ? (
          <Button variant="primary" onClick={handleFinish}>
            Tugatish
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext}>
            Keyingi →
          </Button>
        )}
      </div>
    </div>
  );
}
