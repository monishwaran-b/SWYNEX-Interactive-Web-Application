import React from 'react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, formatRelativeDate, getCategoryColor, getPaymentMethodLabel } from '../utils/formatters';
import { StatCard } from './ui/StatCard';
import { Card, CardHeader } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  Download,
  Copy,
  Trash2,
  Edit2,
  Paperclip,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Transaction } from '../types';

export interface DashboardViewProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateToTab: (tab: 'overview' | 'transactions' | 'budgets' | 'analytics') => void;
  onOpenRepoModal: () => void;
}

export function DashboardView({
  onOpenAddModal,
  onEditTransaction,
  onNavigateToTab,
  onOpenRepoModal,
}: DashboardViewProps) {
  const {
    state,
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    recentTransactions,
    deleteTransaction,
    duplicateTransaction,
    exportCSV,
    exportJSON,
  } = useLedger();

  // Calculate monthly spent vs monthly limit across budgets
  const totalBudgetLimit = state.budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudgetSpent = state.transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      {/* GitHub Repo Submission Prompt Banner if not verified */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xs border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 uppercase tracking-wider">
              Project Submission
            </span>
            {state.submission ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Repository Configured & Verified
              </span>
            ) : (
              <span className="text-xs text-amber-300 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> GitHub Repository Submission Ready
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold tracking-tight">
            FlowLedger Expense &amp; Financial Studio
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Built with reusable components, robust real-time form validation, persistent state management, budget limit alerts, and repository URL verification.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenRepoModal}
            className="text-xs font-semibold"
          >
            {state.submission ? 'View Repo Submission' : 'Submit GitHub URL'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Top Financial KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Balance"
          value={formatCurrency(netBalance, state.currency)}
          change={{
            value: savingsRate > 0 ? `${savingsRate}% savings` : '0%',
            isPositive: netBalance >= 0,
            period: 'Overall',
          }}
          icon={<Wallet className="w-4 h-4 text-indigo-600" />}
        />

        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome, state.currency)}
          subtitle={`${state.transactions.filter((tx) => tx.type === 'income').length} income records`}
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
        />

        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpense, state.currency)}
          subtitle={`${state.transactions.filter((tx) => tx.type === 'expense').length} expense entries`}
          icon={<TrendingDown className="w-4 h-4 text-rose-600" />}
        />

        <StatCard
          label="Savings Rate"
          value={`${savingsRate}%`}
          change={{
            value: savingsRate >= 20 ? 'Target achieved' : 'Below 20% target',
            isPositive: savingsRate >= 20,
            period: 'Net margin',
          }}
          icon={<PiggyBank className="w-4 h-4 text-purple-600" />}
        />
      </div>

      {/* Two-Column Middle Section: Budget Health & Cash Flow Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Budget Allocation & Thresholds */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Monthly Budget Progress"
              subtitle="Spending utilization against planned monthly category limits"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateToTab('budgets')}
                  rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Manage Budgets
                </Button>
              }
            />

            {/* Overall aggregate budget progress */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-5 space-y-2">
              <ProgressBar
                value={totalBudgetSpent}
                max={totalBudgetLimit}
                label="Overall Budget Utilization"
                valueFormatted={formatCurrency(totalBudgetSpent, state.currency)}
                maxFormatted={formatCurrency(totalBudgetLimit, state.currency)}
              />
            </div>

            {/* Top 4 Active Category Budgets */}
            <div className="space-y-4">
              {state.budgets.slice(0, 4).map((budget) => {
                const spent = state.transactions
                  .filter((tx) => tx.type === 'expense' && tx.category === budget.category)
                  .reduce((sum, tx) => sum + tx.amount, 0);

                return (
                  <ProgressBar
                    key={budget.category}
                    label={budget.category}
                    value={spent}
                    max={budget.monthlyLimit}
                    valueFormatted={formatCurrency(spent, state.currency)}
                    maxFormatted={formatCurrency(budget.monthlyLimit, state.currency)}
                  />
                );
              })}
            </div>
          </Card>

          {/* Quick Actions & Export Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportJSON}
                leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
              >
                Backup JSON
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{state.transactions.length} total entries</span>
              <span>·</span>
              <button
                onClick={() => onNavigateToTab('transactions')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                View Full Ledger →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Cash Flow Velocity & Top Spending */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Cash Flow Summary"
              subtitle="Current ledger financial ratio"
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total Credits (Inflow)</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCurrency(totalIncome, state.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total Debits (Outflow)</span>
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                  -{formatCurrency(totalExpense, state.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Net Surplus</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatCurrency(netBalance, state.currency)}
                </span>
              </div>

              {/* Cash ratio bar */}
              <div className="pt-2">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Income vs Expense Ratio</span>
                  <span>{savingsRate}% Retained</span>
                </div>
                <div className="h-2 w-full bg-rose-200 dark:bg-rose-950/60 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader
          title="Recent Transactions"
          subtitle="Latest recorded entries with validation tags and actions"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs"
            >
              See All Transactions
            </Button>
          }
        />

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="text-sm">No transactions recorded yet.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddModal}
              className="mt-3"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log First Entry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Method</th>
                  <th className="pb-3 px-4 text-right">Amount</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {recentTransactions.map((tx) => {
                  const categoryStyle = getCategoryColor(tx.category);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{tx.title}</span>
                          {tx.receiptName && (
                            <span title={`Receipt: ${tx.receiptName}`}>
                              <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{tx.notes}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryStyle.bg}`}>
                          {tx.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono">
                        {formatRelativeDate(tx.date)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {getPaymentMethodLabel(tx.paymentMethod)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-semibold tabular-nums">
                        <span
                          className={
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amount, state.currency)}
                        </span>
                      </td>

                      <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            title="Edit transaction"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateTransaction(tx.id)}
                            title="Duplicate entry"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTransaction(tx.id)}
                            title="Delete entry (Undo supported)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
