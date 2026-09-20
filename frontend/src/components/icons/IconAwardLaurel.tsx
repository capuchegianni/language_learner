import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Laurel Medallion / Prize Award: Engraved gold medal with hanging ribbon
 */
export const IconAwardLaurel: React.FC<IconProps> = ({
  size = 20,
  className = '',
  title,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`broadsheet-icon ${className}`}
    aria-hidden={!title}
    {...props}
  >
    {title && <title>{title}</title>}
    {/* Central Medal Circle */}
    <circle cx="12" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    <circle cx="12" cy="9" r="4.5" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    <polygon points="12,5.5 13.5,8 16,8.5 14,10.5 14.5,13 12,11.5 9.5,13 10,10.5 8,8.5 10.5,8" fill="currentColor" />
    {/* Hanging Ribbon Tails */}
    <path d="M 8 14.5 L 6 22 L 12 19 L 18 22 L 16 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" fill="var(--bg-card, #fff)" />
  </svg>
);
