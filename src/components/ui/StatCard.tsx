import React from 'react';

export interface StatCardProps {
  label: string;
  value: string;
  change?: {
    value: string;
    isPositive?: boolean;
    period?: string;
  };
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  subtitle,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400 mb-2.5">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono tabular-nums">
          {value}
        </span>
      </div>

      {(change || subtitle) && (
        <div className="flex items-center gap-2 mt-2.5 text-xs">
          {change && (
            <span
              className={`font-semibold tabular-nums font-mono flex items-center gap-0.5 ${
                change.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <span>{change.isPositive ? '↑' : '↓'}</span>
              <span>{change.value}</span>
            </span>
          )}
          {change?.period && (
            <span className="text-slate-400 dark:text-slate-500">· {change.period}</span>
          )}
          {subtitle && !change && (
            <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
