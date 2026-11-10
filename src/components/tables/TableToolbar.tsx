/**
 * TableToolbar component with search input and actions.
 */

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

export interface TableToolbarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  actions,
  children,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4">
      <div className="flex-1 flex flex-wrap items-center gap-2 max-w-lg">
        {onSearchChange && (
          <div className="w-full sm:w-72">
            <Input
              value={searchQuery ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        )}
        {children}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
