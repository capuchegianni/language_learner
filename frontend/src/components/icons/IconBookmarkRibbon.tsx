import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Bookmark Ribbon: Woodcut hanging bookmark tag
 */
export const IconBookmarkRibbon: React.FC<IconProps> = ({
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
      d="M 19 21 L 12 16 L 5 21 L 5 4 C 5 3.4 5.4 3 6 3 L 18 3 C 18.6 3 19 3.4 19 4 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
