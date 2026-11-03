import Link from 'next/link';
import { BlogFooter, BlogHeader } from '@/app/blog/BlogChrome';
import styles from '@/app/blog/blog.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <BlogHeader />
      <main className={styles.wrap}>
        <article className={styles.article} style={{ textAlign: 'center' }}>
          <p className={styles.kicker}>404</p>
          <h1 className={styles.h1}>Bu sahifa topilmadi</h1>
          <p className={styles.lead}>Havola eskirgan yoki noto&apos;g&apos;ri yozilgan bo&apos;lishi mumkin.</p>
          <p style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className={styles.ctaBtn}>Bosh sahifa</Link>
            <Link href="/blog" className={styles.ctaBtn}>Blog</Link>
          </p>
        </article>
      </main>
      <BlogFooter />
    </div>
  );
}
