'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LogoIcon } from '@/components/ui/Logo';
import { QuestionWithAnswer } from '@/types/test';
import { getRandomQuestions } from '@/lib/db';
import styles from '../tickets/[id]/test.module.css';

export default function RandomTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    fetch('/api/random')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setQuestions(getRandomQuestions(20));
        }
      })
      .catch(() => {
        setQuestions(getRandomQuestions(20));
      });
  }, []);

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
    setShowResult(true);
  }, []);

  const correctCount = Object.entries(selectedAnswers).filter(
    ([idx, answer]) => answer === questions[Number(idx)]?.correctAnswer
  ).length;
  const wrongCount = answeredCount - correctCount;
  const passed = correctCount >= 18;

  if (questions.length === 0) {
    return (
      <div className={styles.testPage}>
        <p style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
          Random savollar yuklanmoqda...
        </p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultCard}>
          <div className={`${styles.resultIcon} ${passed ? styles.resultPassed : styles.resultFailed}`}>
            {passed ? '🎲🎉' : '🎲😔'}
          </div>
          <h1 className={styles.resultTitle}>
            {passed ? "Ajoyib natija!" : "Mashq qilishni davom eting!"}
          </h1>
          <p className={styles.resultSubtitle}>
            Random Test — {correctCount}/{questions.length} to&apos;g&apos;ri
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
          </div>

          <div className={styles.resultActions}>
            <Button variant="primary" onClick={() => router.push('/home')}>
              Bosh sahifa
            </Button>
            <Button variant="secondary" onClick={() => {
              setQuestions(getRandomQuestions(20));
              setShowResult(false);
              setCurrentIndex(0);
              setSelectedAnswers({});
              setTimeLeft(25 * 60);
            }}>
              Yangi Random Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.testPage}>
      <div className={styles.testHeader}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.testTitle}>🎲 Random Test (20 savol)</h1>
          <ProgressBar value={progress} showPercentage={false} size="sm" />
          <span className={styles.progressText}>{Math.round(progress)}% tugatildi ({answeredCount}/{questions.length})</span>
        </div>
        <div className={styles.timer}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

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

      <div className={styles.questionCard}>
        <div className={styles.cardHeaderRow}>
          <span className={styles.categoryBadge}>{currentQuestion.category}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Bilet #{currentQuestion.ticketNumber}
          </span>
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

        <h2 className={styles.questionText}>{currentQuestion.text}</h2>

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

        <button
          className={styles.explanationToggle}
          onClick={() => setShowExplanation(!showExplanation)}
        >
          💡 {showExplanation ? "Tushuntirishni yopish" : "Tushuntirishni ko'rish"}
        </button>

        {showExplanation && (
          <div className={styles.explanationBox}>
            <p className={styles.explanationTitle}>📌 Qoida tushuntirishi:</p>
            <p>{currentQuestion.explanation || "Izoh mavjud."}</p>
          </div>
        )}
      </div>

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
