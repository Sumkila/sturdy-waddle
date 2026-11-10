/**
 * Accessible FormField wrapper.
 *
 * Connects input labels, required markers, helper descriptions,
 * and error messages with ARIA semantics.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  required = false,
  error,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-xs font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      </div>

      {children}

      {description && !error && (
        <p id={`${name}-desc`} className="text-[11px] text-slate-500">
          {description}
        </p>
      )}

      {error && (
        <p id={`${name}-error`} role="alert" className="text-[11px] text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
