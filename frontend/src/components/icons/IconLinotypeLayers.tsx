import React from 'react';
import { IconProps } from './types';

/**
 * Stacked Type Plates / Layers: Isometric linotype plate trays
 */
export const IconLinotypeLayers: React.FC<IconProps> = ({
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
    {/* Top Plate */}
    <polygon points="12,2 22,7 12,12 2,7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="miter" fill="var(--bg-card, #fff)" />
    {/* Middle Plate */}
    <path d="M 2 12 L 12 17 L 22 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
    {/* Bottom Plate */}
    <path d="M 2 17 L 12 22 L 22 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
  </svg>
);
