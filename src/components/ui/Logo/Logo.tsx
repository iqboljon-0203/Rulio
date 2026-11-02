import React from 'react';
import Link from 'next/link';
import styles from './Logo.module.css';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'text-only';
  theme?: 'dark' | 'light' | 'auto';
  href?: string;
  className?: string;
}

export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1080 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${styles.svgIcon} ${className}`}
      aria-hidden="true"
    >
      {/* Rulio belgisi: pastki oyog'i yo'lga aylangan "R" */}
      <rect width="1080" height="1080" rx="250" fill="#06D6A0" />
      <g transform="translate(23 23)">
        <path
          d="M330 820 V260 H560 A170 170 0 0 1 560 600 H330"
          stroke="#14123A"
          strokeWidth="130"
          strokeLinejoin="round"
        />
        <path d="M545 600 L760 840" stroke="#14123A" strokeWidth="150" />
        <path d="M552 608 L752 832" stroke="#06D6A0" strokeWidth="14" strokeDasharray="40 36" />
      </g>
    </svg>
  );
}

export function Logo({
  size = 'md',
  variant = 'full',
  theme = 'auto',
  href,
  className = '',
}: LogoProps) {
  const iconSizeMap = {
    sm: 26,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const currentIconSize = iconSizeMap[size];

  const content = (
    <div
      className={`
        ${styles.logoContainer}
        ${styles[size]}
        ${styles[theme]}
        ${className}
      `}
    >
      {variant !== 'text-only' && (
        <div className={styles.iconWrapper}>
          <LogoIcon size={currentIconSize} />
        </div>
      )}

      {variant !== 'icon-only' && (
        <span className={styles.logotype}>
          <span className={styles.brandPrimary}>Rul</span>
          <span className={styles.brandAccent}>io</span>
          <span className={styles.brandDot} />
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.logoLink} aria-label="Rulio bosh sahifasi">
        {content}
      </Link>
    );
  }

  return content;
}
