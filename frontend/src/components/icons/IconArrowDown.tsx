import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Arrow Down: Engraved vertical pointing arrow / drop indicator
 */
export const IconArrowDown: React.FC<IconProps> = ({
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
      d="M 12 3 L 12 18 M 6 13 L 12 20 L 18 13"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <line x1="9" y1="3" x2="15" y2="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default IconArrowDown;

