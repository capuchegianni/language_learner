import React from 'react';
import { IconProps } from './types';

/**
 * Celestial Evening Moon: Engraved woodcut crescent with hatched craters & etching stars
 */
export const IconMoonCelestial: React.FC<IconProps> = ({
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
    {/* Woodcut Crescent Moon */}
    <path
      d="M 14 3 C 8.5 3 4 7.5 4 13 C 4 18.5 8.5 23 14 23 C 18 23 21.5 20.5 22.5 17 C 16.5 17.5 11.5 12.5 12 6.5 C 12.5 5 13.2 4 14 3 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    {/* Inner Hatched Shade on Crescent */}
    <path d="M 8 11 C 7.5 13.5 8 16 10 18" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
    {/* Distant Etched Star Fleuron */}
    <path d="M 18 4 L 19 7 L 22 8 L 19 9 L 18 12 L 17 9 L 14 8 L 17 7 Z" fill="currentColor" />
  </svg>
);

export default IconMoonCelestial;
