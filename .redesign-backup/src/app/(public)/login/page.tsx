'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Xatolik yuz berdi');
        return;
      }

      router.push('/home');
    } catch {
      setError('Tarmoq xatosi. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Logo href="/" size="lg" />
        </div>
        <h1 className={styles.authTitle}>Hisobingizga kiring</h1>
        <p className={styles.authSubtitle}>Testlarni yechishni davom ettiring</p>

        {error && <div className={styles.authError}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <Input
            label="Telefon raqam"
            type="tel"
            placeholder="+998 90 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            }
          />

          <Input
            label="Parol"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />

          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">Parolni unutdingizmi?</Link>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Kirish
          </Button>
        </form>

        <p className={styles.authFooter}>
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/register">Ro&apos;yxatdan o&apos;ting</Link>
        </p>
      </div>
    </div>
  );
}
