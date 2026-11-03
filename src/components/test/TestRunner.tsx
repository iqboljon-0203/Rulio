'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LogoIcon } from '@/components/ui/Logo';
import { haptic } from '@/components/telegram/telegram';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { syncUserData, fetchServerUserData } from '@/lib/sync';
import type { QuestionWithAnswer } from '@/types/test';
import styles from './TestRunner.module.css';

const TIME_LIMIT = 25 * 60; // seconds, same as the YHXBB exam
const PASS_MIN = 18; // 18 of 20 correct = at most 2 mistakes

export interface TestRunnerProps {
  mode: 'ticket' | 'random';
  ticketNumber?: number;
  loadQuestions: () => Promise<QuestionWithAnswer[]>;
  /** Optional starting state (used for previews/tests). */
  initialState?: { questions: QuestionWithAnswer[]; answers?: Record<number, number>; index?: number; finished?: boolean };
}

type Answers = Record<number, number>; // question index -> chosen answer index

// Explanations in the bank use light markdown: **bold** and [text](/signs/x.y) links.
function richText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\([^)]+\)$/);
    if (link) return <strong key={i}>{link[1]}</strong>;
    return part;
  });
}

const fmt = (sec: number) =>
  `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;

export function TestRunner({ mode, ticketNumber, loadQuestions, initialState }: TestRunnerProps) {
  const router = useRouter();
  const [rawQuestions, setQuestions] = useState<QuestionWithAnswer[]>(initialState?.questions ?? []);
  const { t, tc, locale } = useLocale();
  // Question bank exists in Uzbek Latin only; Cyrillic is transliterated.
  const questions = useMemo(
    () => {
      if (locale === 'ru') {
        return rawQuestions.map((q) => ({
          ...q,
          text: q.textRu || q.text,
          explanation: q.explanationRu || q.explanation,
          answers: q.answers.map((a) => ({ ...a, text: a.textRu || a.text })),
        }));
      }
      if (locale === 'uz-cyr') {
        return rawQuestions.map((q) => ({
          ...q,
          text: tc(q.text),
          explanation: q.explanation ? tc(q.explanation) : q.explanation,
          answers: q.answers.map((a) => ({ ...a, text: tc(a.text) })),
        }));
      }
      return rawQuestions;
    },
    [rawQuestions, locale, tc],
  );
  const [index, setIndex] = useState(initialState?.index ?? 0);
  const [answers, setAnswers] = useState<Answers>(initialState?.answers ?? {});
  const [explainOpen, setExplainOpen] = useState(() => {
    const i = initialState?.index ?? 0;
    const a = initialState?.answers?.[i];
    return a !== undefined && a !== initialState?.questions[i]?.correctAnswer;
  });
  const [finished, setFinished] = useState(initialState?.finished ?? false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);

  const title = mode === 'ticket' ? `${t('Bilet', 'Билет')} ${ticketNumber}` : t('Random test', 'Случайный тест');

  // Load questions (re-run on restart for random mode so the set changes)
  useEffect(() => {
    if (attempt === 0 && initialState?.questions.length) return;
    let alive = true;
    loadQuestions().then((qs) => alive && setQuestions(qs));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem('rulio_saved') || '{}'));
    } catch {}
  }, []);

  // Timer
  useEffect(() => {
    if (finished || questions.length === 0) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [finished, questions.length]);

  const q = questions[index];
  const chosen = answers[index];
  const isAnswered = chosen !== undefined;

  const stats = useMemo(() => {
    let right = 0;
    let wrong = 0;
    for (const [i, a] of Object.entries(answers)) {
      if (questions[Number(i)]?.correctAnswer === a) right++;
      else wrong++;
    }
    return { right, wrong, answered: right + wrong };
  }, [answers, questions]);

  const choose = useCallback(
    (answerIndex: number) => {
      if (!q || answers[index] !== undefined || finished) return;
      setAnswers((prev) => ({ ...prev, [index]: answerIndex }));
      haptic(answerIndex === q.correctAnswer ? 'success' : 'error');
      // Wrong answer: open the explanation right away
      setExplainOpen(answerIndex !== q.correctAnswer);
    },
    [q, answers, index, finished]
  );

  const go = useCallback(
    (to: number) => {
      if (to < 0 || to >= questions.length) return;
      setIndex(to);
      setExplainOpen(false);
    },
    [questions.length]
  );

  const nextUnanswered = useCallback(() => {
    for (let k = 1; k <= questions.length; k++) {
      const i = (index + k) % questions.length;
      if (answers[i] === undefined) return i;
    }
    return -1;
  }, [answers, index, questions.length]);

  const finish = useCallback(() => {
    setFinished(true);
    const right = stats.right;
    try {
      let currentResults: Record<string, any> = {};
      if (mode === 'ticket' && ticketNumber) {
        currentResults = JSON.parse(localStorage.getItem('rulio_ticket_results') || '{}');
        const passed = right >= PASS_MIN;
        currentResults[ticketNumber] = {
          score: `${right}/${questions.length}`,
          passed,
          status: passed ? 'passed' : 'failed',
          timestamp: Date.now(),
        };
        localStorage.setItem('rulio_ticket_results', JSON.stringify(currentResults));
      }
      const mistakes: QuestionWithAnswer[] = JSON.parse(localStorage.getItem('rulio_mistakes') || '[]');
      const fresh = rawQuestions.filter((qq, i) => answers[i] !== undefined && answers[i] !== qq.correctAnswer);
      const merged = [...fresh, ...mistakes.filter((m) => !fresh.some((f) => f.questionId === m.questionId))].slice(0, 100);
      localStorage.setItem('rulio_mistakes', JSON.stringify(merged));
      syncUserData({ ticketResults: currentResults, mistakes: merged }).catch(() => {});
    } catch {}

  }, [answers, mode, questions, stats, ticketNumber, timeLeft]);

  // Keyboard: 1-4 / A-D answer, ← → navigate, Enter = next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || !q) return;
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      const k = e.key.toLowerCase();
      const byNum = ['1', '2', '3', '4', '5'].indexOf(k);
      const byLetter = ['a', 'b', 'c', 'd', 'e'].indexOf(k);
      const pick = byNum >= 0 ? byNum : byLetter;
      if (pick >= 0 && pick < q.answers.length) {
        choose(q.answers[pick].index);
      } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && isAnswered)) {
        go(index + 1);
      } else if (e.key === 'ArrowLeft') {
        go(index - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose, finished, go, index, isAnswered, q]);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('rulio_saved', JSON.stringify(next));
        syncUserData({ saved: next }).catch(() => {});
      } catch {}
      return next;
    });
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setTimeLeft(TIME_LIMIT);
    setExplainOpen(false);
    setFinished(false);
    if (mode === 'random') {
      setQuestions([]);
      setAttempt((a) => a + 1);
    }
  };

  // ---------------------------------------------------------------- loading
  if (questions.length === 0) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingLane} />
        <p>{t('Savollar yuklanmoqda…', 'Загрузка вопросов…')}</p>
      </div>
    );
  }

  // ---------------------------------------------------------------- result
  if (finished) {
    const passed = stats.right >= PASS_MIN;
    const skipped = questions.length - stats.answered;
    const wrongList = questions
      .map((qq, i) => ({ qq, i, a: answers[i] }))
      .filter(({ qq, a }) => a !== undefined && a !== qq.correctAnswer);

    return (
      <div className={styles.result}>
        <section className={`${styles.resultHero} ${passed ? styles.resultPass : styles.resultFail}`}>
          <p className={styles.resultKicker}>{title}</p>
          <div className={styles.stamp}>{passed ? t("O'tdingiz", 'Сдали') : t('Yiqildingiz', 'Не сдали')}</div>
          <p className={styles.resultScore}>
            <b>{stats.right}</b>
            <span>/ {questions.length}</span>
          </p>
          <p className={styles.resultNote}>
            {passed
              ? t("Imtihonda ham shunday bo'lsa, guvohnoma sizniki.", 'Если на экзамене будет так же, права ваши.')
              : t(`O'tish uchun kamida ${PASS_MIN} ta to'g'ri javob kerak (2 tagacha xato).`, `Для сдачи нужно минимум ${PASS_MIN} правильных ответов (до 2 ошибок).`)}
          </p>
          <dl className={styles.resultStats}>
            <div><dt>{t("To'g'ri", 'Верно')}</dt><dd className={styles.tRight}>{stats.right}</dd></div>
            <div><dt>{t('Xato', 'Ошибки')}</dt><dd className={styles.tWrong}>{stats.wrong}</dd></div>
            <div><dt>{t('Javobsiz', 'Без ответа')}</dt><dd>{skipped}</dd></div>
            <div><dt>{t('Vaqt', 'Время')}</dt><dd>{fmt(TIME_LIMIT - timeLeft)}</dd></div>
          </dl>
          <div className={styles.resultActions}>
            {mode === 'ticket' && ticketNumber && ticketNumber < 63 && passed && (
              <Button variant="accent" size="lg" onClick={() => router.push(`/tickets/${ticketNumber + 1}`)}>
                {t('Keyingi bilet', 'Следующий билет')} →
              </Button>
            )}
            <Button
              variant={passed ? 'secondary' : 'accent'}
              size="lg"
              className={passed ? styles.onDark : undefined}
              onClick={restart}
            >
              {t('Qayta yechish', 'Решить заново')}
            </Button>
            <Link href={mode === 'ticket' ? '/tickets' : '/home'} className={styles.resultLink}>
              {mode === 'ticket' ? t('Biletlarga qaytish', 'К билетам') : t('Bosh sahifa', 'Главная')}
            </Link>
          </div>
        </section>

        {wrongList.length > 0 && (
          <section className={styles.review}>
            <h2 className={styles.reviewTitle}>{t('Xatolar ustida ishlash', 'Работа над ошибками')}</h2>
            <ol className={styles.reviewList}>
              {wrongList.map(({ qq, i, a }) => (
                <li key={qq.questionId} className={styles.reviewItem}>
                  <p className={styles.reviewQ}>
                    <span>{i + 1}</span>
                    {qq.text}
                  </p>
                  <p className={styles.reviewYours}>
                    <b>✕</b> {qq.answers.find((x) => x.index === a)?.text}
                  </p>
                  <p className={styles.reviewRight}>
                    <b>✓</b> {qq.answers.find((x) => x.index === qq.correctAnswer)?.text}
                  </p>
                  {qq.explanation && <p className={styles.reviewWhy}>{richText(qq.explanation)}</p>}
                </li>
              ))}
            </ol>
            <Link href="/mistakes" className={styles.resultLink}>{t('Barcha xatolarim', 'Все мои ошибки')} →</Link>
          </section>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------- test
  const lowTime = timeLeft <= 5 * 60;
  const overLimit = stats.wrong > questions.length - PASS_MIN;
  const isLast = index === questions.length - 1;
  const pending = nextUnanswered();

  return (
    <div className={styles.runner}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <Link href={mode === 'ticket' ? '/tickets' : '/home'} className={styles.back} aria-label={t('Orqaga', 'Назад')}>
          ←
        </Link>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.counter}>
            {t('Savol', 'Вопрос')} {index + 1} / {questions.length}
          </span>
        </div>
        <div className={`${styles.timer} ${lowTime ? styles.timerLow : ''}`} role="timer" aria-label={t('Qolgan vaqt', 'Оставшееся время')}>
          {fmt(timeLeft)}
        </div>
      </header>

      <div className={styles.layout}>
        {/* Question */}
        <article className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.category}>{tc(q.category)}</span>
            <button
              type="button"
              className={`${styles.saveBtn} ${saved[q.questionId] ? styles.saveBtnOn : ''}`}
              onClick={() => toggleSave(q.questionId)}
              aria-pressed={!!saved[q.questionId]}
            >
              {saved[q.questionId] ? `★ ${t('Saqlangan', 'Сохранено')}` : `☆ ${t('Saqlash', 'Сохранить')}`}
            </button>
          </div>

          {q.imageUrl && (
            <figure className={styles.image}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={q.imageUrl} alt={t('Savol rasmi', 'Изображение к вопросу')} />
              <figcaption className={styles.watermark}>
                <LogoIcon size={16} />
                Rulio
              </figcaption>
            </figure>
          )}

          <h2 className={styles.question}>{q.text}</h2>
          {locale === 'ru' && !q.textRu && index === 0 && (
            <p className={styles.langNote}>Вопросы экзамена пока доступны на узбекском (латиница и кириллица). Русская версия базы готовится.</p>
          )}

          <div className={styles.answers} role="radiogroup" aria-label="Javob variantlari">
            {q.answers.map((ans, i) => {
              const letter = String.fromCharCode(65 + i);
              const isChosen = chosen === ans.index;
              const isRight = ans.index === q.correctAnswer;
              let state = '';
              if (isAnswered) {
                if (isRight) state = styles.ansRight;
                else if (isChosen) state = styles.ansWrong;
                else state = styles.ansMuted;
              }
              return (
                <button
                  key={ans.index}
                  type="button"
                  role="radio"
                  aria-checked={isChosen}
                  disabled={isAnswered}
                  className={`${styles.answer} ${state}`}
                  onClick={() => choose(ans.index)}
                >
                  <span className={styles.key}>{isAnswered && isRight ? '✓' : isAnswered && isChosen ? '✕' : letter}</span>
                  <span className={styles.ansText}>{ans.text}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className={`${styles.feedback} ${chosen === q.correctAnswer ? styles.fbRight : styles.fbWrong}`}>
              <div className={styles.fbHead}>
                <b>{chosen === q.correctAnswer ? t("To'g'ri!", 'Верно!') : t("Noto'g'ri", 'Неверно')}</b>
                {q.explanation && (
                  <button type="button" className={styles.fbToggle} onClick={() => setExplainOpen((v) => !v)}>
                    {explainOpen ? t('Izohni yopish', 'Скрыть пояснение') : t('Nega?', 'Почему?')}
                  </button>
                )}
              </div>
              {explainOpen && q.explanation && <p className={styles.fbText}>{richText(q.explanation)}</p>}
            </div>
          )}

          <div className={styles.cardNav}>
            <button type="button" className={styles.prev} onClick={() => go(index - 1)} disabled={index === 0}>
              ← {t('Oldingi', 'Назад')}
            </button>
            {isLast || pending === -1 ? (
              <Button variant="accent" onClick={finish}>
                {t("Natijani ko'rish", 'Результат')}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => go(index + 1)}>
                {t('Keyingi', 'Далее')} →
              </Button>
            )}
          </div>
          <p className={styles.kbdHint}>
            {t('Klaviatura', 'Клавиатура')}: <kbd>1</kbd>–<kbd>4</kbd> {t('javob', 'ответ')}, <kbd>←</kbd> <kbd>→</kbd> {t('savollar', 'вопросы')}
          </p>
        </article>

        {/* Side panel */}
        <aside className={styles.side}>
          <div className={styles.scoreRow}>
            <div className={styles.scoreRight}>
              <b>{stats.right}</b>
              <span>{t("to'g'ri", 'верно')}</span>
            </div>
            <div className={`${styles.scoreWrong} ${overLimit ? styles.scoreWrongOver : ''}`}>
              <b>
                {stats.wrong}
                <small>/2</small>
              </b>
              <span>{t('xato', 'ошибки')}</span>
            </div>
          </div>
          {overLimit && <p className={styles.overNote}>{t("2 tadan ko'p xato — imtihonda bu yiqilish. Davom eting, mashq qiling!", 'Больше 2 ошибок — на экзамене это провал. Продолжайте тренироваться!')}</p>}

          <nav className={styles.grid} aria-label="Savollar">
            {questions.map((qq, i) => {
              const a = answers[i];
              const st =
                a === undefined ? '' : a === qq.correctAnswer ? styles.cellRight : styles.cellWrong;
              return (
                <button
                  key={qq.questionId}
                  type="button"
                  className={`${styles.cell} ${st} ${i === index ? styles.cellNow : ''}`}
                  onClick={() => go(i)}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`Savol ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </nav>

          <Button variant="secondary" fullWidth onClick={finish}>
            {t('Testni yakunlash', 'Завершить тест')}
          </Button>
        </aside>
      </div>
    </div>
  );
}
