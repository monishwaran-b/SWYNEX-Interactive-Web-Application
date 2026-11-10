export interface ProgressBarProps {
  value: number; // e.g. current spent
  max: number; // limit
  label?: string;
  showPercentage?: boolean;
  valueFormatted?: string;
  maxFormatted?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  valueFormatted,
  maxFormatted,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const rawRatio = max > 0 ? value / max : 0;

  // Determine threshold color: <75% = emerald, 75-95% = amber, >95% = rose
  let barColor = 'bg-indigo-600 dark:bg-indigo-500';
  let badgeColor = 'text-slate-600 dark:text-slate-300';

  if (rawRatio > 1.0) {
    barColor = 'bg-rose-600 dark:bg-rose-500';
    badgeColor = 'text-rose-600 dark:text-rose-400 font-semibold';
  } else if (rawRatio > 0.85) {
    barColor = 'bg-amber-500 dark:bg-amber-400';
    badgeColor = 'text-amber-600 dark:text-amber-400';
  } else {
    barColor = 'bg-emerald-600 dark:bg-emerald-500';
    badgeColor = 'text-emerald-600 dark:text-emerald-400';
  }

  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || showPercentage || valueFormatted) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
          )}
          <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
            {valueFormatted && maxFormatted ? (
              <span className="text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{valueFormatted}</span> / {maxFormatted}
              </span>
            ) : null}
            {showPercentage && <span className={badgeColor}>{percentage}%</span>}
          </div>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}
      >
        <div
          className={`${barColor} ${height} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
