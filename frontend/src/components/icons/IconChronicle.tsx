import React from 'react';
import { IconProps } from './types';

/**
 * Chronicle / History: Engraved antique pocket watch with roman numeral ticks & crown loop
 */
export const IconChronicle: React.FC<IconProps> = ({
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
    {/* Watch Top Bow & Crown */}
    <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.4" />
    <rect x="10.5" y="4.5" width="3" height="2" stroke="currentColor" strokeWidth="1.2" fill="currentColor" />
    {/* Watch Outer Casing with double rim */}
    <circle cx="12" cy="14" r="8.5" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    <circle cx="12" cy="14" r="7" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1.5 1.5" />
    {/* Dial Roman Index Marks (12, 3, 6, 9) */}
    <line x1="12" y1="8" x2="12" y2="9.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="17" y1="14" x2="15.5" y2="14" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="20" x2="12" y2="18.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="7" y1="14" x2="8.5" y2="14" stroke="currentColor" strokeWidth="1.5" />
    {/* Engraved Watch Hands */}
    <line x1="12" y1="14" x2="12" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    <line x1="12" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    <circle cx="12" cy="14" r="1.2" fill="currentColor" />
  </svg>
);

export default IconChronicle;
