/**
 * Accessible FormSection component for grouping related inputs.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <section className={cn('space-y-4 pt-4 first:pt-0', className)}>
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
};
