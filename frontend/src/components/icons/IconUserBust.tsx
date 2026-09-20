import React from 'react';
import { IconProps } from './types';

/**
 * Journalist Bust / User Silhouette: Engraved cameo portrait oval
 */
export const IconUserBust: React.FC<IconProps> = ({
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
    {/* Oval Cameo Head */}
    <circle cx="12" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Editor Shoulders / Coat */}
    <path
      d="M 4 20 C 4 15.5 7.5 14.5 12 14.5 C 16.5 14.5 20 15.5 20 20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      fill="var(--bg-card, #fff)"
    />
    {/* Lapel / Necktie Accent */}
    <line x1="12" y1="14.5" x2="12" y2="18.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M 10 16 L 12 18.5 L 14 16" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
