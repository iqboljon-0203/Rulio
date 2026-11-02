import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, fullWidth = true, className, id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const inputClass = [
      styles.input,
      icon ? styles.hasIcon : '',
      error ? styles.inputError : '',
      className || '',
    ].filter(Boolean).join(' ');

    return (
      <div className={styles.wrapper} style={fullWidth ? { width: '100%' } : undefined}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            <span>
              {label}
              {required && <span className={styles.required}>*</span>}
            </span>
          </label>
        )}
        <div className={styles.inputWrapper}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={inputClass}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <span id={`${inputId}-error`} className={styles.errorText} role="alert">
            {error}
          </span>
        )}
        {helpText && !error && (
          <span className={styles.helpText}>{helpText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
