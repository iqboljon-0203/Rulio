import type { Metadata } from 'next';
import Link from 'next/link';
import { posts } from '@/lib/blog/posts';
import { SITE_URL } from '@/lib/seo';
import { BlogFooter, BlogHeader } from './BlogChrome';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: "Blog — prava olish va imtihon bo'yicha maqolalar",
  description:
    "Prava olish tartibi 2026, nazariy imtihon formati, yangi yo'l qoidalari va imtihonga tayyorgarlik bo'yicha foydali maqolalar.",
  alternates: { canonical: '/blog' },
  openGraph: { url: `${SITE_URL}/blog`, type: 'website' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });

export default function BlogIndex() {
  const sorted = posts;
  return (
    <div className={styles.page}>
      <BlogHeader />
      <main className={styles.wrap}>
        <p className={styles.kicker}>Rulio blogi</p>
        <h1 className={styles.h1}>Prava olish va imtihon haqida</h1>
        <p className={styles.lead}>
          Haydovchilik guvohnomasi olish tartibi, nazariy imtihon, yangi qoidalar va tayyorgarlik bo&apos;yicha qisqa,
          tushunarli maqolalar.
        </p>
        <div className={styles.grid}>
          {sorted.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.card}>
              <div className={styles.meta}>
                <span className={styles.tag}>{p.category}</span>
                <span>{fmtDate(p.date)}</span>
                <span>· {p.readMinutes} daqiqa</span>
              </div>
              <h2 className={styles.cardTitle}>{p.title}</h2>
              <p className={styles.cardDesc}>{p.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
