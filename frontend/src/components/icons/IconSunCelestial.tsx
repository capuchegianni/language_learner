import React from 'react';
import { IconProps } from './types';

/**
 * Celestial Morning Sun: Engraved woodcut sun with radiant hatched rays & engraved face profile
 */
export const IconSunCelestial: React.FC<IconProps> = ({
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
    {/* Sun Center Disk */}
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 1" />
    {/* Cardinal Engraved Rays */}
    <line x1="12" y1="1" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    <line x1="1" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    <line x1="19" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    {/* Diagonal Triangular Woodcut Flares */}
    <path d="M 4.5 4.5 L 7 6.5 L 6.5 7 Z" fill="currentColor" />
    <path d="M 19.5 4.5 L 17.5 7 L 17 6.5 Z" fill="currentColor" />
    <path d="M 4.5 19.5 L 6.5 17 L 7 17.5 Z" fill="currentColor" />
    <path d="M 19.5 19.5 L 17 17.5 L 17.5 17 Z" fill="currentColor" />
  </svg>
);

export default IconSunCelestial;
