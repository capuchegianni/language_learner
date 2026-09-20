import React from 'react';
import { IconProps } from './types';

/**
 * Printer's Ligature / Paper Fastener Link: Interlocking chain loops
 */
export const IconPaperclipLink: React.FC<IconProps> = ({
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
      d="M 15 7 L 18 4 C 19.5 2.5 22 2.5 22 5 C 22 7.5 19.5 10 18 10 L 15 10 M 9 17 L 6 20 C 4.5 21.5 2 21.5 2 19 C 2 16.5 4.5 14 6 14 L 9 14 M 8 12 L 16 12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
    />
  </svg>
);
