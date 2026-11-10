import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, getCategoryColor, getPaymentMethodLabel } from '../utils/formatters';
import { Card, CardHeader } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import {
  PieChart,
  CreditCard,
  TrendingDown,
  RotateCcw,
  Trash2,
  Award,
  Wallet,
} from 'lucide-react';

export function AnalyticsView() {
  const {
    state,
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    categoryBreakdown,
    resetToDemoData,
    clearAllTransactions,
  } = useLedger();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Compute payment method breakdown
  const paymentMethodMap = new Map<string, { amount: number; count: number }>();
  for (const tx of state.transactions) {
    const cur = paymentMethodMap.get(tx.paymentMethod) || { amount: 0, count: 0 };
    paymentMethodMap.set(tx.paymentMethod, {
      amount: cur.amount + tx.amount,
      count: cur.count + 1,
    });
  }

  const paymentBreakdown = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
    method,
    amount: data.amount,
    count: data.count,
    percentage:
      totalExpense + totalIncome > 0
        ? Math.round((data.amount / (totalExpense + totalIncome)) * 100)
        : 0,
  }));

  // Highest 3 individual expenses
  const topExpenses = [...state.transactions]
    .filter((tx) => tx.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Ratio Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Ledger Inflow
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(totalIncome, state.currency)}
          </span>
          <p className="text-xs text-slate-400 mt-2">All salaries, retainers &amp; credits</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Ledger Outflow
          </span>
          <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            {formatCurrency(totalExpense, state.currency)}
          </span>
          <p className="text-xs text-slate-400 mt-2">All recorded debits &amp; purchases</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Net Surplus (Savings)
          </span>
          <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
            {formatCurrency(netBalance, state.currency)}
          </span>
          <p className="text-xs text-slate-400 mt-2">{savingsRate}% retention efficiency</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Transaction Velocity
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {state.transactions.length}
          </span>
          <p className="text-xs text-slate-400 mt-2">Total verified financial events</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Distribution */}
        <Card>
          <CardHeader
            title="Spending Distribution by Category"
            subtitle="Categorical breakdown of all expense transactions"
          />

          {categoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No expense records to analyze.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((item) => {
                const style = getCategoryColor(item.category);

                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-xs ${style.dot}`} />
                        <span>{item.category}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          ({item.count} items)
                        </span>
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.amount, state.currency)}{' '}
                        <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                      </span>
                    </div>

                    <ProgressBar
                      value={item.amount}
                      max={totalExpense}
                      showPercentage={false}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Payment Channels & Largest Outlays */}
        <div className="space-y-6">
          {/* Payment Method Distribution */}
          <Card>
            <CardHeader
              title="Payment Channel Distribution"
              subtitle="Breakdown of volume across payment rails"
            />
            <div className="space-y-3">
              {paymentBreakdown.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{getPaymentMethodLabel(item.method)}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({item.count})</span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.amount, state.currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Single Outlays */}
          <Card>
            <CardHeader
              title="Largest Single Expenses"
              subtitle="Top individual debits recorded"
            />
            <div className="space-y-2.5 text-xs">
              {topExpenses.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-center font-mono text-slate-400 font-medium">
                      0{idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{tx.title}</p>
                      <p className="text-[11px] text-slate-400">{tx.category} · {tx.date}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(tx.amount, state.currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Ledger Administration & Database Maintenance */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Database Maintenance &amp; Reset
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Reset your ledger state back to realistic sample demo data, or clear all entries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Reset to Demo Data
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => {
          resetToDemoData();
          setShowResetDialog(false);
        }}
        variant="primary"
        title="Reset Ledger to Demo Records"
        message="This will replace current transactions with the default set of sample income and expense records. Proceed?"
        confirmLabel="Reset to Demo"
      />

      {/* Clear All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={() => {
          clearAllTransactions();
          setShowClearDialog(false);
        }}
        variant="danger"
        title="Clear All Transactions"
        message="Are you sure you want to erase all transactions from your browser storage? This cannot be undone."
        confirmLabel="Clear All Data"
      />
    </div>
  );
}
