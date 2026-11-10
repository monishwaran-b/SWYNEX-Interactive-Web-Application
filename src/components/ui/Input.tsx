import React, { InputHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixElement,
      suffixElement,
      id,
      className = '',
      containerClassName = '',
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const hasError = Boolean(error);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-rose-500 ml-0.5">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {prefixElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 text-sm">
              {prefixElement}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError && inputId ? `${inputId}-error` : undefined}
            className={`w-full px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-lg border transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
              prefixElement ? 'pl-8' : ''
            } ${suffixElement ? 'pr-9' : ''} ${
              hasError
                ? 'border-rose-400 dark:border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-600 focus:ring-indigo-500/20'
            } ${className}`}
            {...props}
          />

          {suffixElement && (
            <div className="absolute right-3 flex items-center text-slate-400 dark:text-slate-500 text-sm">
              {suffixElement}
            </div>
          )}
        </div>

        {error ? (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5 animate-fadeIn"
          >
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

Input.displayName = 'Input';
