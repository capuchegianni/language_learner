import React from 'react';
import { IconProps } from './types';

/**
 * Discard / Trash Shears: Engraved printer's shears / crossed cancellation blades
 */
export const IconTrashShears: React.FC<IconProps> = ({
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
    {/* Waste Box / Linotype Galley Dump */}
    <path d="M 4 6 L 20 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    <path d="M 9 3 L 15 3 L 16 6 L 8 6 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.2" />
    <path d="M 5.5 6 L 7 20 L 17 20 L 18.5 6" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Ribbed Inset Lines */}
    <line x1="9.5" y1="9.5" x2="9.5" y2="16.5" stroke="currentColor" strokeWidth="1.3" />
    <line x1="12" y1="9.5" x2="12" y2="16.5" stroke="currentColor" strokeWidth="1.3" />
    <line x1="14.5" y1="9.5" x2="14.5" y2="16.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

export default IconTrashShears;
