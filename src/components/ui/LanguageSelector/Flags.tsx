import React from 'react';

export function UzFlag({ size = 20, className }: { size?: number; className?: string }) {
  const height = Math.round((size * 2) / 3);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 30 20"
      className={className}
      style={{
        borderRadius: '4px',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <clipPath id="uz-clip">
        <rect width="30" height="20" rx="4" />
      </clipPath>
      <g clipPath="url(#uz-clip)">
        {/* Top Blue */}
        <rect width="30" height="6.6" fill="#0099B5" />
        {/* Upper Red Line */}
        <rect y="6.4" width="30" height="0.5" fill="#CE1126" />
        {/* Middle White */}
        <rect y="6.9" width="30" height="6.2" fill="#FFFFFF" />
        {/* Lower Red Line */}
        <rect y="13.1" width="30" height="0.5" fill="#CE1126" />
        {/* Bottom Green */}
        <rect y="13.6" width="30" height="6.4" fill="#1EB53A" />

        {/* Crescent */}
        <circle cx="5" cy="3.3" r="2.1" fill="#FFFFFF" />
        <circle cx="5.8" cy="3.3" r="1.8" fill="#0099B5" />

        {/* Stars (3 rows: 3, 4, 5) */}
        {/* Row 1 */}
        <circle cx="8.5" cy="1.8" r="0.4" fill="#FFFFFF" />
        <circle cx="9.8" cy="1.8" r="0.4" fill="#FFFFFF" />
        <circle cx="11.1" cy="1.8" r="0.4" fill="#FFFFFF" />

        {/* Row 2 */}
        <circle cx="8.5" cy="3.3" r="0.4" fill="#FFFFFF" />
        <circle cx="9.8" cy="3.3" r="0.4" fill="#FFFFFF" />
        <circle cx="11.1" cy="3.3" r="0.4" fill="#FFFFFF" />
        <circle cx="12.4" cy="3.3" r="0.4" fill="#FFFFFF" />

        {/* Row 3 */}
        <circle cx="8.5" cy="4.8" r="0.4" fill="#FFFFFF" />
        <circle cx="9.8" cy="4.8" r="0.4" fill="#FFFFFF" />
        <circle cx="11.1" cy="4.8" r="0.4" fill="#FFFFFF" />
        <circle cx="12.4" cy="4.8" r="0.4" fill="#FFFFFF" />
        <circle cx="13.7" cy="4.8" r="0.4" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function RuFlag({ size = 20, className }: { size?: number; className?: string }) {
  const height = Math.round((size * 2) / 3);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 30 20"
      className={className}
      style={{
        borderRadius: '4px',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <clipPath id="ru-clip">
        <rect width="30" height="20" rx="4" />
      </clipPath>
      <g clipPath="url(#ru-clip)">
        <rect width="30" height="6.67" fill="#FFFFFF" />
        <rect y="6.67" width="30" height="6.67" fill="#0039A6" />
        <rect y="13.34" width="30" height="6.67" fill="#D52B1E" />
      </g>
    </svg>
  );
}
