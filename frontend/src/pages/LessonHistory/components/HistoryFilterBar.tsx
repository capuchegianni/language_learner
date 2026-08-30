import React from 'react';
import { FilterBar, FilterInput, FilterSelect } from '../../../components';

export interface HistoryFilterBarProps {
  search: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'GENERATED', label: 'Generated' },
  { value: 'GRADED', label: 'Graded' },
  { value: 'SUBMITTED', label: 'Submitted' },
];

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
}) => {
  return (
    <FilterBar id="tutorial-history-filter">
      <FilterInput
        id="history-search-input"
        value={search}
        onChange={onSearchChange}
        placeholder="Search lessons by rule title..."
      />
      <FilterSelect
        id="history-status-filter"
        label="Status:"
        value={filterStatus}
        onChange={onFilterStatusChange}
        options={STATUS_OPTIONS}
        allLabel="All Lessons"
      />
    </FilterBar>
  );
};
