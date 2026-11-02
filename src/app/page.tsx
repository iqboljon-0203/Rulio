'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Logo } from '@/components/ui/Logo';
import { SITE_URL } from '@/lib/seo';
import { useLocale } from '@/components/i18n/LocaleProvider';

const faqData = [
  {
    q: "Rulio qanday ishlaydi?",
    a: "Rulio haydovchilik guvohnomasi imtihoniga tayyorgarlik platformasi. Biletlar bo'yicha yoki random formatda test yechasiz. Xato qilgan savollaringiz alohida saqlanadi va ularni qayta takrorlay olasiz.",
    qRu: "Как работает Rulio?",
    aRu: "Rulio — платформа подготовки к экзамену на водительские права. Решаете тесты по билетам или в случайном порядке. Вопросы с ошибками сохраняются отдельно, их можно повторять.",
  },
  {
    q: "Savollar haqiqiy imtihon savollarimi?",
    a: "Ha, savollar YHXBB (Yo'l harakati xavfsizligi bosh boshqarmasi) ning rasmiy savollar bazasiga asoslangan va yangi qoidalar chiqqanda yangilanadi.",
    qRu: "Это настоящие экзаменационные вопросы?",
    aRu: "Да, вопросы основаны на официальной базе ГУБДД (YHXBB) и обновляются при выходе новых правил.",
  },
  {
    q: "Bepul foydalanish mumkinmi?",
    a: "Ha. Bepul rejada 5 ta biletni yechishingiz mumkin. To'liq bazaga kirish uchun Premium tariflardan birini tanlang.",
    qRu: "Можно пользоваться бесплатно?",
    aRu: "Да. В бесплатном тарифе доступны 5 билетов. Для полной базы выберите один из Premium тарифов.",
  },
  {
    q: "Telefondan foydalanish qulaymi?",
    a: "Rulio avvalo telefon uchun yaratilgan. Brauzerda yoki Telegram ichida ochiladi, hech qanday ilova o'rnatish shart emas.",
    qRu: "Удобно ли с телефона?",
    aRu: "Rulio создан прежде всего для телефона. Открывается в браузере или в Telegram, ничего устанавливать не нужно.",
  },
  {
    q: "To'lov qanday amalga oshiriladi?",
    a: "Payme yoki Click orqali to'laysiz. To'lov o'tgach, Premium tarif avtomatik faollashadi.",
    qRu: "Как происходит оплата?",
    aRu: "Оплата через Payme или Click. После оплаты Premium включается автоматически.",
  },
];

type Pair = [string, string]; // [uz-latin, russian]
const F = {
  five: ['5 ta bilet', '5 билетов'] as Pair,
  stats: ['Asosiy statistika', 'Базовая статистика'] as Pair,
  all: ['Barcha 63 bilet', 'Все 63 билета'] as Pair,
  mist: ['Xatolar tahlili', 'Разбор ошибок'] as Pair,
  full: ['Batafsil statistika', 'Подробная статистика'] as Pair,
  noads: ['Reklamasiz', 'Без рекламы'] as Pair,
  rand: ['Random test butun bazadan', 'Случайный тест по всей базе'] as Pair,
};
const plans: { name: Pair; price: number; days: number | null; per: number | null; features: Pair[]; cta: Pair; variant: 'ghost' | 'accent' | 'secondary'; popular?: boolean }[] = [
  { name: ['Bepul', 'Бесплатно'], price: 0, days: null, per: null, features: [F.five, F.stats], cta: ['Boshlash', 'Начать'], variant: 'ghost' },
  { name: ['2 hafta', '2 недели'], price: 15000, days: 14, per: 1071, features: [F.all, F.mist, F.rand, F.noads], cta: ['Sotib olish', 'Купить'], variant: 'secondary' },
  { name: ['1 oy', '1 месяц'], price: 25000, days: 30, per: 833, features: [F.all, F.mist, F.rand, F.full, F.noads], cta: ['Sotib olish', 'Купить'], variant: 'accent', popular: true },
  { name: ['3 oy', '3 месяца'], price: 59000, days: 90, per: 656, features: [F.all, F.mist, F.rand, F.full, F.noads], cta: ['Sotib olish', 'Купить'], variant: 'secondary' },
];

