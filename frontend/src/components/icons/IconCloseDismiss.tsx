import React from 'react';
import { IconProps } from './types';

/**
 * Woodcut Close / Dismiss: Crossed linotype rules with ink corner marks
 */
export const IconCloseDismiss: React.FC<IconProps> = ({
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
    {/* Heavy Cross */}
    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    {/* Corner Ink Stops */}
    <circle cx="4" cy="4" r="1" fill="currentColor" />
    <circle cx="20" cy="4" r="1" fill="currentColor" />
    <circle cx="4" cy="20" r="1" fill="currentColor" />
    <circle cx="20" cy="20" r="1" fill="currentColor" />
  </svg>
);

export default IconCloseDismiss;
