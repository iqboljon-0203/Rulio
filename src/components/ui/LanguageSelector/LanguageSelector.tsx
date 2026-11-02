'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Locale, locales, localeNames } from '@/lib/i18n/config';
import { UzFlag, RuFlag } from './Flags';
import { useLocale } from '@/components/i18n/LocaleProvider';
import styles from './LanguageSelector.module.css';

const shortNames: Record<Locale, string> = {
  'uz-lat': 'UZ',
  'uz-cyr': 'ЎЗ',
  ru: 'RU',
};

const localeDetails: Record<Locale, { title: string; subtitle: string; badge: string }> = {
  'uz-lat': { title: "O'zbekcha", subtitle: 'Lotin alifbosi', badge: 'UZ' },
  'uz-cyr': { title: 'Ўзбекча', subtitle: 'Кирилл алифбоси', badge: 'ЎЗ' },
  ru: { title: 'Русский', subtitle: 'Русский язык', badge: 'RU' },
};

export interface LanguageSelectorProps {
  currentLocale?: Locale;
  onChange?: (locale: Locale) => void;
  variant?: 'default' | 'compact' | 'ghost';
  fullWidth?: boolean;
  className?: string;
}

export function getFlagComponent(locale: Locale, size = 18) {
  switch (locale) {
    case 'uz-lat':
    case 'uz-cyr':
      return <UzFlag size={size} />;
    case 'ru':
      return <RuFlag size={size} />;
    default:
      return <UzFlag size={size} />;
  }
}

export function LanguageSelector({
  currentLocale: controlledLocale,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = '',
}: LanguageSelectorProps) {
  const ctx = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLocale = controlledLocale || ctx.locale;

  // Click outside & ESC listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (loc: Locale) => {
    setIsOpen(false);
    ctx.setLocale(loc);
    onChange?.(loc);
  };

  return (
    <div
      ref={dropdownRef}
      className={`${styles.wrapper} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
    >
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={localeNames[selectedLocale]}
      >
        <span className={styles.triggerContent}>
          <span className={styles.flagWrap}>
            {getFlagComponent(selectedLocale, variant === 'compact' ? 18 : 20)}
          </span>
          <span className={styles.label}>
            {variant === 'compact' ? shortNames[selectedLocale] : localeDetails[selectedLocale].title}
          </span>
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.dropdownHeader}>
            <span>{selectedLocale === 'ru' ? 'Выберите язык' : 'Tilni tanlang'}</span>
          </div>
          <div className={styles.optionsList}>
            {locales.map((loc) => {
              const isActive = loc === selectedLocale;
              const details = localeDetails[loc];
              return (
                <button
                  key={loc}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                  onClick={() => handleSelect(loc)}
                >
                  <div className={styles.optionLeft}>
                    <span className={styles.optionFlag}>
                      {getFlagComponent(loc, 22)}
                    </span>
                    <div className={styles.optionText}>
                      <span className={styles.optionTitle}>{details.title}</span>
                      <span className={styles.optionSubtitle}>{details.subtitle}</span>
                    </div>
                  </div>
                  <div className={styles.optionRight}>
                    <span className={styles.codeBadge}>{details.badge}</span>
                    {isActive && (
                      <span className={styles.checkCircle}>
                        <svg
                          className={styles.checkIcon}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
