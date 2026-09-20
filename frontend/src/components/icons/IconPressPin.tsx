import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Pin / Brass Tack: Woodcut registration pin
 */
export const IconPressPin: React.FC<IconProps> = ({
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
    <path d="M 12 17 L 12 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    <path
      d="M 5 17 L 19 17 L 17 8 L 7 8 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    <line x1="8" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
