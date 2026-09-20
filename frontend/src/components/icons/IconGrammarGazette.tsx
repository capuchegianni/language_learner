import React from 'react';
import { IconProps } from './types';

/**
 * Grammar Gazette / Rule Bank: Antique scroll parchment with rolled scrolls & wax seal
 */
export const IconGrammarGazette: React.FC<IconProps> = ({
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
    {/* Scroll Top Roll */}
    <ellipse cx="6" cy="4.5" rx="3" ry="1.8" stroke="currentColor" strokeWidth="1.6" fill="var(--bg-card, #fff)" />
    <path d="M 6 3 L 19 3 C 20.5 3 21.5 4 21.5 5 C 21.5 6 20.5 7 19 7 L 6 7" stroke="currentColor" strokeWidth="1.6" />
    {/* Main Scroll Sheet Body */}
    <path d="M 4 5 L 4 18 C 4 19.5 5 20.5 6.5 20.5 L 18 20.5" stroke="currentColor" strokeWidth="1.6" fill="var(--bg-card, #fff)" />
    <path d="M 21.5 6.5 L 21.5 17 C 21.5 18 20.5 19 19 19 L 6 19" stroke="currentColor" strokeWidth="1.4" />
    {/* Bottom Roll */}
    <ellipse cx="18" cy="19.5" rx="3" ry="1.8" stroke="currentColor" strokeWidth="1.6" fill="var(--bg-card, #fff)" />
    {/* Scribed Text Lines */}
    <line x1="7" y1="9.5" x2="17" y2="9.5" stroke="currentColor" strokeWidth="1.2" />
    <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.2" />
    <line x1="7" y1="14.5" x2="14" y2="14.5" stroke="currentColor" strokeWidth="1.2" />
    {/* Wax Seal Pendant */}
    <circle cx="10" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.4" fill="var(--stamp-red, #8b1c1c)" />
    <line x1="10" y1="15.8" x2="10" y2="17" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export default IconGrammarGazette;
