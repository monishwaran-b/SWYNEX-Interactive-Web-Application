import { TextareaHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  currentLength?: number;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      currentLength,
      id,
      className = '',
      containerClassName = '',
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasError = Boolean(error);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <label htmlFor={textareaId}>
              {label}
              {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            {maxLength !== undefined && currentLength !== undefined && (
              <span className="text-xs font-normal text-slate-400 font-mono">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError}
          rows={3}
          className={`w-full px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-lg border transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed resize-y ${
            hasError
              ? 'border-rose-400 dark:border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-600 focus:ring-indigo-500/20'
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
