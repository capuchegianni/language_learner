import React from 'react';
import { IconProps } from './types';

/**
 * Editorial Menu / Section Index: Triple newspaper lead column rules
 */
export const IconMenuBroadsheet: React.FC<IconProps> = ({
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
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    {/* End Tick Accents */}
    <line x1="3" y1="4.5" x2="3" y2="7.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="21" y1="4.5" x2="21" y2="7.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="10.5" x2="3" y2="13.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="21" y1="10.5" x2="21" y2="13.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="16.5" x2="3" y2="19.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="21" y1="16.5" x2="21" y2="19.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default IconMenuBroadsheet;
