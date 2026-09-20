import React, { forwardRef } from 'react';
import './Card.css';

export type CardVariant = 'default' | 'alt' | 'framed' | 'pressed' | 'danger';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<React.AllHTMLAttributes<HTMLElement>, 'as'> {
  variant?: CardVariant;
  padding?: CardPadding;
  isInteractive?: boolean;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const Card = forwardRef<HTMLElement, CardProps>(({
  variant = 'default',
  padding,
  isInteractive = false,
  children,
  className = '',
  as: Component = 'div',
  ...rest
}, ref) => {
  const variantClass = variant !== 'default' ? `card-${variant}` : '';
  const paddingClass = padding ? `card-padding-${padding}` : '';
  const interactiveClass = isInteractive ? 'card-interactive' : '';

  const combinedClassName = [
    'card',
    variantClass,
    paddingClass,
    interactiveClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      ref={ref}
      className={combinedClassName}
      {...rest}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export default Card;
