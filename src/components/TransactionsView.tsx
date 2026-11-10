import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate, getCategoryColor, getPaymentMethodLabel } from '../utils/formatters';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { SegmentedControl } from './ui/SegmentedControl';
import { ConfirmDialog } from './ui/ConfirmDialog';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Copy,
  Plus,
  ArrowUpDown,
  Paperclip,
  X,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

export interface TransactionsViewProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Housing', label: 'Housing' },
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Education', label: 'Education' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Investments', label: 'Investments' },
  { value: 'Other', label: 'Other' },
];

const PAYMENT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Payment Methods' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Crypto' },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest First)' },
  { value: 'date_asc', label: 'Date (Oldest First)' },
  { value: 'amount_desc', label: 'Amount (High to Low)' },
  { value: 'amount_asc', label: 'Amount (Low to High)' },
  { value: 'title_asc', label: 'Description (A-Z)' },
];

export function TransactionsView({ onOpenAddModal, onEditTransaction }: TransactionsViewProps) {
  const {
    state,
    filteredTransactions,
    setFilter,
    resetFilters,
    deleteTransaction,
    duplicateTransaction,
    batchDelete,
    exportCSV,
    exportJSON,
    importJSON,
    availableTags,
  } = useLedger();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState<Transaction | null>(null);

  const isAllSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((tx) => selectedIds.includes(tx.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((tx) => tx.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBatchDelete = () => {
    batchDelete(selectedIds);
    setSelectedIds([]);
    setShowBatchDeleteDialog(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const hasActiveFilters =
    state.filters.search !== '' ||
    state.filters.type !== 'all' ||
    state.filters.category !== 'all' ||
    state.filters.paymentMethod !== 'all' ||
    state.filters.startDate !== '' ||
    state.filters.endDate !== '' ||
    state.filters.minAmount !== '' ||
    state.filters.maxAmount !== '' ||
    state.filters.selectedTag !== '';

  return (
    <div className="space-y-5">
      {/* Search & Top Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input with live filter */}
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by title, note, or tag..."
            prefixElement={<Search className="w-4 h-4 text-slate-400" />}
            value={state.filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            suffixElement={
              state.filters.search ? (
                <button
                  type="button"
                  onClick={() => setFilter('search', '')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Right side controls: Filter Drawer Toggle, Type Segmented Control, Add Entry */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Segmented Control */}
          <SegmentedControl<TransactionType | 'all'>
            size="sm"
            value={state.filters.type}
            onChange={(val) => setFilter('type', val as 'all' | 'expense' | 'income')}
            options={[
              { value: 'all', label: 'All' },
              { value: 'expense', label: 'Expenses' },
              { value: 'income', label: 'Income' },
            ]}
          />

          {/* Toggle advanced filters */}
          <Button
            variant={hasActiveFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
          >
            Filters {hasActiveFilters && '(Active)'}
          </Button>

          {/* Export & Import actions */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              title="Download CSV spreadsheet"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            >
              CSV
            </Button>

            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg text-xs px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Import</span>
              </span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Record
          </Button>
        </div>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showFiltersDrawer && (
        <Card className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Select
              label="Category"
              value={state.filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              options={CATEGORY_FILTER_OPTIONS}
            />

            <Select
              label="Payment Method"
              value={state.filters.paymentMethod}
              onChange={(e) => setFilter('paymentMethod', e.target.value)}
              options={PAYMENT_FILTER_OPTIONS}
            />

            <Input
              label="Start Date"
              type="date"
              value={state.filters.startDate}
              onChange={(e) => setFilter('startDate', e.target.value)}
            />

            <Input
              label="End Date"
              type="date"
              value={state.filters.endDate}
              onChange={(e) => setFilter('endDate', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <Input
              label="Min Amount"
              type="number"
              placeholder="0.00"
              prefixElement={<span className="font-mono">{state.currency.symbol}</span>}
              value={state.filters.minAmount}
              onChange={(e) => setFilter('minAmount', e.target.value)}
            />

            <Input
              label="Max Amount"
              type="number"
              placeholder="10000.00"
              prefixElement={<span className="font-mono">{state.currency.symbol}</span>}
              value={state.filters.maxAmount}
              onChange={(e) => setFilter('maxAmount', e.target.value)}
            />

            <Select
              label="Sort By"
              value={state.filters.sortBy}
              onChange={(e) =>
                setFilter('sortBy', e.target.value as typeof state.filters.sortBy)
              }
              options={SORT_OPTIONS}
            />
          </div>

          {/* Tags quick selector */}
          {availableTags.length > 0 && (
            <div className="mt-3 pt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Filter by Tag:</span>
              <button
                type="button"
                onClick={() => setFilter('selectedTag', '')}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  state.filters.selectedTag === ''
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Any
              </button>
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() =>
                    setFilter('selectedTag', state.filters.selectedTag === tag ? '' : tag)
                  }
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    state.filters.selectedTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Reset Filters CTA */}
          <div className="flex items-center justify-end gap-2 mt-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Batch Selection Banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
            <span>
              {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs"
            >
              Deselect All
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBatchDeleteDialog(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Data Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all transactions"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No matching transactions found.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters
                        ? 'Try clearing active filters to expand your view.'
                        : 'Start by logging your first transaction.'}
                    </p>
                    {hasActiveFilters ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="mt-3 text-xs"
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onOpenAddModal}
                        className="mt-3 text-xs"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Log Transaction
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isChecked = selectedIds.includes(tx.id);
                  const catStyle = getCategoryColor(tx.category);

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(tx.id)}
                          aria-label={`Select ${tx.title}`}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{tx.title}</span>
                          {tx.receiptName && (
                            <button
                              type="button"
                              onClick={() => setActiveReceiptModal(tx)}
                              title={`View receipt: ${tx.receiptName}`}
                              className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                            >
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            </button>
                          )}
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{tx.notes}</p>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${catStyle.bg}`}>
                          {tx.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono">
                        {formatDate(tx.date)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {getPaymentMethodLabel(tx.paymentMethod)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {tx.tags.length > 0 ? (
                            tx.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded"
                              >
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold tabular-nums">
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

                      <td className="py-3 px-4 text-right whitespace-nowrap">
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredTransactions.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{state.transactions.length}</span> records
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span>
              Net Filtered Flow:{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {formatCurrency(
                  filteredTransactions.reduce(
                    (sum, tx) => (tx.type === 'income' ? sum + tx.amount : sum - tx.amount),
                    0
                  ),
                  state.currency
                )}
              </strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Batch Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBatchDeleteDialog}
        onClose={() => setShowBatchDeleteDialog(false)}
        onConfirm={handleConfirmBatchDelete}
        title="Delete Selected Transactions"
        message={`Are you sure you want to delete ${selectedIds.length} selected transaction(s)? This will remove them from your current ledger.`}
        confirmLabel="Delete All Selected"
      />

      {/* Receipt Preview Modal */}
      {activeReceiptModal && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Receipt Attachment
              </h4>
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <Paperclip className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="font-semibold">{activeReceiptModal.receiptName}</p>
              <p className="text-[11px] text-slate-400">Linked to: {activeReceiptModal.title}</p>
              <p className="text-[11px] text-slate-400">
                Amount: {formatCurrency(activeReceiptModal.amount, state.currency)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveReceiptModal(null)}
              className="w-full text-xs"
            >
              Close
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
