import React from 'react';
import { IconProps } from './types';

/**
 * Telegraph Dispatch Dart / Send: Engraved folded dispatch dart
 */
export const IconSendTelegraph: React.FC<IconProps> = ({
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
      d="M 22 2 L 11 13 M 22 2 L 15 22 L 11 13 L 2 9 L 22 2 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
  </svg>
);
