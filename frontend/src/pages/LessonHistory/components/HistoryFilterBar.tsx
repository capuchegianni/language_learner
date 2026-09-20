import React from 'react';
import { FilterBar, Input, Select } from '../../../components';

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
      <Input
        variant="filter"
        id="history-search-input"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        clearable
        onClear={() => onSearchChange('')}
        placeholder="Search lessons by rule title..."
      />
      <Select
        variant="filter"
        id="history-status-filter"
        label="Status:"
        value={filterStatus}
        onChange={(e) => onFilterStatusChange(e.target.value)}
        options={STATUS_OPTIONS}
        allLabel="All Lessons"
      />
    </FilterBar>
  );
};
