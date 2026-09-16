import React from 'react';
import { IconProps } from './types';

/**
 * Download / Export Gazette: Engraved downward arrow rolling off printing press cylinder
 */
export const IconDownloadPress: React.FC<IconProps> = ({
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
    {/* Base Output Bed */}
    <path d="M 4 17 L 4 21 L 20 21 L 20 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    {/* Downward Dispatch Vector */}
    <path d="M 12 3 L 12 15 M 6 9 L 12 15 L 18 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
    <line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
  </svg>
);
