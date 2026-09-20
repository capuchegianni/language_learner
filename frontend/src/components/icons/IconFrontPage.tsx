import React from 'react';
import { IconProps } from './types';

/**
 * Front Page / Dashboard: Stack of folded broadsheets with engraved columns & masthead
 */
export const IconFrontPage: React.FC<IconProps> = ({
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
    {/* Back sheet */}
    <path d="M 5 2 L 21 2 L 21 18 L 18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    {/* Main newspaper front fold */}
    <rect x="2" y="5" width="16" height="17" stroke="currentColor" strokeWidth="1.8" fill="var(--bg-card, #fff)" />
    {/* Masthead banner box */}
    <rect x="4" y="7" width="12" height="3" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
    <line x1="6" y1="8.5" x2="14" y2="8.5" stroke="currentColor" strokeWidth="1.4" />
    {/* Headline block */}
    <line x1="4" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.6" />
    {/* Multi-column hatched text lines */}
    <line x1="4" y1="14.5" x2="9" y2="14.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="4" y1="16.5" x2="9" y2="16.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="4" y1="18.5" x2="8" y2="18.5" stroke="currentColor" strokeWidth="1.1" />
    {/* Column separator */}
    <line x1="10" y1="13.5" x2="10" y2="20" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1 1" />
    {/* Right column */}
    <line x1="11.5" y1="14.5" x2="16" y2="14.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="11.5" y1="16.5" x2="16" y2="16.5" stroke="currentColor" strokeWidth="1.1" />
    <line x1="11.5" y1="18.5" x2="15" y2="18.5" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);

export default IconFrontPage;
