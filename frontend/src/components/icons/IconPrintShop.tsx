import React from 'react';
import { IconProps } from './types';

/**
 * Print Shop / Settings: Detailed linotype press cogwheel & typeset mechanical matrix
 */
export const IconPrintShop: React.FC<IconProps> = ({
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
    {/* Mechanical Cog Outer Teeth */}
    <path
      d="M 10 2 L 14 2 L 14.5 4.5 L 17 5.5 L 19 4 L 21.5 6.5 L 20 8.5 L 21 11 L 23.5 11.5 L 23.5 14.5 L 21 15 L 20 17.5 L 21.5 19.5 L 19 22 L 17 20.5 L 14.5 21.5 L 14 24 L 10 24 L 9.5 21.5 L 7 20.5 L 5 22 L 2.5 19.5 L 4 17.5 L 3 15 L 0.5 14.5 L 0.5 11.5 L 3 11 L 4 8.5 L 2.5 6.5 L 5 4 L 7 5.5 L 9.5 4.5 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    {/* Center Press Spindle & Keyway */}
    <circle cx="12" cy="13" r="4.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="10.5" y="11.5" width="3" height="3" stroke="currentColor" strokeWidth="1.2" />
    {/* Cross-spokes */}
    <line x1="12" y1="4.5" x2="12" y2="8.5" stroke="currentColor" strokeWidth="1.3" />
    <line x1="12" y1="17.5" x2="12" y2="21.5" stroke="currentColor" strokeWidth="1.3" />
    <line x1="4.5" y1="13" x2="7.5" y2="13" stroke="currentColor" strokeWidth="1.3" />
    <line x1="16.5" y1="13" x2="19.5" y2="13" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

export default IconPrintShop;
