import React from 'react';
import { IconProps } from './types';

/**
 * Lexicon / Word Bank: Engraved open leather-bound dictionary with spine ridges & text lines
 */
export const IconLexicon: React.FC<IconProps> = ({
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
    {/* Open Book Outline */}
    <path
      d="M 2 6 C 6 4.5 10 5 12 7 C 14 5 18 4.5 22 6 L 22 19 C 18 17.5 14 18 12 20 C 10 18 6 17.5 2 19 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    {/* Center Spine Ridge */}
    <line x1="12" y1="7" x2="12" y2="20" stroke="currentColor" strokeWidth="1.6" />
    {/* Left Page Hatched Lines */}
    <line x1="4.5" y1="8.5" x2="9.5" y2="8" stroke="currentColor" strokeWidth="1.1" />
    <line x1="4.5" y1="11" x2="9.5" y2="10.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="4.5" y1="13.5" x2="9.5" y2="13" stroke="currentColor" strokeWidth="1.1" />
    <line x1="4.5" y1="16" x2="8.5" y2="15.5" stroke="currentColor" strokeWidth="1.1" />
    {/* Right Page Hatched Lines */}
    <line x1="14.5" y1="8" x2="19.5" y2="8.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="14.5" y1="10.5" x2="19.5" y2="11" stroke="currentColor" strokeWidth="1.1" />
    <line x1="14.5" y1="13" x2="19.5" y2="13.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="14.5" y1="15.5" x2="18.5" y2="16" stroke="currentColor" strokeWidth="1.1" />
    {/* Bookmark Ribbon */}
    <path d="M 12 20 L 12 23 L 14 21.5 L 16 23 L 16 19.5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export default IconLexicon;
