'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { QuestionWithAnswer } from '@/types/test';
import styles from './octagon.module.css';

interface Opponent {
  name: string;
  avatar: string;
  rating: number;
  city: string;
}

const OPPONENT_POOL: Opponent[] = [
  { name: 'Rulio AI (Yangi haydovchi)', avatar: '🤖', rating: 1150, city: 'AI Bot' },
  { name: 'Rulio AI (O\'rta daraja)', avatar: '⚡', rating: 1250, city: 'AI Bot' },
  { name: 'Rulio AI (Instruktor)', avatar: '🎯', rating: 1340, city: 'AI Bot' },
  { name: 'Rulio AI (Ekspert)', avatar: '🏆', rating: 1420, city: 'AI Bot' },
];

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Temur_Pro', points: '1,840', winrate: '88%', avatar: 'T' },
  { rank: 2, name: 'Anvar_GAI', points: '1,720', winrate: '82%', avatar: 'A' },
  { rank: 3, name: 'Zilola_01', points: '1,650', winrate: '79%', avatar: 'Z' },
  { rank: 4, name: 'Bobur_BMW', points: '1,590', winrate: '74%', avatar: 'B' },
  { rank: 5, name: 'Sardor_Avto', points: '1,240', winrate: '68%', avatar: 'S' },
];

