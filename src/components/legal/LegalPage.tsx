import type { ReactNode } from 'react';
import { BlogFooter, BlogHeader } from '@/app/blog/BlogChrome';
import styles from '@/app/blog/blog.module.css';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className={styles.page}>
      <BlogHeader />
      <main className={styles.wrap}>
        <article className={styles.article}>
          <h1 className={styles.h1}>{title}</h1>
          <p className={styles.lead}>Oxirgi yangilanish: {updated}</p>
          <div className={styles.body}>{children}</div>
        </article>
      </main>
      <BlogFooter />
    </div>
  );
}
