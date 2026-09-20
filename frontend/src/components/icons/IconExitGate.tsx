import React from 'react';
import { IconProps } from './types';

/**
 * Exit Portal / Log Out: Engraved printing house door portal with outward dispatch manicule
 */
export const IconExitGate: React.FC<IconProps> = ({
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
    {/* Door Frame Portal */}
    <path d="M 9 21 L 4 21 C 3.4 21 3 20.6 3 20 L 3 4 C 3 3.4 3.4 3 4 3 L 9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    {/* Outward Manicule Vector */}
    <path d="M 16 17 L 21 12 L 16 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
  </svg>
);
