import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Information Mark: Engraved round information seal
 */
export const IconInfoNotice: React.FC<IconProps> = ({
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
    {/* Outer Circular Seal */}
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Info Glyphs: dot + line */}
    <circle cx="12" cy="8" r="1.2" fill="currentColor" />
    <path
      d="M 12 11.5 V 16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </svg>
);

