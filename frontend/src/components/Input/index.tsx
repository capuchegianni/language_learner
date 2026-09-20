import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { IconMagnifierSearch, IconCloseDismiss } from '../icons';
import './Input.css';

/* ==========================================================================
   Input Interfaces
   ========================================================================== */

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'standard' | 'filter';
  label?: React.ReactNode;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  labelPosition?: 'top' | 'inline';
  error?: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  onValueChange?: (value: string) => void;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  labelPosition?: 'top' | 'inline';
  error?: React.ReactNode;
  hint?: React.ReactNode;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  onValueChange?: (value: string) => void;
}

export interface FilterInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  clearable?: boolean;
  placeholder?: string;
  className?: string;
  containerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
}

/* ==========================================================================
   Input Component
   ========================================================================== */

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'standard',
  label,
  labelProps,
  labelPosition = 'top',
  error,
  hint,
  icon,
  iconPosition = 'left',
  clearable = false,
  onClear,
  containerClassName = '',
  containerStyle,
  className = '',
  id,
  type = 'text',
  value,
  onChange,
  onValueChange,
  placeholder,
  disabled = false,
  autoFocus = false,
  size = 'md',
  style,
  ...rest
}, ref) => {
  const innerRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
    if (onValueChange) {
      onValueChange('');
    } else if (onChange) {
      // Simulate synthetic change event for clear
      const simulatedEvent = {
        target: { value: '', id, name: rest.name },
        currentTarget: { value: '', id, name: rest.name },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(simulatedEvent);
    }
    innerRef.current?.focus();
  };

  const strValue = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
  const showClear = (clearable || Boolean(onClear)) && strValue.length > 0;

  // --- Variant: Filter (Broadsheet Search Card) ---
  if (variant === 'filter') {
    const handleCardClick = (e: React.MouseEvent<HTMLLabelElement>) => {
      if (e.target !== innerRef.current) {
        innerRef.current?.focus();
      }
    };

    return (
      <label
        htmlFor={id}
        className={`filter-search-card ${containerClassName} ${className}`.trim()}
        style={{ ...containerStyle, ...style }}
        onClick={handleCardClick}
      >
        <span className="filter-search-icon" aria-hidden="true">
          {icon || <IconMagnifierSearch size={18} />}
        </span>
        <input
          id={id}
          ref={innerRef}
          type={type}
          placeholder={placeholder || 'Search...'}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
          className="filter-search-input"
          {...rest}
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="filter-clear-btn"
            aria-label="Clear search query"
            title="Clear"
          >
            <IconCloseDismiss size={14} />
          </button>
        )}
      </label>
    );
  }

  // --- Variant: Standard Form Input ---
  const inputElement = (
    <div
      className={`input-control-wrapper ${icon ? `input-has-icon-${iconPosition}` : ''} ${showClear ? 'input-has-clear' : ''}`.trim()}
    >
      {icon && iconPosition === 'left' && (
        <span className="input-icon-left">{icon}</span>
      )}
      <input
        id={id}
        ref={innerRef}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`input-field input-${size} ${className}`.trim()}
        style={style}
        {...rest}
      />
      {icon && iconPosition === 'right' && !showClear && (
        <span className="input-icon-right">{icon}</span>
      )}
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className="input-clear-btn"
          aria-label="Clear input value"
          title="Clear"
        >
          <IconCloseDismiss size={14} />
        </button>
      )}
    </div>
  );

  if (!label && !error && !hint && !containerClassName && !containerStyle) {
    return inputElement;
  }

  return (
    <div
      className={`input-container ${labelPosition === 'inline' ? 'input-container-inline' : 'input-group'} ${error ? 'has-error' : ''} ${containerClassName}`.trim()}
      style={containerStyle}
    >
      {label && (
        <label htmlFor={id} className="input-label" {...labelProps}>
          {label}
        </label>
      )}
      {inputElement}
      {error && <div className="input-error-msg">{error}</div>}
      {hint && !error && <div className="input-hint-msg">{hint}</div>}
    </div>
  );
});

Input.displayName = 'Input';

/* ==========================================================================
   Textarea Component
   ========================================================================== */

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  labelProps,
  labelPosition = 'top',
  error,
  hint,
  containerClassName = '',
  containerStyle,
  className = '',
  id,
  value,
  onChange,
  onValueChange,
  placeholder,
  disabled = false,
  rows = 4,
  style,
  ...rest
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const textareaElement = (
    <textarea
      id={id}
      ref={ref}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`textarea-field ${className}`.trim()}
      style={style}
      {...rest}
    />
  );

  if (!label && !error && !hint && !containerClassName && !containerStyle) {
    return textareaElement;
  }

  return (
    <div
      className={`input-container ${labelPosition === 'inline' ? 'input-container-inline' : 'input-group'} ${error ? 'has-error' : ''} ${containerClassName}`.trim()}
      style={containerStyle}
    >
      {label && (
        <label htmlFor={id} className="input-label" {...labelProps}>
          {label}
        </label>
      )}
      {textareaElement}
      {error && <div className="input-error-msg">{error}</div>}
      {hint && !error && <div className="input-hint-msg">{hint}</div>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

/* ==========================================================================
   FilterInput Compatibility Wrapper
   ========================================================================== */

export const FilterInput = forwardRef<HTMLInputElement, FilterInputProps>(({
  onChange,
  onClear,
  ...rest
}, ref) => {
  return (
    <Input
      ref={ref}
      variant="filter"
      onValueChange={onChange}
      onChange={(e) => onChange(e.target.value)}
      onClear={onClear}
      {...rest}
    />
  );
});

FilterInput.displayName = 'FilterInput';

export default Input;
