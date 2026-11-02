import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  iconOnly = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.btn,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    iconOnly ? styles.iconOnly : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={disabled || loading} {...props}>
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
