/**
 * Accessible FormErrorSummary component.
 *
 * Renders a page-level error banner after failed validation or API submission,
 * listing errors and allowing keyboard click to focus the invalid input.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FormErrorSummaryProps {
  title?: string;
  rootError?: string | null;
  fieldErrors?: Record<string, { message?: string } | undefined>;
  className?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  title = 'Please resolve the following errors:',
  rootError,
  fieldErrors,
  className,
}) => {
  const errorEntries = Object.entries(fieldErrors || {}).filter(
    ([, error]) => error && error.message
  );

  if (!rootError && errorEntries.length === 0) {
    return null;
  }

  const focusField = (fieldName: string) => {
    const el = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    if (el && 'focus' in el) {
      (el as HTMLElement).focus();
    }
  };

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-950 mb-6',
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <div className="font-semibold text-rose-900">{title}</div>
          {rootError && <p className="text-rose-800">{rootError}</p>}
          {errorEntries.length > 0 && (
            <ul className="list-disc list-inside space-y-0.5 pt-1 text-rose-700">
              {errorEntries.map(([field, error]) => (
                <li key={field}>
                  <button
                    type="button"
                    onClick={() => focusField(field)}
                    className="underline hover:text-rose-950 font-medium text-left cursor-pointer"
                  >
                    {error?.message}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
