import React from 'react';
import { IconProps } from './types';

/**
 * Linotype Matrix / Brass Typesetting Block: Precision metal typeset component
 */
export const IconLinotypeMatrix: React.FC<IconProps> = ({
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
    {/* Brass Matrix Body */}
    <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Inner Matrix Core */}
    <rect x="8.5" y="8.5" width="7" height="7" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.15" />
    <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="1.6" />
    <line x1="10" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.6" />
    {/* Alignment Teeth / Matrix Ears */}
    <line x1="9" y1="2" x2="9" y2="5" stroke="currentColor" strokeWidth="1.6" />
    <line x1="15" y1="2" x2="15" y2="5" stroke="currentColor" strokeWidth="1.6" />
    <line x1="9" y1="19" x2="9" y2="22" stroke="currentColor" strokeWidth="1.6" />
    <line x1="15" y1="19" x2="15" y2="22" stroke="currentColor" strokeWidth="1.6" />
    <line x1="2" y1="9" x2="5" y2="9" stroke="currentColor" strokeWidth="1.6" />
    <line x1="2" y1="15" x2="5" y2="15" stroke="currentColor" strokeWidth="1.6" />
    <line x1="19" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1.6" />
    <line x1="19" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
