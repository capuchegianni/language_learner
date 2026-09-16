import React from 'react';
import { IconProps } from './types';

/**
 * New Dispatch: Engraved antique feather quill pen with copperplate barbs, ink nib, and written baseline
 */
export const IconNewDispatch: React.FC<IconProps> = ({
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
    {/* Main Feather Vane (Upper Plume) */}
    <path
      d="M 21.5 2.5 C 16 2.5 10.5 5.5 7.5 11 C 6.2 13.2 5.8 15.5 5.5 17.5 L 7 16.8 C 9 14 12.5 10.5 17 7.5 C 19.5 5.8 21 4 21.5 2.5 Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    {/* Lower Feather Vane */}
    <path
      d="M 21.5 2.5 C 20.5 5.5 18 8.5 15.5 11 C 13.5 13 11 15 9 16.5 L 9.5 18 C 11.5 16.5 14.5 14.5 17 11.5 C 19.5 8.5 21 5 21.5 2.5 Z"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="currentColor"
      fillOpacity="0.15"
    />
    {/* Center Rachis / Quill Shaft Spine */}
    <path
      d="M 21.5 2.5 C 16 7.5 11 13 6 18 L 3 21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
    />
    {/* Engraved Barb Hatching Marks */}
    <line x1="18.5" y1="4.5" x2="15.5" y2="7.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="15.5" y1="6.8" x2="12.5" y2="9.8" stroke="currentColor" strokeWidth="1.1" />
    <line x1="12.5" y1="9.5" x2="9.5" y2="12.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="10" y1="12.5" x2="7.5" y2="15" stroke="currentColor" strokeWidth="1" />
    {/* Sharpened Metal Nib Collar */}
    <path
      d="M 6.5 17.5 L 3 21 L 4.5 16.5 L 7.5 17 Z"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="currentColor"
    />
    {/* Inked Writing Baseline */}
    <path
      d="M 2 22 L 9 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </svg>
);

export default IconNewDispatch;
