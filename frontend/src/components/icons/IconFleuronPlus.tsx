import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Addition Fleuron / Plus
 */
export const IconFleuronPlus: React.FC<IconProps> = ({
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
    <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    {/* Fleur decorative serifs */}
    <line x1="9.5" y1="4" x2="14.5" y2="4" stroke="currentColor" strokeWidth="1.6" />
    <line x1="9.5" y1="20" x2="14.5" y2="20" stroke="currentColor" strokeWidth="1.6" />
    <line x1="4" y1="9.5" x2="4" y2="14.5" stroke="currentColor" strokeWidth="1.6" />
    <line x1="20" y1="9.5" x2="20" y2="14.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export default IconFleuronPlus;
