import React from 'react';
import { IconProps } from './types';

/**
 * Acoustic Phonograph / Audio Pronunciation: Antique gramophone horn with acoustic ribbing
 */
export const IconPhonographAudio: React.FC<IconProps> = ({
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
    {/* Speaker Horn Bell */}
    <path
      d="M 2 9 L 6 9 L 12 4 L 12 20 L 6 15 L 2 15 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="miter"
      fill="var(--bg-card, #fff)"
    />
    <line x1="6" y1="9" x2="6" y2="15" stroke="currentColor" strokeWidth="1.3" />
    {/* Acoustic Sound Waves with Hatching */}
    <path d="M 15.5 8 C 17.5 9.5 17.5 14.5 15.5 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    <path d="M 18.5 5 C 22 8 22 16 18.5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    <line x1="17.5" y1="11" x2="19.5" y2="11" stroke="currentColor" strokeWidth="1.2" />
    <line x1="17.5" y1="13" x2="19.5" y2="13" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export default IconPhonographAudio;
