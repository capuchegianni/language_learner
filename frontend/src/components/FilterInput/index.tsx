import React, { useRef } from 'react';
import { Search } from 'lucide-react';
import './FilterInput.css';

export interface FilterInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  containerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
}

export const FilterInput: React.FC<FilterInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  containerStyle,
  style,
  disabled = false,
  autoFocus = false,
  onKeyDown,
  'aria-label': ariaLabel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (e.target !== inputRef.current) {
      inputRef.current?.focus();
    }
  };

  return (
    <label
      htmlFor={id}
      className={`glass-card filter-search-card ${className}`.trim()}
      style={{ ...containerStyle, ...style }}
      onClick={handleClick}
    >
      <Search size={20} className="filter-search-icon" aria-hidden="true" />
      <input
        id={id}
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel || placeholder}
        className="filter-search-input"
      />
    </label>
  );
};

export default FilterInput;
