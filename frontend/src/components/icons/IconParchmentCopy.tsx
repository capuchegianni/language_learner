import React from 'react';
import { IconProps } from './types';

/**
 * Linotype Proof Duplicator / Copy: Stacked engraved broadsheet proof sheets
 */
export const IconParchmentCopy: React.FC<IconProps> = ({
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
    {/* Back Page with Folded Ear */}
    <path d="M 8 2 L 17 2 L 21 6 L 21 16 L 17 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    <path d="M 17 2 L 17 6 L 21 6" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.2" />
    {/* Front Proof Sheet */}
    <rect x="3" y="6" width="13" height="16" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Linotype Text Rows */}
    <line x1="5.5" y1="10" x2="13.5" y2="10" stroke="currentColor" strokeWidth="1.3" />
    <line x1="5.5" y1="13" x2="13.5" y2="13" stroke="currentColor" strokeWidth="1.3" />
    <line x1="5.5" y1="16" x2="11.5" y2="16" stroke="currentColor" strokeWidth="1.3" />
    <line x1="5.5" y1="18.5" x2="9.5" y2="18.5" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export default IconParchmentCopy;
