import React from 'react';
import { IconProps } from './types';

/**
 * Save Ledger / Diskette Stamp: Engraved physical archive disk / ledger with clasp
 */
export const IconSaveLedger: React.FC<IconProps> = ({
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
    {/* Archive Plate Outline */}
    <path
      d="M 19 21 L 5 21 C 3.9 21 3 20.1 3 19 L 3 5 C 3 3.9 3.9 3 5 3 L 16 3 L 21 8 L 21 19 C 21 20.1 20.1 21 19 21 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      fill="var(--bg-card, #fff)"
    />
    {/* Upper Shutter Box */}
    <path d="M 7 3 L 7 8 L 15 8 L 15 3" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.15" />
    {/* Lower Label Window */}
    <rect x="7" y="13" width="10" height="8" stroke="currentColor" strokeWidth="1.4" fill="var(--bg-card, #fff)" />
    <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);
