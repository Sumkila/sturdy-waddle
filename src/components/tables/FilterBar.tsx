/**
 * Accessible FilterBar for faceted table queries.
 */

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  onReset?: () => void;
  hasActiveFilters?: boolean;
  children: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onReset,
  hasActiveFilters,
  children,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl mb-4 text-xs">
      <div className="flex items-center gap-1.5 text-slate-500 font-medium mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span>Filters:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-1">{children}</div>

      {hasActiveFilters && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs h-8 text-slate-500 hover:text-slate-900"
          leftIcon={<RotateCcw className="w-3 h-3" />}
        >
          Reset
        </Button>
      )}
    </div>
  );
};
