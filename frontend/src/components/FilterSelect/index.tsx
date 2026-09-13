import React, { useRef } from 'react';
import './FilterSelect.css';

export interface FilterSelectOption {
  value: string | number;
  label: string;
}

export interface FilterSelectProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<FilterSelectOption | string>;
  allLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  allLabel,
  className = '',
  style,
  disabled = false,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleCardClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (e.target !== selectRef.current) {
      try {
        selectRef.current?.showPicker?.();
      } catch {
        // Fallback if showPicker is unsupported
      }
      selectRef.current?.focus();
    }
  };

  const normalizedOptions: FilterSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  );

  return (
    <label
      htmlFor={id}
      className={`glass-card filter-select-card ${className}`.trim()}
      style={style}
      onClick={handleCardClick}
    >
      <span className="filter-select-label">{label}</span>
      <select
        id={id}
        ref={selectRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="filter-select-input"
        onClick={(e) => e.stopPropagation()}
      >
        {allLabel && <option value="">{allLabel}</option>}
        {normalizedOptions.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default FilterSelect;
