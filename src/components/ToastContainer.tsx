import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useLedger } from '../context/LedgerContext';

export function ToastContainer() {
  const { state, removeToast } = useLedger();

  if (state.toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {state.toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
          info: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-lg border border-slate-800 dark:border-slate-200 animate-slideUp"
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-0.5 leading-snug">
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-xs font-semibold underline text-indigo-400 dark:text-indigo-600 hover:text-indigo-300 dark:hover:text-indigo-500 cursor-pointer"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white dark:hover:text-slate-900 p-0.5 rounded cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
