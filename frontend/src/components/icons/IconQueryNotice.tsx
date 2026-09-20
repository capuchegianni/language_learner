import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Query Mark / Help Notice: Engraved round question seal
 */
export const IconQueryNotice: React.FC<IconProps> = ({
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
    {/* Outer Circular Seal */}
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Engraved Question Glyphs */}
    <path
      d="M 9.5 9 C 9.5 7.5 10.5 6.5 12 6.5 C 13.5 6.5 14.5 7.5 14.5 9 C 14.5 11 12 11.5 12 13.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <rect x="11" y="16" width="2" height="2" fill="currentColor" />
  </svg>
);
