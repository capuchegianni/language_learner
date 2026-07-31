import React from 'react';
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
  return (
    <div
      className="glass-card"
      style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        ...containerStyle,
      }}
    >
      <Search size={20} color="var(--text-secondary)" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          outline: 'none',
          width: '100%',
          fontSize: '1rem',
        }}
      />
    </div>
  );
};
