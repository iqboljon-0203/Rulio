import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'glow';
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

const padMap = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
};

export function Card({
  children,
  padding = 'md',
  variant = 'default',
  interactive = false,
  className,
  onClick,
}: CardProps) {
  const classNames = [
    styles.card,
    padMap[padding],
    variant !== 'default' ? styles[variant] : '',
    interactive ? styles.interactive : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick} role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}>
      {children}
    </div>
  );
}
