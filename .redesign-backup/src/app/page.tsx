'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Logo } from '@/components/ui/Logo';

const faqData = [
  {
    q: "Rulio qanday ishlaydi?",
    a: "Rulio haydovchilik guvohnomasi imtihoniga tayyorgarlik platformasi. Siz biletlar bo'yicha yoki random formatda test yechib, o'z bilimingizni sinab ko'rishingiz mumkin. Xato qilgan savollaringiz alohida saqlanadi va ularni qayta takrorlay olasiz."
  },
  {
    q: "Savollar haqiqiy imtihon savollarimi?",
    a: "Ha, barcha savollar YHXBB (Yo'l Harakati Xavfsizligi Bosh Boshqarmasi) ning rasmiy savollar bazasiga asoslangan va doimiy yangilanib turadi."
  },
  {
    q: "Bepul foydalanish mumkinmi?",
    a: "Ha! Bepul rejada 5 ta biletni yechishingiz mumkin. To'liq bazaga kirish uchun Premium tariflardan birini tanlashingiz kerak."
  },
  {
    q: "Telefondan foydalanish qulaymi?",
    a: "Albatta! Rulio mobil-first prinsipi asosida yaratilgan. Telefoningiz brauzerida mukammal ishlaydi, hech qanday ilova o'rnatish shart emas."
  },
  {
    q: "To'lov qanday amalga oshiriladi?",
    a: "Payme, Click yoki Uzum Bank orqali to'lov qilishingiz mumkin. To'lov muvaffaqiyatli bo'lgach, Premium tarif avtomatik faollashadi."
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo href="/" size="md" />

          <nav className={styles.nav}>
            <Link href="#pricing" className={styles.navLink}>Tariflar</Link>
            <Link href="#faq" className={styles.navLink}>FAQ</Link>
            <Link href="#contact" className={styles.navLink}>Aloqa</Link>
          </nav>

          <div className={styles.headerActions}>
            <LanguageSelector />
            <Link href="/login">
              <Button variant="primary" size="sm">Kirish</Button>
            </Link>
            <button className={styles.mobileMenu} aria-label="Menyu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} animate-fade-in-up`}>
            Rulio bilan prava imtihoniga{' '}
            <span className={styles.heroHighlight}>100%</span>{' '}
            tayyor bo&apos;ling
          </h1>
          <p className={`${styles.heroSubtitle} animate-fade-in-up stagger-1`}>
            Haqiqiy imtihon savollari, xatolar tahlili va interaktiv mashg&apos;ulotlar
            orqali haydovchilik guvohnomasini olish imkoniyatingizni oshiring.
            Zamonaviy va qulay platforma.
          </p>
          <div className={`${styles.heroCta} animate-fade-in-up stagger-2`}>
            <Link href="/register">
              <Button variant="primary" size="lg">Testni boshlash</Button>
            </Link>
            <Link href="#pricing">
              <Button variant="secondary" size="lg">Tariflarni ko&apos;rish</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <div className={`${styles.featureCard} animate-fade-in-up`}>
            <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6" /><path d="M9 16h6" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>1000+ Savollar</h3>
            <p className={styles.featureDesc}>
              Doimiy yangilanib boruvchi, YHXBB bazasiga moslashtirilgan minglab test savollari.
            </p>
          </div>

          <div className={`${styles.featureCard} animate-fade-in-up stagger-1`}>
            <div className={`${styles.featureIcon} ${styles.featureIconCyan}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>3 ta til</h3>
            <p className={styles.featureDesc}>
              O&apos;zbek (lotin, kiril) va Rus tillarida qulay interfeys va savollar bazasi.
            </p>
          </div>

          <div className={`${styles.featureCard} animate-fade-in-up stagger-2`}>
            <div className={`${styles.featureIcon} ${styles.featureIconGreen}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Mobil format</h3>
            <p className={styles.featureDesc}>
              Istalgan joyda va istalgan vaqtda telefoningiz orqali testlarni yechish imkoniyati.
            </p>
          </div>
        </div>
      </section>

      {/* ===== TRUST ===== */}
      <section className={styles.trust}>
        <p className={styles.trustTitle}>BIZGA ISHONCH BILDIRGAN HAYDOVCHILAR</p>
        <div className={styles.trustLogos}>
          <div className={styles.trustLogo} />
          <div className={styles.trustLogo} />
          <div className={styles.trustLogo} />
          <div className={styles.trustLogo} />
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.pricingHeader}>
          <h2 className={styles.sectionTitle}>Tariflar</h2>
          <p className={styles.sectionSubtitle}>O&apos;zingizga mos rejani tanlang</p>
        </div>
        <div className={styles.pricingGrid}>
          {/* Free */}
          <div className={styles.pricingCard}>
            <p className={styles.pricingName}>Bepul</p>
            <p className={styles.pricingPrice}>0 <span className={styles.pricingCurrency}>so&apos;m</span></p>
            <p className={styles.pricingPeriod}>Cheksiz</p>
            <div className={styles.pricingFeatures}>
              {['5 ta bilet', 'Asosiy statistika', 'Reklama bor'].map((f) => (
                <div key={f} className={styles.pricingFeature}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/register">
              <Button variant="ghost" fullWidth>Boshlash</Button>
            </Link>
          </div>

          {/* 2 Week - Popular */}
          <div className={`${styles.pricingCard} ${styles.pricingPopular}`}>
            <span className={styles.popularBadge}>Ommabop</span>
            <p className={styles.pricingName}>Premium 2 hafta</p>
            <p className={styles.pricingPrice}>15,000 <span className={styles.pricingCurrency}>so&apos;m</span></p>
            <p className={styles.pricingPeriod}>14 kun</p>
            <div className={styles.pricingFeatures}>
              {['Barcha biletlar', 'Batafsil statistika', 'Reklama yo\'q', 'Xatolar tahlili'].map((f) => (
                <div key={f} className={styles.pricingFeature}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/register">
              <Button variant="primary" fullWidth>Sotib olish</Button>
            </Link>
          </div>

          {/* 1 Month */}
          <div className={styles.pricingCard}>
            <p className={styles.pricingName}>Premium 1 oy</p>
            <p className={styles.pricingPrice}>25,000 <span className={styles.pricingCurrency}>so&apos;m</span></p>
            <p className={styles.pricingPeriod}>30 kun</p>
            <div className={styles.pricingFeatures}>
              {['Barcha biletlar', 'Batafsil statistika', 'Reklama yo\'q', 'Xatolar tahlili', 'Prioritet yordam'].map((f) => (
                <div key={f} className={styles.pricingFeature}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/register">
              <Button variant="secondary" fullWidth>Sotib olish</Button>
            </Link>
          </div>

          {/* 3 Month */}
          <div className={styles.pricingCard}>
            <p className={styles.pricingName}>Premium 3 oy</p>
            <p className={styles.pricingPrice}>59,000 <span className={styles.pricingCurrency}>so&apos;m</span></p>
            <p className={styles.pricingPeriod}>90 kun</p>
            <div className={styles.pricingFeatures}>
              {['Barcha biletlar', 'Batafsil statistika', 'Reklama yo\'q', 'Xatolar tahlili', 'Prioritet yordam', 'Shaxsiy maslahat'].map((f) => (
                <div key={f} className={styles.pricingFeature}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/register">
              <Button variant="secondary" fullWidth>Sotib olish</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className={styles.faq} id="faq">
        <div className={styles.pricingHeader}>
          <h2 className={styles.sectionTitle}>Ko&apos;p beriladigan savollar</h2>
          <p className={styles.sectionSubtitle}>Javoblarni shu yerda toping</p>
        </div>
        <div className={styles.faqList}>
          {faqData.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{item.q}</span>
                <svg
                  className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ''}`}
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === i && (
                <div className={styles.faqAnswer}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={styles.footer} id="contact">
        <div className={styles.footerInner}>
          <p className={styles.footerCopyright}>© 2026 Rulio. Barcha huquqlar himoyalangan.</p>
          <div className={styles.footerLinks}>
            <Link href="/privacy" className={styles.footerLink}>Maxfiylik siyosati</Link>
            <Link href="/terms" className={styles.footerLink}>Foydalanish shartlari</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
