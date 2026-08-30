import React from 'react';
import './FilterBar.css';

export interface FilterBarProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  id,
  className = '',
  style,
}) => {
  return (
    <div id={id} className={`filter-bar ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

export default FilterBar;
