import React from 'react';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badgeCount?: number;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: SegmentedControlProps<T>) {
  const sizeStyles = {
    sm: 'p-0.5 text-xs gap-0.5',
    md: 'p-1 text-xs sm:text-sm gap-1',
  };

  const buttonPadding = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 ${sizeStyles[size]} ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-1.5 rounded-md font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
              buttonPadding[size]
            } ${
              isSelected
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-slate-100 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badgeCount !== undefined && (
              <span
                className={`ml-1 text-[11px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected
                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {option.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
