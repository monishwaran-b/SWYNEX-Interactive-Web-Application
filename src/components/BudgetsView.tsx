import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { TransactionCategory } from '../types';
import { formatCurrency, getCategoryColor } from '../utils/formatters';
import { Card, CardHeader } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Edit3, AlertTriangle, CheckCircle2, TrendingUp, Sliders } from 'lucide-react';

export function BudgetsView() {
  const { state, updateBudget } = useLedger();

  const [editingBudget, setEditingBudget] = useState<{
    category: TransactionCategory;
    currentLimit: number;
    newLimit: string;
  } | null>(null);

  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEdit = (category: TransactionCategory, currentLimit: number) => {
    setEditingBudget({
      category,
      currentLimit,
      newLimit: currentLimit.toString(),
    });
    setEditError(null);
  };

  const handleSaveBudget = () => {
    if (!editingBudget) return;
    const num = Number(editingBudget.newLimit);
    if (isNaN(num) || num <= 0) {
      setEditError('Please enter a valid monthly budget limit greater than 0');
      return;
    }
    if (num > 500000) {
      setEditError('Budget limit cannot exceed 500,000');
      return;
    }

    updateBudget(editingBudget.category, Math.round(num));
    setEditingBudget(null);
  };

  // Compute spend for each budget
  const budgetStats = state.budgets.map((b) => {
    const spent = state.transactions
      .filter((tx) => tx.type === 'expense' && tx.category === b.category)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const remaining = Math.max(0, b.monthlyLimit - spent);
    const ratio = b.monthlyLimit > 0 ? spent / b.monthlyLimit : 0;
    const isOver = spent > b.monthlyLimit;
    const isWarning = !isOver && ratio >= 0.85;

    return {
      ...b,
      spent,
      remaining,
      ratio,
      isOver,
      isWarning,
    };
  });

  const totalLimit = budgetStats.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgetStats.reduce((sum, b) => sum + b.spent, 0);
  const overCount = budgetStats.filter((b) => b.isOver).length;
  const warningCount = budgetStats.filter((b) => b.isWarning).length;

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Monthly Budget Cap
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(totalLimit, state.currency)}
          </span>
          <p className="text-xs text-slate-400 mt-2">Combined target across all active categories</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Current Spend
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(totalSpent, state.currency)}
          </span>
          <p className="text-xs text-slate-400 mt-2">
            {totalLimit > 0 ? `${Math.round((totalSpent / totalLimit) * 100)}% of monthly budget utilized` : ''}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Budget Status Alerts
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                overCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {overCount} Over Limit
            </span>
            <span className="text-slate-400 text-sm">·</span>
            <span className="text-sm font-mono text-amber-600 dark:text-amber-400">
              {warningCount} Warning
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Categories requiring immediate review</p>
        </Card>
      </div>

      {/* Category Budgets Grid */}
      <Card>
        <CardHeader
          title="Category Budget Limits"
          subtitle="Set monthly spending thresholds per category with instant over-budget alerts"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStats.map((item) => {
            const catColors = getCategoryColor(item.category);

            return (
              <div
                key={item.category}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${catColors.bg}`}>
                      {item.category}
                    </span>
                    <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-mono">
                      Remaining: {formatCurrency(item.remaining, state.currency)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.isOver ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" /> Over
                      </span>
                    ) : item.isWarning ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" /> Near Limit
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> On Track
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item.category, item.monthlyLimit)}
                      title="Adjust limit"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <ProgressBar
                  value={item.spent}
                  max={item.monthlyLimit}
                  valueFormatted={formatCurrency(item.spent, state.currency)}
                  maxFormatted={formatCurrency(item.monthlyLimit, state.currency)}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Edit Budget Limit Modal */}
      {editingBudget && (
        <Modal
          isOpen={Boolean(editingBudget)}
          onClose={() => setEditingBudget(null)}
          title={`Adjust Monthly Budget: ${editingBudget.category}`}
          subtitle="Set the planned monthly spending threshold"
          maxWidth="sm"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditingBudget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveBudget}>
                Save Budget
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="New Monthly Target"
              required
              type="number"
              min="1"
              step="10"
              prefixElement={<span className="font-semibold text-slate-500">{state.currency.symbol}</span>}
              value={editingBudget.newLimit}
              onChange={(e) => {
                setEditingBudget({ ...editingBudget, newLimit: e.target.value });
                setEditError(null);
              }}
              error={editError || undefined}
              helperText={`Previous limit was ${state.currency.symbol}${editingBudget.currentLimit.toLocaleString()}`}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
