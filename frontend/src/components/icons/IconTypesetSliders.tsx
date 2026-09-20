import React from 'react';
import { IconProps } from './types';

/**
 * Typeset Gauge Rules / Sliders: Horizontal typography gauge calipers
 */
export const IconTypesetSliders: React.FC<IconProps> = ({
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
    {/* Line 1 */}
    <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    <rect x="7" y="3.5" width="4" height="5" stroke="currentColor" strokeWidth="1.4" fill="var(--bg-card, #fff)" />
    {/* Line 2 */}
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    <rect x="14" y="9.5" width="4" height="5" stroke="currentColor" strokeWidth="1.4" fill="var(--bg-card, #fff)" />
    {/* Line 3 */}
    <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    <rect x="5" y="15.5" width="4" height="5" stroke="currentColor" strokeWidth="1.4" fill="var(--bg-card, #fff)" />
  </svg>
);
