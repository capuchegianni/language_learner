import React from 'react';
import { IconProps } from './types';

/**
 * Skeleton Key: Engraved antique brass lock key with ornate bow & ward teeth
 */
export const IconKeySkeleton: React.FC<IconProps> = ({
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
    {/* Key Bow Head */}
    <circle cx="7.5" cy="15.5" r="4.5" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    <circle cx="7.5" cy="15.5" r="2" stroke="currentColor" strokeWidth="1.2" />
    {/* Key Stem Shaft */}
    <line x1="11" y1="12" x2="21" y2="2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    {/* Ward Bits / Teeth */}
    <line x1="18" y1="5" x2="21" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    <line x1="15" y1="8" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
  </svg>
);
