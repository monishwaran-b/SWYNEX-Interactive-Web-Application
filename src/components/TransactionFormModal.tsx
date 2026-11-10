import React, { useState, useEffect } from 'react';
import {
  FormErrors,
  PaymentMethod,
  Transaction,
  TransactionCategory,
  TransactionFormData,
  TransactionType,
} from '../types';
import { useLedger } from '../context/LedgerContext';
import { validateSingleField, validateTransactionForm } from '../utils/validation';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { SegmentedControl } from './ui/SegmentedControl';
import { AlertTriangle, Paperclip, Sparkles, Tag, Check } from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';

export interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
}

const CATEGORY_OPTIONS: { value: TransactionCategory; label: string }[] = [
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Housing', label: 'Housing & Rent' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Utilities', label: 'Utilities & Bills' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Healthcare', label: 'Healthcare & Medical' },
  { value: 'Shopping', label: 'Shopping & Retail' },
  { value: 'Education', label: 'Education & Learning' },
  { value: 'Salary', label: 'Salary & Wages' },
  { value: 'Freelance', label: 'Freelance & Contracting' },
  { value: 'Investments', label: 'Investments & Dividends' },
  { value: 'Other', label: 'Other & Miscellaneous' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Crypto' },
];

const PRESETS = [
  { label: 'Lunch / Coffee', amount: '14.50', category: 'Food & Dining' as TransactionCategory, type: 'expense' as TransactionType },
  { label: 'Groceries', amount: '125.00', category: 'Food & Dining' as TransactionCategory, type: 'expense' as TransactionType },
  { label: 'Monthly Rent', amount: '1450.00', category: 'Housing' as TransactionCategory, type: 'expense' as TransactionType },
  { label: 'Freelance Payout', amount: '2400.00', category: 'Freelance' as TransactionCategory, type: 'income' as TransactionType },
];

export function TransactionFormModal({
  isOpen,
  onClose,
  initialTransaction,
}: TransactionFormModalProps) {
  const { addTransaction, updateTransaction, state } = useLedger();

  const isEditing = Boolean(initialTransaction);

  const defaultFormData: TransactionFormData = {
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining',
    date: getTodayDateString(),
    paymentMethod: 'credit_card',
    tagsInput: '',
    notes: '',
    receiptName: undefined,
  };

  const [formData, setFormData] = useState<TransactionFormData>(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form when opening in edit mode
  useEffect(() => {
    if (initialTransaction) {
      setFormData({
        title: initialTransaction.title,
        amount: initialTransaction.amount.toString(),
        type: initialTransaction.type,
        category: initialTransaction.category,
        date: initialTransaction.date,
        paymentMethod: initialTransaction.paymentMethod,
        tagsInput: initialTransaction.tags.join(', '),
        notes: initialTransaction.notes || '',
        receiptName: initialTransaction.receiptName,
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData(defaultFormData);
      setErrors({});
      setTouched({});
    }
  }, [initialTransaction, isOpen]);

  // Handle single field change with real-time validation
  const handleChange = (fieldName: keyof TransactionFormData, value: string) => {
    const updated = { ...formData, [fieldName]: value };
    setFormData(updated);

    // If field was already touched, validate dynamically
    if (touched[fieldName]) {
      const fieldError = validateSingleField(fieldName, value, updated);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldError,
      }));
    }
  };

  const handleBlur = (fieldName: keyof TransactionFormData) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const fieldError = validateSingleField(fieldName, formData[fieldName] || '', formData);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError,
    }));
  };

  const handlePresetApply = (preset: typeof PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.label,
      amount: preset.amount,
      category: preset.category,
      type: preset.type,
    }));
    setTouched((prev) => ({
      ...prev,
      title: true,
      amount: true,
      category: true,
    }));
  };

  // Check budget limit alert
  const targetBudget = state.budgets.find((b) => b.category === formData.category);
  const enteredAmount = Number(formData.amount) || 0;
  const isOverBudget =
    formData.type === 'expense' &&
    targetBudget &&
    enteredAmount > targetBudget.monthlyLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched: Record<string, boolean> = {
      title: true,
      amount: true,
      category: true,
      type: true,
      date: true,
      paymentMethod: true,
      tagsInput: true,
      notes: true,
    };
    setTouched(allTouched);

    const validationErrors = validateTransactionForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedTags = formData.tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const parsedAmount = Math.round(Number(formData.amount) * 100) / 100;

      if (isEditing && initialTransaction) {
        updateTransaction(initialTransaction.id, {
          title: formData.title.trim(),
          amount: parsedAmount,
          type: formData.type,
          category: formData.category,
          date: formData.date,
          paymentMethod: formData.paymentMethod,
          tags: parsedTags,
          notes: formData.notes.trim() || undefined,
          receiptName: formData.receiptName,
        });
      } else {
        addTransaction({
          title: formData.title.trim(),
          amount: parsedAmount,
          type: formData.type,
          category: formData.category,
          date: formData.date,
          paymentMethod: formData.paymentMethod,
          tags: parsedTags,
          notes: formData.notes.trim() || undefined,
          receiptName: formData.receiptName,
        });
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateReceipt = () => {
    const dummyReceipts = ['receipt_invoice_1092.pdf', 'pos_slip_09.jpg', 'merchant_statement.pdf'];
    const chosen = dummyReceipts[Math.floor(Math.random() * dummyReceipts.length)];
    setFormData((prev) => ({ ...prev, receiptName: chosen }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Record New Transaction'}
      subtitle={isEditing ? 'Update transaction details and category' : 'Log an income or expense with validated fields'}
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Save Transaction'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Type Toggle: Expense vs Income */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Transaction Type <span className="text-rose-500">*</span>
          </label>
          <SegmentedControl<TransactionType>
            value={formData.type}
            onChange={(val) => {
              handleChange('type', val);
              // Auto-switch to sensible category if switching to income
              if (val === 'income' && (formData.category === 'Food & Dining' || formData.category === 'Housing')) {
                handleChange('category', 'Freelance');
              } else if (val === 'expense' && (formData.category === 'Salary' || formData.category === 'Freelance')) {
                handleChange('category', 'Food & Dining');
              }
            }}
            options={[
              { value: 'expense', label: 'Expense (-)' },
              { value: 'income', label: 'Income (+)' },
            ]}
          />
        </div>

        {/* Quick Presets (Only when adding new) */}
        {!isEditing && (
          <div className="pt-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => handlePresetApply(p)}
                  className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors cursor-pointer"
                >
                  {p.label} (${p.amount})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title / Description */}
        <Input
          label="Title / Description"
          required
          placeholder="e.g. Whole Foods Groceries, Client Retainer"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          error={touched.title ? errors.title : undefined}
          helperText="Between 3 and 60 characters."
        />

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount"
            required
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            prefixElement={<span className="font-semibold text-slate-500">{state.currency.symbol}</span>}
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            onBlur={() => handleBlur('amount')}
            error={touched.amount ? errors.amount : undefined}
          />

          <Input
            label="Transaction Date"
            required
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            onBlur={() => handleBlur('date')}
            error={touched.date ? errors.date : undefined}
          />
        </div>

        {/* Budget Warning Alert (if applicable) */}
        {isOverBudget && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Budget Warning:</span> This single expense of{' '}
              <span className="font-mono">{state.currency.symbol}{enteredAmount.toFixed(2)}</span> exceeds the monthly{' '}
              {formData.category} target limit ({state.currency.symbol}{targetBudget?.monthlyLimit}).
            </div>
          </div>
        )}

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            required
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            onBlur={() => handleBlur('category')}
            error={touched.category ? errors.category : undefined}
            options={CATEGORY_OPTIONS}
          />

          <Select
            label="Payment Method"
            required
            value={formData.paymentMethod}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
            onBlur={() => handleBlur('paymentMethod')}
            error={touched.paymentMethod ? errors.paymentMethod : undefined}
            options={PAYMENT_METHODS}
          />
        </div>

        {/* Tags input */}
        <Input
          label="Tags (Optional)"
          placeholder="e.g. tax, personal, reimbursable (comma-separated)"
          prefixElement={<Tag className="w-3.5 h-3.5 text-slate-400" />}
          value={formData.tagsInput}
          onChange={(e) => handleChange('tagsInput', e.target.value)}
          onBlur={() => handleBlur('tagsInput')}
          error={touched.tagsInput ? errors.tagsInput : undefined}
          helperText="Up to 5 comma-separated tags."
        />

        {/* Notes */}
        <Textarea
          label="Notes & Context (Optional)"
          placeholder="Add memo, project reference, or receipt notes..."
          maxLength={300}
          currentLength={formData.notes.length}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          error={touched.notes ? errors.notes : undefined}
        />

        {/* Receipt attachment simulation */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Proof / Receipt Attachment</span>
            {formData.receiptName && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, receiptName: undefined }))}
                className="text-[11px] text-rose-600 hover:underline cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
          {formData.receiptName ? (
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300">
              <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-mono truncate">{formData.receiptName}</span>
              <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">Attached</span>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Paperclip className="w-3.5 h-3.5" />}
              onClick={handleSimulateReceipt}
              className="w-full text-xs"
            >
              Attach Sample Receipt Document
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
