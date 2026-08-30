import React from 'react';
import './Pill.css';

export type PillVariant = 'primary' | 'success' | 'warning';

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
  children: React.ReactNode;
  className?: string;
}

export const Pill: React.FC<PillProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  return (
    <span className={`pill pill-${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
};

export default Pill;
