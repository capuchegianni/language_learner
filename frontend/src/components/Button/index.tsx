import React, { forwardRef } from 'react';
import './Button.css';

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'edit'
  | 'delete'
  | 'audio'
  | 'note';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  active?: boolean;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  iconSize,
  isIconOnly = false,
  fullWidth = false,
  active = false,
  isLoading = false,
  className = '',
  style,
  children,
  type = 'button',
  disabled,
  ...rest
}, ref) => {
  // Determine if it's strictly an icon-only button
  const isSquareIconOnly = isIconOnly || Boolean(icon && !children);

  const sizeClass = size ? `btn-size-${size}` : '';
  const variantClass = variant !== 'default' ? `btn-${variant}` : '';
  const iconOnlyClass = isSquareIconOnly ? 'btn-icon-only icon-btn' : '';
  const fullWidthClass = fullWidth ? 'btn-full-width' : '';
  const activeClass = active ? 'active' : '';
  const loadingClass = isLoading ? 'loading' : '';

  const combinedClassName = [
    'btn',
    variantClass,
    sizeClass,
    iconOnlyClass,
    fullWidthClass,
    activeClass,
    loadingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Compute icon size
  const defaultIconSize = isSquareIconOnly
    ? (size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : 16)
    : (size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : 16);

  const resolvedIconSize = iconSize ?? defaultIconSize;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      const childProps = icon.props as { size?: number; strokeWidth?: number };
      return (
        <span className="btn-icon">
          {React.cloneElement(icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, {
            size: childProps.size ?? resolvedIconSize,
            strokeWidth: childProps.strokeWidth ?? 2.2,
          })}
        </span>
      );
    }
    return <span className="btn-icon">{icon}</span>;
  };

  return (
    <button
      ref={ref}
      type={type}
      className={combinedClassName}
      disabled={disabled || isLoading}
      style={style}
      {...rest}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
});

Button.displayName = 'Button';

export type IconButtonVariant = ButtonVariant;
export type IconButtonProps = ButtonProps;

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(({
  size = 'md',
  iconSize = 16,
  isIconOnly = true,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      size={size}
      iconSize={iconSize}
      isIconOnly={isIconOnly}
      {...props}
    />
  );
});

IconButton.displayName = 'IconButton';

export default Button;
