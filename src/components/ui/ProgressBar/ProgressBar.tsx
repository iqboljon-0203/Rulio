import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = 'md',
  color = 'primary',
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const trackClass = [
    styles.track,
    size === 'sm' ? styles.trackSm : '',
    size === 'lg' ? styles.trackLg : '',
  ].filter(Boolean).join(' ');

  const fillClass = [
    styles.fill,
    color !== 'primary' ? styles[color] : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      {(label || showPercentage) && (
        <div className={styles.label}>
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className={styles.percentage}>{Math.round(clampedValue)}%</span>
          )}
        </div>
      )}
      <div className={trackClass} role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={100}>
        <div className={fillClass} style={{ width: `${clampedValue}%` }} />
      </div>
    </div>
  );
}