export default function OctagonPage() {
  const [gameState, setGameState] = useState<'lobby' | 'matchmaking' | 'battle' | 'result'>('lobby');
  const [selectedMode, setSelectedMode] = useState<'1v1' | 'tournament' | 'custom'>('1v1');
  const [myRating, setMyRating] = useState(1240);
  const [opponent, setOpponent] = useState<Opponent>(OPPONENT_POOL[0]);

  // Battle State
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [octagonPool, setOctagonPool] = useState<QuestionWithAnswer[]>([]);

  // Questions come from the API so the full bank is not shipped to the browser
  useEffect(() => {
    fetch('/api/octagon/questions')
      .then((r) => r.json())
      .then((d) => setOctagonPool(d.questions ?? []))
      .catch(() => {});
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [mySelectedAnswer, setMySelectedAnswer] = useState<number | null>(null);
  const [oppAnswered, setOppAnswered] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [matchmakingTime, setMatchmakingTime] = useState(3);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const oppTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Matchmaking effect
  useEffect(() => {
    if (gameState === 'matchmaking') {
      const randomOpp = OPPONENT_POOL[Math.floor(Math.random() * OPPONENT_POOL.length)];
      setOpponent(randomOpp);
      setMatchmakingTime(3);

      const countdown = setInterval(() => {
        setMatchmakingTime((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            startBattle();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [gameState]);

  // Start Battle
  const startBattle = () => {
    // Pick 5 random questions
    const shuffled = [...octagonPool].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setMyScore(0);
    setOppScore(0);
    setMySelectedAnswer(null);
    setOppAnswered(false);
    setRoundWinner(null);
    setTimeLeft(12);
    setGameState('battle');
  };

  // Battle Question Countdown & Opponent AI Simulator
  useEffect(() => {
    if (gameState !== 'battle' || questions.length === 0) return;

    setTimeLeft(12);
    setMySelectedAnswer(null);
    setOppAnswered(false);
    setRoundWinner(null);

    // Opponent answers randomly between 3 to 7 seconds
    const oppReactionTime = Math.floor(Math.random() * 4000) + 3000;
    oppTimerRef.current = setTimeout(() => {
      setOppAnswered(true);
      // 80% accuracy for opponent
      const isOppCorrect = Math.random() < 0.8;
      if (isOppCorrect) {
        const points = 100 + Math.floor((12 - oppReactionTime / 1000) * 10);
        setOppScore((prev) => prev + Math.max(80, points));
      }
    }, oppReactionTime);

    // Question Timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (oppTimerRef.current) clearTimeout(oppTimerRef.current);
    };
  }, [gameState, currentIndex, questions]);

  const handleSelectAnswer = (idx: number) => {
    if (mySelectedAnswer !== null) return;
    setMySelectedAnswer(idx);

    const currentQ = questions[currentIndex];
    const isCorrect = idx === currentQ.correctAnswer;

    if (isCorrect) {
      const earned = 100 + timeLeft * 10;
      setMyScore((prev) => prev + earned);
    }

    // Move to next question after 1.5 seconds delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        finishBattle();
      }
    }, 1600);
  };

  const handleTimeOut = () => {
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        finishBattle();
      }
    }, 1200);
  };

  const finishBattle = () => {
    setGameState('result');
    if (myScore > oppScore) {
      setMyRating((prev) => prev + 25);
    } else if (myScore < oppScore) {
      setMyRating((prev) => Math.max(1000, prev - 15));
    }
  };

  return (
    <div className={styles.octagonPage}>
      {/* 1. LOBBY VIEW */}
      {gameState === 'lobby' && (
        <>
          <div className={styles.heroArena}>
            <div className={styles.heroTop}>
              <div>
                <div className={styles.badgeRow}>
                  <span className={styles.liveBadge}>
                    <span className={styles.liveDot} />
                    OCTAGON ARENA
                  </span>
                  <span className={styles.onlineCounter}>🤖 AI Simulyator (BETA)</span>
                </div>
                <h1 className={styles.heroTitle}>AI Trenajyor &amp; Jonli Bellashuv</h1>
                <p className={styles.heroSub}>
                  Tezlik va reaksiya mashg&apos;uloti: Rulio AI bot raqibi bilan 5 ta savolda kuch sinashing va tayyorgarligingizni tekshiring. Jonli multiplayer esa tez kunda taqdim etiladi!
                </p>
              </div>

              <div className={styles.userRankCard}>
                <span className={styles.rankIcon}>🏆</span>
                <div className={styles.rankMeta}>
                  <span className={styles.rankLabel}>Sizning Reytingingiz</span>
                  <span className={styles.rankScore}>{myRating} ELO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div className={styles.modesGrid}>
            {/* Mode 1: 1v1 AI Sparring */}
            <div className={`${styles.modeCard} ${selectedMode === '1v1' ? styles.modeCardActive : ''}`}>
              <div className={styles.modeTop}>
                <div className={`${styles.modeIconWrap} ${styles.iconPurple}`}>⚔️</div>
                <h3 className={styles.modeTitle}>1 vs 1 AI Sparring</h3>
                <p className={styles.modeDesc}>
                  Rulio AI boti bilan 5 ta tezkor savolda reaksiya va bilimingizni sinang.
                </p>
                <div className={styles.modeMetaList}>
                  <div className={styles.modeMetaItem}>
                    <span>⏱️ Har bir savolga 12 soniya</span>
                  </div>
                  <div className={styles.modeMetaItem}>
                    <span>⚡ Tezlik va aniqlik uchun ball</span>
                  </div>
                </div>
              </div>
              <button className={styles.startBtn} onClick={() => setGameState('matchmaking')}>
                <span>Jangni Boshlash</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* Mode 2: Tournament (Coming Soon) */}
            <div className={styles.modeCard} style={{ opacity: 0.85 }}>
              <div className={styles.modeTop}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className={`${styles.modeIconWrap} ${styles.iconOrange}`}>👑</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, background: 'rgba(255, 179, 0, 0.15)', color: '#B45309' }}>Tez kunda</span>
                </div>
                <h3 className={styles.modeTitle}>Turnir (4 Haydovchi)</h3>
                <p className={styles.modeDesc}>
                  4 ta o&apos;quvchi bir vaqtda start oladi. Eng kam ball olganlar bosqichma-bosqich chiqib ketadi.
                </p>
                <div className={styles.modeMetaList}>
                  <div className={styles.modeMetaItem}>
                    <span>🔥 Yarim final va Final</span>
                  </div>
                  <div className={styles.modeMetaItem}>
                    <span>🎁 2x Reyting va mukofotlar</span>
                  </div>
                </div>
              </div>
              <button className={styles.startBtn} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <span>Tez kunda</span>
              </button>
            </div>

            {/* Mode 3: Custom Room (Coming Soon) */}
            <div className={styles.modeCard} style={{ opacity: 0.85 }}>
              <div className={styles.modeTop}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className={`${styles.modeIconWrap} ${styles.iconCyan}`}>👥</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, background: 'rgba(6, 214, 160, 0.15)', color: '#04694F' }}>Tez kunda</span>
                </div>
                <h3 className={styles.modeTitle}>Do&apos;st bilan bellashuv</h3>
                <p className={styles.modeDesc}>
                  Maxsus xona oching va PIN kod orqali do&apos;stingizni chaqirib bellashing.
                </p>
                <div className={styles.modeMetaList}>
                  <div className={styles.modeMetaItem}>
                    <span>🔑 Maxsus xona kodi bilan</span>
                  </div>
                  <div className={styles.modeMetaItem}>
                    <span>🤝 Do&apos;stlar o&apos;rtasida bahs</span>
                  </div>
                </div>
              </div>
              <button className={styles.startBtn} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <span>Tez kunda</span>
              </button>
            </div>
          </div>

          {/* Leaderboard & Rules */}
          <div className={styles.bottomSectionGrid}>
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>🏆 Octagon Yetakchilar Jadvali</h2>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED' }}>Haftalik Liga</span>
              </div>
              <div className={styles.leaderList}>
                {LEADERBOARD_DATA.map((item) => (
                  <div key={item.rank} className={styles.leaderItem}>
                    <div className={styles.leaderLeft}>
                      <span className={`${styles.leaderRank} ${item.rank === 1 ? styles.rankTop1 : item.rank === 2 ? styles.rankTop2 : item.rank === 3 ? styles.rankTop3 : ''}`}>
                        #{item.rank}
                      </span>
                      <div className={styles.leaderAvatar}>{item.avatar}</div>
                      <div>
                        <p className={styles.leaderName}>{item.name}</p>
                        <p className={styles.leaderWinrate}>G&apos;alaba: {item.winrate}</p>
                      </div>
                    </div>
                    <span className={styles.leaderPoints}>{item.points} ball</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panelCard}>
              <h2 className={styles.panelTitle} style={{ marginBottom: '14px' }}>📜 Octagon Qoidalari</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <li>⚡ <strong>Tezlik ahamiyatli:</strong> To&apos;g&apos;ri javob berish bilan birga, qancha tez bosganingizga qarab bonus ballar beriladi.</li>
                <li>🎯 <strong>Aniqlik:</strong> Noto&apos;g&apos;ri javob bergan taqdirda ushbu savoldan 0 ball olasiz.</li>
                <li>📈 <strong>Reyting (ELO):</strong> G&apos;alaba qozonsangiz +25 reyting ball olasiz, mag&apos;lub bo&apos;lsangiz reytingingiz kamayadi.</li>
                <li>🥇 <strong>Haftalik Mukofot:</strong> Top 3 talikka kirgan haydovchilarga Rulio PRO obunasi sovg&apos;a qilinadi.</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* 2. MATCHMAKING SCREEN */}
      {gameState === 'matchmaking' && (
        <div className={styles.matchmakingScreen}>
          <div className={styles.radarRing}>
            <div className={styles.radarCenter}>⚔️</div>
          </div>
          <div>
            <h2 className={styles.matchmakingTitle}>Raqib qidirilmoqda...</h2>
            <p className={styles.matchmakingSub}>Onlayn haydovchilar orasidan reytingingizga mos raqib tanlanmoqda</p>
          </div>

          <div className={styles.vsContainer}>
            <div className={styles.playerCard}>
              <div className={styles.leaderAvatar} style={{ width: 50, height: 50, fontSize: 20 }}>H</div>
              <p style={{ fontWeight: 800 }}>Siz (Haydovchi)</p>
              <span style={{ fontSize: 12, color: '#A78BFA' }}>{myRating} ELO</span>
            </div>

            <span className={styles.vsBadge}>VS</span>

            <div className={styles.playerCard}>
              <div className={styles.leaderAvatar} style={{ width: 50, height: 50, fontSize: 20, background: 'linear-gradient(135deg, #EF4444, #F59E0B)' }}>
                {opponent.avatar}
              </div>
              <p style={{ fontWeight: 800 }}>{opponent.name}</p>
              <span style={{ fontSize: 12, color: '#F87171' }}>{opponent.rating} ELO • {opponent.city}</span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#94A3B8' }}>Jang boshlanishiga: {matchmakingTime} soniya</p>

          <button className={styles.cancelBtn} onClick={() => setGameState('lobby')}>
            Bekor qilish
          </button>
        </div>
      )}

      {/* 3. LIVE BATTLE ARENA */}
      {gameState === 'battle' && questions.length > 0 && (
        <div className={styles.arenaContainer}>
          {/* Top Live HUD */}
          <div className={styles.battleHud}>
            {/* Player 1 (Me) */}
            <div className={styles.hudPlayer}>
              <div className={`${styles.hudAvatar} ${styles.hudAvatarMe}`}>H</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700 }}>Siz</p>
                <p className={styles.hudScore}>{myScore} ball</p>
              </div>
            </div>

            {/* Center Timer & Round */}
            <div className={styles.hudCenter}>
              <div className={`${styles.timerCircle} ${timeLeft <= 4 ? styles.timerWarning : ''}`}>
                {timeLeft}
              </div>
              <span className={styles.roundPill}>Savol {currentIndex + 1} / {questions.length}</span>
            </div>

            {/* Player 2 (Opponent) */}
            <div className={styles.hudPlayer} style={{ flexDirection: 'row-reverse', textAlign: 'right' }}>
              <div className={`${styles.hudAvatar} ${styles.hudAvatarOpp}`}>{opponent.avatar}</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700 }}>{opponent.name}</p>
                <p className={styles.hudScore}>{oppScore} ball</p>
                <span className={`${styles.oppReaction} ${oppAnswered ? styles.reactionDone : styles.reactionThinking}`}>
                  {oppAnswered ? "Javob berdi ⚡" : "O'ylamoqda..."}
                </span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className={styles.battleCard}>
            <div className={styles.questionBadgeRow}>
              <span className={styles.categoryTag}>
                Mavzu: {questions[currentIndex].category || "Yo'l qoidalari"}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Bilet #{questions[currentIndex].ticketNumber}
              </span>
            </div>

            <h2 className={styles.questionText}>
              {questions[currentIndex].text}
            </h2>

            {/* Answer Options */}
            <div className={styles.battleAnswers}>
              {questions[currentIndex].answers.map((ans) => {
                const isSelected = mySelectedAnswer === ans.index;
                const isCorrect = ans.index === questions[currentIndex].correctAnswer;
                const letter = String.fromCharCode(65 + ans.index);

                let optionClass = styles.battleOption;
                if (mySelectedAnswer !== null) {
                  if (isCorrect) optionClass += ` ${styles.battleOptionCorrect}`;
                  else if (isSelected) optionClass += ` ${styles.battleOptionWrong}`;
                }

                return (
                  <button
                    key={ans.index}
                    className={optionClass}
                    onClick={() => handleSelectAnswer(ans.index)}
                    disabled={mySelectedAnswer !== null}
                  >
                    <span className={styles.optionLetter}>{letter}</span>
                    <span className={styles.optionText}>{ans.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. RESULT SCREEN */}
      {gameState === 'result' && (
        <div className={styles.resultCard}>
          <div className={styles.trophyWrap}>
            {myScore > oppScore ? '🏆' : myScore < oppScore ? '💔' : '🤝'}
          </div>

          <div>
            <h2 className={`${styles.resultTitle} ${myScore > oppScore ? styles.winText : myScore < oppScore ? styles.loseText : styles.drawText}`}>
              {myScore > oppScore ? "G'ALABA QOZONDINGIZ!" : myScore < oppScore ? "MAG'LUBIYAT!" : "DURANG NATIJA!"}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              {myScore > oppScore
                ? "Ajoyib natija! Siz raqibingizdan tezroq va aniqroq javob berdingiz."
                : "Raqibingiz bu safar tezroq ishladi. Xatolar ustida ishlab yana urinib ko'ring."}
            </p>
          </div>

          <div className={styles.resultScoresGrid}>
            <div className={`${styles.scoreBox} ${styles.scoreBoxMe}`}>
              <span className={styles.scoreBoxName}>Sizning Balingiz</span>
              <span className={styles.scoreBoxVal}>{myScore}</span>
            </div>
            <div className={`${styles.scoreBox} ${styles.scoreBoxOpp}`}>
              <span className={styles.scoreBoxName}>{opponent.name}</span>
              <span className={styles.scoreBoxVal}>{oppScore}</span>
            </div>
          </div>

          <div className={`${styles.eloChangeBadge} ${myScore > oppScore ? styles.eloPlus : styles.eloMinus}`}>
            <span>{myScore > oppScore ? '+25 Reyting ELO' : '-15 Reyting ELO'}</span>
            <span>(Jami: {myRating})</span>
          </div>

          <div className={styles.resultActions}>
            <Button variant="secondary" fullWidth onClick={() => setGameState('lobby')}>
              Lobbiyga Qaytish
            </Button>
            <Button variant="primary" fullWidth onClick={() => setGameState('matchmaking')}>
              Qayta O&apos;ynash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
