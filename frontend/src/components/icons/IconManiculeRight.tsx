import React from 'react';
import { IconProps } from './types';

/**
 * Printer's Manicule / Next Arrow: Engraved pointing index finger
 */
export const IconManiculeRight: React.FC<IconProps> = ({
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
    {/* Pointing Hand / Linotype Arrow */}
    <path
      d="M 3 12 L 18 12 M 13 6 L 20 12 L 13 18"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <line x1="3" y1="9" x2="3" y2="15" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default IconManiculeRight;
