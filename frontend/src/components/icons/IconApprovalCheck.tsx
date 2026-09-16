import React from 'react';
import { IconProps } from './types';

/**
 * Approval Ink Stamp / Checkmark: Heavy woodcut check seal with ink bleed spurs
 */
export const IconApprovalCheck: React.FC<IconProps> = ({
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
      d="M 4 12.5 L 9.5 18 L 20 6.5"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    {/* Double tick line for engraved feel */}
    <path
      d="M 4 15 L 9.5 20.5 L 18 9"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="square"
      strokeDasharray="2 1"
    />
  </svg>
);

export default IconApprovalCheck;
