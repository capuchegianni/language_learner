import React from 'react';
import { IconProps } from './types';

/**
 * Brass Magnifier / Search: Engraved optical lens with brass bezel, screw bracket, and knurled grip
 */
export const IconMagnifierSearch: React.FC<IconProps> = ({
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
    {/* Outer Brass Lens Bezel */}
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    {/* Optical Glare Reflection Line */}
    <path d="M 6.5 7.5 C 7.5 6 9.5 5.5 11 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
    {/* Bezel Mounting Collar */}
    <rect x="14.5" y="14.5" width="2" height="2" transform="rotate(45 15.5 15.5)" fill="currentColor" />
    {/* Turned Wood / Brass Handle */}
    <line x1="16" y1="16" x2="22" y2="22" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
    <line x1="17.5" y1="17.5" x2="20.5" y2="20.5" stroke="var(--bg-card, #fff)" strokeWidth="0.9" />
  </svg>
);

export default IconMagnifierSearch;
