import React from 'react';
import { FilterBar, Input, Select } from '../../../components';

export interface WordFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export const WordFilterBar: React.FC<WordFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  return (
    <FilterBar id="tutorial-wordbank-filter">
      <Input
        variant="filter"
        id="wordbank-search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        clearable
        onClear={() => onSearchChange('')}
        placeholder="Search vocabulary, meaning, or pronunciation..."
      />
      <Select
        variant="filter"
        id="wordbank-category-filter"
        label="Category:"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        options={categories}
        allLabel="All Categories"
      />
    </FilterBar>
  );
};
