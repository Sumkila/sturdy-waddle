/**
 * StatCard component with smooth interactive hover states.
 */

import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card padding="md" className={cn('relative overflow-hidden h-full transition-shadow hover:shadow-md', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
            <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {value}
            </div>
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0 transition-colors group-hover:bg-sky-50 group-hover:text-sky-600">
              {icon}
            </div>
          )}
        </div>

        {(subtext || trend) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            {trend && (
              <span
                className={cn(
                  'font-medium tabular-nums',
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {trend.value}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
