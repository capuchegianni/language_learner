import React from 'react';
import './IconButton.css';

export type IconButtonVariant =
  | 'default'
  | 'edit'
  | 'delete'
  | 'audio'
  | 'note'
  | 'primary'
  | 'secondary'
  | 'danger';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  size?: number | string;
  iconSize?: number;
  variant?: IconButtonVariant;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 34,
  iconSize = 14,
  variant = 'default',
  active = false,
  className = '',
  style,
  children,
  type = 'button',
  ...rest
}) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  const variantClass = variant !== 'default' ? `icon-btn-${variant}` : '';
  const activeClass = active ? 'active' : '';

  const combinedClassName = [
    'icon-btn',
    variantClass,
    activeClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const targetIcon = icon || children;

  const renderIcon = () => {
    if (!targetIcon) return null;

    if (React.isValidElement(targetIcon)) {
      const childProps = targetIcon.props as { size?: number };
      return React.cloneElement(targetIcon as React.ReactElement<{ size?: number }>, {
        size: childProps.size ?? iconSize,
      });
    }

    return targetIcon;
  };

  return (
    <button
      type={type}
      className={combinedClassName}
      style={{
        width: sizeValue,
        height: sizeValue,
        minWidth: sizeValue,
        minHeight: sizeValue,
        maxWidth: sizeValue,
        maxHeight: sizeValue,
        ...style,
      }}
      {...rest}
    >
      {renderIcon()}
    </button>
  );
};

export default IconButton;
