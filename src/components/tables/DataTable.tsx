/**
 * Generic, accessible DataTable component.
 *
 * Implements:
 * - Clean column alignment (text left, numbers right)
 * - Row hover highlights
 * - Skeleton loading state matching columns
 * - Accessible empty state with retry/action button
 * - Error state handling
 * - Optional sticky header
 */

import React from 'react';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { AppApiError } from '../../types/api';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  id?: string;
  header: string;
  accessor?: keyof T | ((row: T, index: number) => React.ReactNode);
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  error?: AppApiError | Error | null;
  onRetry?: () => void;
  keyExtractor: (item: T, index: number) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  stickyHeader?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  keyExtractor,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display matching the criteria.',
  emptyActionLabel,
  onEmptyAction,
  stickyHeader = false,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
        className
      )}
    >
      <table className="w-full text-left text-sm text-slate-700">
        <thead
          className={cn(
            'bg-slate-50/80 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200',
            stickyHeader && 'sticky top-0 z-10 backdrop-blur-xs'
          )}
        >
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.id || idx}
                scope="col"
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3 whitespace-nowrap',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, index) => {
            const key = keyExtractor(row, index);
            return (
              <motion.tr
                key={key}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2), ease: 'easeOut' }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors hover:bg-slate-50/80',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col, cIdx) => {
                  let content: React.ReactNode = null;
                  if (col.cell) {
                    content = col.cell(row, index);
                  } else if (typeof col.accessor === 'function') {
                    content = col.accessor(row, index);
                  } else if (col.accessor) {
                    content = (row[col.accessor] as unknown as React.ReactNode) ?? '—';
                  }

                  return (
                    <td
                      key={col.id || cIdx}
                      className={cn(
                        'px-4 py-3 whitespace-nowrap text-xs',
                        col.align === 'right'
                          ? 'text-right tabular-nums'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                        col.className
                      )}
                    >
                      {content}
                    </td>
                  );
                })}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
