import React from 'react';
import { IconProps } from './types';

/**
 * Daguerreotype Frame / Image: Engraved landscape plate with sun and mountain linework
 */
export const IconDaguerreotype: React.FC<IconProps> = ({
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
    {/* Picture Frame */}
    <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Sun */}
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    {/* Etched Peaks */}
    <path
      d="M 21 16 L 16 10 L 4 19 L 21 19 Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="miter"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path d="M 14 14 L 18 19" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
