import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Bulletin Hazard / Alert Warning: Heavy triangular placard with woodcut hatching
 */
export const IconHazardAlert: React.FC<IconProps> = ({
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
    {/* Triangle Outline */}
    <path
      d="M 12 2 L 23 21 L 1 21 Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    <path
      d="M 12 6 L 19.5 19.5 L 4.5 19.5 Z"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeDasharray="2 1.5"
    />
    {/* Exclamation Stamp */}
    <line x1="12" y1="9" x2="12" y2="14.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    <rect x="11" y="16.5" width="2" height="2" fill="currentColor" />
  </svg>
);

export default IconHazardAlert;
