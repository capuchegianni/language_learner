import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Arrow Up: Engraved vertical pointing arrow / collapse indicator
 */
export const IconArrowUp: React.FC<IconProps> = ({
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
      d="M 12 21 L 12 6 M 6 11 L 12 4 L 18 11"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <line x1="9" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default IconArrowUp;

