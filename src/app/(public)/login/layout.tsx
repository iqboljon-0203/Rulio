import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kirish',
  description: "Rulio'ga Telegram orqali parolsiz kiring: @ruliouzbot sizga 6 xonali kod yuboradi.",
  alternates: { canonical: '/login' },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
