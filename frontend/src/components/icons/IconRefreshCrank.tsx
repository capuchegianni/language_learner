import React from 'react';
import { IconProps } from './types';

/**
 * Rotary Press Crank / Refresh: Circular press cycle arrows with engraved spur teeth
 */
export const IconRefreshCrank: React.FC<IconProps> = ({
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
    {/* Upper Clockwise Arc */}
    <path
      d="M 21 4 L 21 9 L 16 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <path
      d="M 21 9 C 19.5 5 15.5 2.5 11 3 C 6.5 3.5 3 7 3 11.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
    />
    {/* Lower Clockwise Arc */}
    <path
      d="M 3 20 L 3 15 L 8 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <path
      d="M 3 15 C 4.5 19 8.5 21.5 13 21 C 17.5 20.5 21 17 21 12.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
    />
  </svg>
);
