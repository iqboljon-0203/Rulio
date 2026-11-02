import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import styles from './blog.module.css';

export function BlogHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Logo href="/" size="md" />
        <nav className={styles.headerNav} aria-label="Blog menyusi">
          <Link href="/blog">Blog</Link>
          <Link href="/login" className={styles.cta}>
            Bepul boshlash
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function BlogFooter() {
  return <footer className={styles.footer}>© 2026 Rulio · rulio.uz · Prava testlari va imtihonga tayyorgarlik</footer>;
}
