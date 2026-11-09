import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import './Select.css';

/* ==========================================================================
   Select Interfaces
   ========================================================================== */

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'standard' | 'filter';
  label?: React.ReactNode;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  labelPosition?: 'top' | 'inline';
  options?: Array<SelectOption | string | number>;
  allLabel?: string;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  onValueChange?: (value: string) => void;
  inline?: boolean;
}

export interface FilterSelectProps {
  id?: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<SelectOption | string | number>;
  allLabel?: string;
  className?: string;
  containerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  disabled?: boolean;
}

/* ==========================================================================
   Select Component
   ========================================================================== */

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  variant = 'standard',
  label,
  labelProps,
  labelPosition = 'top',
  options,
  allLabel,
  error,
  hint,
  containerClassName = '',
  containerStyle,
  className = '',
  id,
  value,
  onChange,
  onValueChange,
  disabled = false,
  size = 'md',
  inline = false,
  children,
  style,
  ...rest
}, ref) => {
  const innerRef = useRef<HTMLSelectElement>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLSelectElement);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const normalizedOptions: SelectOption[] | undefined = options?.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  const renderedOptions = (
    <>
      {allLabel && <option value="">{allLabel}</option>}
      {normalizedOptions?.map((opt) => (
        <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
      {children}
    </>
  );

  // --- Variant: Filter (Compact Card with Inline Label) ---
  if (variant === 'filter') {
    const handleCardClick = (e: React.MouseEvent<HTMLLabelElement>) => {
      if (e.target !== innerRef.current) {
        try {
          innerRef.current?.showPicker?.();
        } catch {
          // Fallback if showPicker is unsupported
        }
        innerRef.current?.focus();
      }
    };

    return (
      <label
        htmlFor={id}
        className={`filter-select-card ${containerClassName} ${className}`.trim()}
        style={{ ...containerStyle, ...style }}
        onClick={handleCardClick}
      >
        {label && <span className="filter-select-label">{label}</span>}
        <select
          id={id}
          ref={innerRef}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="filter-select-input"
          onClick={(e) => e.stopPropagation()}
          {...rest}
        >
          {renderedOptions}
        </select>
      </label>
    );
  }

  // --- Variant: Standard Select ---
  const isInline = inline || className.includes('select-inline') || className.includes('inline') || className.includes('contrast-select');
  const selectElement = (
    <select
      id={id}
      ref={innerRef}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={['select-field', isInline ? 'select-inline' : '', `select-${size}`, className].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      {renderedOptions}
    </select>
  );

  if (isInline) {
    if (!label && !error && !hint && !containerClassName && !containerStyle) {
      return selectElement;
    }
    return (
      <span
        className={`select-container select-inline-container ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${containerClassName}`.trim()}
        style={containerStyle}
      >
        {label && (
          <label htmlFor={id} className="select-label select-inline-label" {...labelProps}>
            {label}
          </label>
        )}
        {selectElement}
        {error && <span className="select-error-msg select-inline-error">{error}</span>}
        {hint && !error && <span className="select-hint-msg select-inline-hint">{hint}</span>}
      </span>
    );
  }

  return (
    <div
      className={`select-container ${labelPosition === 'inline' ? 'select-container-inline' : ''} ${error ? 'has-error' : ''} ${containerClassName}`.trim()}
      style={containerStyle}
    >
      {label && (
        <label htmlFor={id} className="select-label" {...labelProps}>
          {label}
        </label>
      )}
      {selectElement}
      {error && <div className="select-error-msg">{error}</div>}
      {hint && !error && <div className="select-hint-msg">{hint}</div>}
    </div>
  );
});

Select.displayName = 'Select';

/* ==========================================================================
   FilterSelect Compatibility Wrapper
   ========================================================================== */

export const FilterSelect: React.FC<FilterSelectProps> = ({
  onChange,
  ...rest
}) => {
  return (
    <Select
      variant="filter"
      onValueChange={onChange}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
};

FilterSelect.displayName = 'FilterSelect';

export default Select;
