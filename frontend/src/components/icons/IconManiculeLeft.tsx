import React from 'react';
import { IconProps } from './types';

/**
 * Printer's Manicule / Previous Arrow: Engraved reverse pointing index finger
 */
export const IconManiculeLeft: React.FC<IconProps> = ({
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
    <path
      d="M 21 12 L 6 12 M 11 6 L 4 12 L 11 18"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <line x1="21" y1="9" x2="21" y2="15" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default IconManiculeLeft;
