import React, { useRef } from 'react';
import { Search } from 'lucide-react';

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerStyle?: React.CSSProperties;
}

export const FilterInput: React.FC<FilterInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  containerStyle,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label
      className="glass-card filter-search-card"
      style={{
        ...containerStyle,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <Search size={20} className="filter-search-icon" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="filter-search-input"
      />
    </label>
  );
};

