import React from 'react';
import { IconProps } from './types';

/**
 * Engraved Armillary Globe: Woodcut globe with meridian rings & hatched equator
 */
export const IconGlobe: React.FC<IconProps> = ({
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
    {/* Outer Ring */}
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Central Meridian Ellipse */}
    <ellipse cx="12" cy="12" rx="4.5" ry="9" stroke="currentColor" strokeWidth="1.3" />
    {/* Equator & Parallels */}
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    <path d="M 5 7 C 8 8.5 16 8.5 19 7" stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.5 1.5" />
    <path d="M 5 17 C 8 15.5 16 15.5 19 17" stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.5 1.5" />
    {/* North and South Pole finials */}
    <line x1="12" y1="1.5" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="21" x2="12" y2="22.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
