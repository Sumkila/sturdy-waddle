/**
 * Accessible Error State display component with retry affordance.
 */

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { AppApiError } from '../../types/api';

export interface ErrorStateProps {
  error?: AppApiError | Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = 'Failed to load data',
  message,
  onRetry,
  className,
}) => {
  const displayMessage =
    message ||
    (error && 'message' in error ? error.message : 'An error occurred while communicating with the server.');

  const isNetwork =
    (error && 'code' in error && error.code === 'NETWORK_ERROR') ||
    (error && 'status' in error && error.status === 0);

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-rose-200/80 bg-rose-50/40',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-950 tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-rose-800 max-w-md">{displayMessage}</p>

      {isNetwork && (
        <p className="mt-2 text-[11px] text-slate-500 font-mono bg-white px-2.5 py-1 rounded border border-slate-200">
          Target: http://localhost:8080 (Check backend status or CORS)
        </p>
      )}

      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