// Structured data for Google (organization, site, product with prices, FAQ rich results)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: 'Rulio',
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: ['https://www.instagram.com/rulio.uz/'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Rulio — Prava test 2026',
      inLanguage: ['uz', 'ru'],
      publisher: { '@id': `${SITE_URL}/#org` },
    },
    {
      '@type': 'WebApplication',
      name: 'Rulio — prava imtihoniga tayyorgarlik',
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, Telegram',
      inLanguage: ['uz', 'ru'],
      description:
        "YHXBB rasmiy bazasidagi 1250+ test savoli, 63 bilet, 25 daqiqalik imtihon rejimi va xatolar tahlili.",
      offers: [
        { '@type': 'Offer', name: 'Bepul', price: 0, priceCurrency: 'UZS' },
        { '@type': 'Offer', name: '2 hafta', price: 15000, priceCurrency: 'UZS' },
        { '@type': 'Offer', name: '1 oy', price: 25000, priceCurrency: 'UZS' },
        { '@type': 'Offer', name: '3 oy', price: 59000, priceCurrency: 'UZS' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqData.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ');

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, locale } = useLocale();
  const tp = (p: Pair) => t(p[0], p[1]);

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo href="/" size="md" />

          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label={t('Asosiy menyu', 'Главное меню')}>
            <Link href="#how" className={styles.navLink} onClick={() => setMenuOpen(false)}>{t('Qanday ishlaydi', 'Как это работает')}</Link>
            <Link href="#features" className={styles.navLink} onClick={() => setMenuOpen(false)}>{t('Imkoniyatlar', 'Возможности')}</Link>
            <Link href="#pricing" className={styles.navLink} onClick={() => setMenuOpen(false)}>{t('Tariflar', 'Тарифы')}</Link>
            <Link href="#faq" className={styles.navLink} onClick={() => setMenuOpen(false)}>{t('Savollar', 'Вопросы')}</Link>
            <Link href="/blog" className={styles.navLink} onClick={() => setMenuOpen(false)}>{t('Blog', 'Блог')}</Link>
          </nav>

          <div className={styles.headerActions}>
            <LanguageSelector variant="compact" />
            <Link href="/login" className={styles.loginLink}>{t('Kirish', 'Войти')}</Link>
            <button
              className={styles.mobileMenu}
              aria-label={t('Menyu', 'Меню')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                {menuOpen ? (
                  <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>
                ) : (
                  <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="14" y2="17" /></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        {/* ===== HERO ===== */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                {t('YHXBB rasmiy savollar bazasi · 2026', 'Официальная база вопросов ГУБДД · 2026')}
              </p>
              <h1 className={styles.heroTitle}>
                {locale === 'ru' ? (
                  <>Сдайте на права <span className="mark">с первого раза</span></>
                ) : (
                  <>{t('Pravani birinchi urinishda')} <span className="mark">{t('oling')}</span></>
                )}
              </h1>
              <p className={styles.heroSubtitle}>
                {t(
                  "Imtihondagi kabi 20 savol va 2 ta xato chegarasi. Har bir xatoingiz saqlanadi va to'g'ri javob tushuntiriladi, shuning uchun bir xil xatoni ikki marta qilmaysiz.",
                  'Как на экзамене: 20 вопросов и не больше 2 ошибок. Каждая ошибка сохраняется, правильный ответ объясняется, поэтому одну ошибку дважды вы не сделаете.',
                )}
              </p>
              <div className={styles.heroCta}>
                <Link href="/login">
                  <Button variant="accent" size="lg">{t('5 ta biletni bepul yechish', '5 билетов бесплатно')}</Button>
                </Link>
                <Link href="#pricing" className={styles.textLink}>
                  {t("Tariflarni ko'rish", 'Посмотреть тарифы')} <span aria-hidden="true">→</span>
                </Link>
              </div>
              <dl className={styles.stats}>
                <div><dt>{t('Savollar', 'Вопросов')}</dt><dd>1 250+</dd></div>
                <div><dt>{t('Biletlar', 'Билетов')}</dt><dd>63</dd></div>
                <div><dt>{t('Tillar', 'Языка')}</dt><dd>3</dd></div>
              </dl>
            </div>

            {/* Phone mockup with a real question from the bank (bilet 4, savol 10) */}
            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.lane} />
              <div className={styles.phone}>
                <div className={styles.phoneNotch} />
                <div className={styles.phoneScreen}>
                  <div className={styles.qTop}>
                    <span className={styles.qTicket}>{t('Bilet 4', 'Билет 4')}</span>
                    <span className={styles.qTimer}>18:42</span>
                  </div>
                  <div className={styles.qProgress}>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < 9 ? (i === 3 ? styles.dotWrong : styles.dotRight) : i === 9 ? styles.dotNow : styles.dot
                        }
                      />
                    ))}
                  </div>
                  <div className={styles.qImage}>
                    <svg viewBox="0 0 240 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                      <rect width="240" height="120" fill="#C9D2C3" />
                      <rect x="0" y="62" width="240" height="58" fill="#4B4F63" />
                      <rect x="0" y="50" width="240" height="14" fill="#E6E2D8" />
                      {Array.from({ length: 12 }).map((_, i) => (
                        <rect key={i} x={i * 22 + 4} y="90" width="12" height="3" fill="#F3F5F9" />
                      ))}
                      <rect x="0" y="62" width="240" height="2" fill="#B9B4A8" />
                      <circle cx="72" cy="44" r="5" fill="#14123A" />
                      <path d="M64 55 l8 -6 l8 6" stroke="#14123A" strokeWidth="3" fill="none" />
                      <circle cx="62" cy="57" r="5" fill="none" stroke="#14123A" strokeWidth="2.5" />
                      <circle cx="82" cy="57" r="5" fill="none" stroke="#14123A" strokeWidth="2.5" />
                      <circle cx="150" cy="40" r="4" fill="#E5322B" />
                      <rect x="147" y="44" width="6" height="12" rx="2" fill="#E5322B" />
                      <rect x="196" y="18" width="4" height="34" fill="#8A8FA8" />
                      <circle cx="198" cy="20" r="13" fill="#fff" stroke="#E5322B" strokeWidth="4" />
                    </svg>
                  </div>
                  <p className={styles.qText}>{t('Velosipedchilarga trotuarda harakatlanishga ruxsat etiladimi?', 'Разрешено ли велосипедистам ехать по тротуару?')}</p>
                  <ul className={styles.qAnswers}>
                    <li className={styles.answer}><b>A</b>{t('Ruxsat etiladi', 'Разрешено')}</li>
                    <li className={styles.answer}><b>B</b>{t("Piyodalar bo'lmaganda ruxsat etiladi", 'Разрешено, если нет пешеходов')}</li>
                    <li className={`${styles.answer} ${styles.answerRight}`}><b>C</b>{t('Taqiqlanadi', 'Запрещено')}</li>
                  </ul>
                </div>
              </div>
              <div className={styles.toast}>
                <span className={styles.toastIcon}>✓</span>
                <div><b>{t("To'g'ri!", 'Верно!')}</b><span>{t('9 / 10 savol', '9 / 10 вопросов')}</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className={styles.how} id="how">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>{t('Qanday ishlaydi', 'Как это работает')}</p>
            <h2 className={styles.sectionTitle}>{t('Uch qadamda imtihonga tayyor', 'Готовы к экзамену за три шага')}</h2>
          </div>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true"><i>1</i></span>
              <h3>{t('Telegram orqali kiring', 'Войдите через Telegram')}</h3>
              <p>{t('Telegram orqali bir bosishda, parolsiz. 5 ta bilet darhol ochiladi.', 'Одним нажатием, без пароля. 5 билетов открываются сразу.')}</p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true"><i>2</i></span>
              <h3>{t('Biletlarni yeching', 'Решайте билеты')}</h3>
              <p>{t('Har bir biletda 20 savol va 25 daqiqa vaqt, xuddi imtihondagidek.', 'В каждом билете 20 вопросов и 25 минут, как на экзамене.')}</p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true"><i>3</i></span>
              <h3>{t('Xatolarni takrorlang', 'Повторяйте ошибки')}</h3>
              <p>{t("Noto'g'ri javoblar alohida ro'yxatga tushadi. Ularni yopguncha takrorlaysiz.", 'Неправильные ответы попадают в отдельный список. Повторяете, пока не закроете их.')}</p>
            </li>
          </ol>
        </section>

        {/* ===== FEATURES (bento) ===== */}
        <section className={styles.features} id="features">
          <div className={styles.featuresInner}>
            <div className={styles.sectionHead}>
              <p className={`${styles.kicker} ${styles.kickerOnDark}`}>{t('Imkoniyatlar', 'Возможности')}</p>
              <h2 className={`${styles.sectionTitle} ${styles.titleOnDark}`}>{t("Imtihonda nima bo'lsa, Rulio'da ham shu", 'Всё, что будет на экзамене, есть в Rulio')}</h2>
            </div>

            <div className={styles.bento}>
              <article className={`${styles.tile} ${styles.tileExam}`}>
                <p className={styles.tileLabel}>{t('Imtihon rejimi', 'Режим экзамена')}</p>
                <h3>{t('20 savol · 25 daqiqa', '20 вопросов · 25 минут')}</h3>
                <p>{t("Vaqt tugasa test yakunlanadi. Natijani darhol ko'rasiz.", 'Когда время выходит, тест завершается. Результат сразу.')}</p>
                <div className={styles.examGrid} aria-hidden="true">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className={i < 13 ? (i === 6 ? styles.gWrong : styles.gDone) : undefined}>{i + 1}</span>
                  ))}
                </div>
                <div className={styles.examClock}>
                  <span>25:00</span>
                  <div className={styles.examBar}><i /></div>
                </div>
              </article>

              <article className={`${styles.tile} ${styles.tileMistakes}`}>
                <p className={styles.tileLabel}>{t('Xatolar tahlili', 'Разбор ошибок')}</p>
                <h3>{t('Har bir xato saqlanadi', 'Каждая ошибка сохраняется')}</h3>
                <ul className={styles.mistakeList}>
                  <li><span className={styles.x}>✕</span>{t("Chorrahadan birinchi bo'lib o'tadi…", 'Первым проезжает перекрёсток…')}</li>
                  <li><span className={styles.x}>✕</span>{t("Quyidagi belgilar qaysi yo'nalishda…", 'Эти знаки в каком направлении…')}</li>
                  <li><span className={styles.ok}>✓</span>{t('Harakatlanish kimga ruxsat etilgan?', 'Кому разрешено движение?')}</li>
                </ul>
              </article>

              <article className={`${styles.tile} ${styles.tileOctagon}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p className={styles.tileLabel}>{t('Oktagon', 'Октагон')}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: 'rgba(6, 214, 160, 0.15)', color: 'var(--brand-ink, #04694F)' }}>BETA</span>
                </div>
                <h3>{t('1 ga 1 tezkor mashg\'ulot', 'Дуэль 1 на 1')}</h3>
                <p>{t('AI bot bilan tezlikka savol yeching va bilimingizni sinang. Jonli multiplayer esa tez kunda!', 'Решайте вопросы на скорость с AI-ботом и тренируйте реакцию. Живой мультиплеер скоро!')}</p>
                <div className={styles.vs}><span>{t('Siz', 'Вы')}</span><b>VS</b><span>{t('AI Bot', 'AI Бот')}</span></div>
              </article>

              <article className={`${styles.tile} ${styles.tileLang}`}>
                <p className={styles.tileLabel}>{t('3 til', '3 языка')}</p>
                <ul className={styles.langList}>
                  <li><b>UZ</b>Yo&apos;l belgisi</li>
                  <li><b>ЎЗ</b>Йўл белгиси</li>
                  <li><b>RU</b>Дорожный знак</li>
                </ul>
              </article>

              <article className={`${styles.tile} ${styles.tileRandom}`}>
                <p className={styles.tileLabel}>{t('Random test', 'Случайный тест')}</p>
                <h3>{t('Butun bazadan aralash savollar', 'Вопросы вперемешку из всей базы')}</h3>
                <p>{t('Biletni yodlab olishdan saqlaydi.', 'Не даёт просто зазубрить билеты.')}</p>
              </article>
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className={styles.pricing} id="pricing">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>{t('Tariflar', 'Тарифы')}</p>
            <h2 className={styles.sectionTitle}>{t('Kuniga bir choy pulidan ham arzon', 'Дешевле чашки чая в день')}</h2>
            <p className={styles.sectionSubtitle}>{t("Bepul boshlang. Imtihon yaqinlashganda to'liq bazani oching.", 'Начните бесплатно. Ближе к экзамену откройте всю базу.')}</p>
          </div>
          <div className={styles.pricingGrid}>
            {plans.map((p) => (
              <div key={p.name[0]} className={`${styles.plan} ${p.popular ? styles.planPopular : ''}`}>
                {p.popular && <span className={styles.popularBadge}>{t("Ko'p tanlanadi", 'Популярный')}</span>}
                <p className={styles.planName}>{tp(p.name)}</p>
                <p className={styles.planPrice}>
                  {fmt(p.price)} <span>{t("so'm", 'сум')}</span>
                </p>
                <p className={styles.planPer}>
                  {p.per
                    ? t(`kuniga ~${fmt(p.per)} so'm · ${p.days} kun`, `~${fmt(p.per)} сум в день · ${p.days} дней`)
                    : t('Muddatsiz', 'Без срока')}
                </p>
                <ul className={styles.planFeatures}>
                  {p.features.map((f) => (
                    <li key={f[0]}><span className={styles.check} aria-hidden="true">✓</span>{tp(f)}</li>
                  ))}
                </ul>
                <Link href="/login" className={styles.planCta}>
                  <Button variant={p.variant} fullWidth>{tp(p.cta)}</Button>
                </Link>
              </div>
            ))}
          </div>
          <p className={styles.payNote}>{t("To'lov Payme yoki Click orqali, to'lovdan keyin tarif darhol faollashadi.", 'Оплата через Payme или Click, тариф включается сразу после оплаты.')}</p>
        </section>

        {/* ===== SEO TEXT ===== */}
        <section className={styles.seo} aria-labelledby="seo-title">
          <div className={styles.seoInner}>
            <h2 id="seo-title" className={styles.seoTitle}>Prava test savollari 2026: imtihonga onlayn tayyorgarlik</h2>
            <div className={styles.seoCols}>
              <div>
                <h3>YHQ biletlari va javoblari</h3>
                <p>
                  Rulio&apos;da haydovchilik guvohnomasi nazariy imtihonidagi barcha savollar bor: 63 ta bilet,
                  har birida 20 tadan savol. Har bir javob ostida Yo&apos;l harakati qoidalari (YHQ) bandi bilan
                  izoh beriladi, shuning uchun biletni yodlamaysiz, qoidani tushunasiz.
                </p>
              </div>
              <div>
                <h3>Imtihondagidek avtotest</h3>
                <p>
                  Imtihon rejimida 20 savol, 25 daqiqa va 2 tagacha xato qilish huquqi bor, nazariy
                  imtihonga yaqin sharoitda mashq qilasiz. Random testda savollar butun bazadan aralash tushadi. B toifa va boshqa
                  toifalar uchun tayyorlanayotganlar uchun mos.
                </p>
              </div>
              <div>
                <h3>3 tilda: o&apos;zbek, ўзбек, русский</h3>
                <p>
                  Testlarni lotin yoki kirill alifbosida yeching. Йўл ҳаракати қоидалари бўйича тестлар кирилл
                  алифбосида ҳам бор. Тесты ПДД Узбекистана 2026 года доступны и на русском языке.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className={styles.faq} id="faq">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>{t('Savollar', 'Вопросы')}</p>
            <h2 className={styles.sectionTitle}>{t("Ko'p beriladigan savollar", 'Частые вопросы')}</h2>
          </div>
          <div className={styles.faqList}>
            {faqData.map((item, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}>
                <button
                  id={`faq-q-${i}`}
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-a-${i}`}
                >
                  <span>{t(item.q, item.qRu)}</span>
                  <span className={styles.faqSign} aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={styles.faqAnswer}>
                    {t(item.a, item.aRu)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className={styles.finalCta}>
          <div className={styles.finalInner}>
            <h2>
              {locale === 'ru' ? (
                <>До экзамена есть время. Начните <span className="mark">сегодня</span>.</>
              ) : (
                <>{t('Imtihongacha vaqt bor.')} <span className="mark">{t('Bugun')}</span> {t('boshlang.')}</>
              )}
            </h2>
            <p>{t('5 ta bilet bepul. Telegram orqali kirasiz, karta kiritish shart emas.', '5 билетов бесплатно. Вход через Telegram, карта не нужна.')}</p>
            <Link href="/login">
              <Button variant="accent" size="lg">{t('Bepul boshlash', 'Начать бесплатно')}</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className={styles.footer} id="contact">
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Logo href="/" size="sm" />
            <p>{t('Haydovchilik guvohnomasi imtihoniga tayyorgarlik.', 'Подготовка к экзамену на водительские права.')}</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/blog" className={styles.footerLink}>{t('Blog', 'Блог')}</Link>
            <a href="https://www.instagram.com/rulio.uz/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Instagram · @rulio.uz</a>
            <Link href="/privacy" className={styles.footerLink}>{t('Maxfiylik siyosati', 'Политика конфиденциальности')}</Link>
            <Link href="/terms" className={styles.footerLink}>{t('Foydalanish shartlari', 'Условия использования')}</Link>
          </div>
          <p className={styles.footerCopyright}>© 2026 Rulio</p>
        </div>
      </footer>
    </>
  );
}
