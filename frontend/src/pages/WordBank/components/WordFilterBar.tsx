import React from 'react';
import { FilterBar, FilterInput, FilterSelect } from '../../../components';

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
      <FilterInput
        id="wordbank-search-input"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search vocabulary, meaning, or pronunciation..."
      />
      <FilterSelect
        id="wordbank-category-filter"
        label="Category:"
        value={selectedCategory}
        onChange={onCategoryChange}
        options={categories}
        allLabel="All Categories"
      />
    </FilterBar>
  );
};
