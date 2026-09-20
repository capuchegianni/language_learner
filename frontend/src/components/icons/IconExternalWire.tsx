import React from 'react';
import { IconProps } from './types';

/**
 * External Dispatch Link / Gazette Wire
 */
export const IconExternalWire: React.FC<IconProps> = ({
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
    <path d="M 18 13 L 18 19 L 5 19 L 5 6 L 11 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    <path d="M 13 5 L 19 5 L 19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    <line x1="19" y1="5" x2="10" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export default IconExternalWire;
