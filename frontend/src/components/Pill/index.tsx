import React from 'react';
import './Pill.css';

export type PillVariant = 'primary' | 'success' | 'warning' | 'danger';

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
  isStamp?: boolean;
  stampTilt?: 'left' | 'right' | 'none';
  heavyBorder?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Pill: React.FC<PillProps> = ({
  variant = 'primary',
  isStamp = false,
  stampTilt = isStamp ? 'left' : 'none',
  heavyBorder = false,
  children,
  className = '',
  ...props
}) => {
  const stampClasses = [
    isStamp ? 'pill-stamp' : '',
    stampTilt === 'right' ? 'pill-stamp-tilt-right' : '',
    stampTilt === 'none' && isStamp ? 'transform-none' : '',
    heavyBorder ? 'pill-stamp-heavy' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={`pill pill-${variant} ${stampClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

export default Pill;
