import React from 'react';
import { IconProps } from './types';

/**
 * Drafting Pen / Edit Stylus: Engraved compass / drafting pen with knurled grip
 */
export const IconDraftingEdit: React.FC<IconProps> = ({
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
    {/* Stylus Shaft */}
    <path
      d="M 16 3 L 21 8 L 8 21 L 3 21 L 3 16 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    <line x1="13" y1="6" x2="18" y2="11" stroke="currentColor" strokeWidth="1.4" />
    {/* Knurled Hatching Grips */}
    <line x1="6" y1="15" x2="9" y2="18" stroke="currentColor" strokeWidth="1.2" />
    <line x1="8" y1="13" x2="11" y2="16" stroke="currentColor" strokeWidth="1.2" />
    {/* Nib tip */}
    <polygon points="3,21 3,17 7,21" fill="currentColor" />
  </svg>
);

export default IconDraftingEdit;
