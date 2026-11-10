import React, { createContext, useContext, useEffect, useReducer, useMemo } from 'react';
import {
  CategoryBudget,
  Currency,
  FilterState,
  GitHubSubmission,
  ToastMessage,
  Transaction,
  TransactionCategory,
} from '../types';
import { INITIAL_BUDGETS, INITIAL_TRANSACTIONS } from '../utils/mockData';
import { SUPPORTED_CURRENCIES } from '../utils/formatters';

interface LedgerState {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  currency: Currency;
  filters: FilterState;
  toasts: ToastMessage[];
  submission: GitHubSubmission | null;
  lastDeleted: Transaction | null;
}

type LedgerAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'UNDO_DELETE' }
  | { type: 'BATCH_DELETE'; payload: string[] }
  | { type: 'SET_FILTER'; payload: { key: keyof FilterState; value: unknown } }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'UPDATE_BUDGET'; payload: { category: TransactionCategory; monthlyLimit: number } }
  | { type: 'SAVE_SUBMISSION'; payload: GitHubSubmission }
  | { type: 'RESET_DEMO' }
  | { type: 'CLEAR_ALL' }
  | { type: 'IMPORT_DATA'; payload: Transaction[] }
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string };

const INITIAL_FILTERS: FilterState = {
  search: '',
  type: 'all',
  category: 'all',
  paymentMethod: 'all',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date_desc',
  selectedTag: '',
};

const STORAGE_KEYS = {
  TRANSACTIONS: 'flowledger_transactions_v1',
  BUDGETS: 'flowledger_budgets_v1',
  CURRENCY: 'flowledger_currency_v1',
  SUBMISSION: 'flowledger_github_submission_v1',
};

function loadInitialState(): LedgerState {
  let transactions = INITIAL_TRANSACTIONS;
  let budgets = INITIAL_BUDGETS;
  let currency = SUPPORTED_CURRENCIES[0];
  let submission: GitHubSubmission | null = null;

  try {
    const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (savedTx) {
      const parsed = JSON.parse(savedTx);
      if (Array.isArray(parsed) && parsed.length > 0) {
        transactions = parsed;
      }
    }

    const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (savedBudgets) {
      const parsed = JSON.parse(savedBudgets);
      if (Array.isArray(parsed)) {
        budgets = parsed;
      }
    }

    const savedCurr = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (savedCurr) {
      const parsed = JSON.parse(savedCurr);
      if (parsed?.code) {
        currency = parsed;
      }
    }

    const savedSubmission = localStorage.getItem(STORAGE_KEYS.SUBMISSION);
    if (savedSubmission) {
      submission = JSON.parse(savedSubmission);
    }
  } catch (err) {
    console.error('Failed to parse localStorage state:', err);
  }

  return {
    transactions,
    budgets,
    currency,
    filters: INITIAL_FILTERS,
    toasts: [],
    submission,
    lastDeleted: null,
  };
}

function ledgerReducer(state: LedgerState, action: LedgerAction): LedgerState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const nextTx = [action.payload, ...state.transactions];
      return { ...state, transactions: nextTx };
    }

    case 'UPDATE_TRANSACTION': {
      const nextTx = state.transactions.map((tx) =>
        tx.id === action.payload.id
          ? { ...tx, ...action.payload.updates, updatedAt: Date.now() }
          : tx
      );
      return { ...state, transactions: nextTx };
    }

    case 'DELETE_TRANSACTION': {
      const target = state.transactions.find((tx) => tx.id === action.payload);
      const nextTx = state.transactions.filter((tx) => tx.id !== action.payload);
      return {
        ...state,
        transactions: nextTx,
        lastDeleted: target || null,
      };
    }

    case 'UNDO_DELETE': {
      if (!state.lastDeleted) return state;
      const nextTx = [state.lastDeleted, ...state.transactions];
      return {
        ...state,
        transactions: nextTx,
        lastDeleted: null,
      };
    }

    case 'BATCH_DELETE': {
      const idsToDelete = new Set(action.payload);
      const nextTx = state.transactions.filter((tx) => !idsToDelete.has(tx.id));
      return { ...state, transactions: nextTx };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
    }

    case 'RESET_FILTERS': {
      return { ...state, filters: INITIAL_FILTERS };
    }

    case 'SET_CURRENCY': {
      return { ...state, currency: action.payload };
    }

    case 'UPDATE_BUDGET': {
      const { category, monthlyLimit } = action.payload;
      const existing = state.budgets.find((b) => b.category === category);
      let nextBudgets: CategoryBudget[];

      if (existing) {
        nextBudgets = state.budgets.map((b) =>
          b.category === category ? { ...b, monthlyLimit } : b
        );
      } else {
        nextBudgets = [
          ...state.budgets,
          { category, monthlyLimit, color: '#6366f1' },
        ];
      }
      return { ...state, budgets: nextBudgets };
    }

    case 'SAVE_SUBMISSION': {
      return { ...state, submission: action.payload };
    }

    case 'RESET_DEMO': {
      return {
        ...state,
        transactions: INITIAL_TRANSACTIONS,
        budgets: INITIAL_BUDGETS,
        filters: INITIAL_FILTERS,
        lastDeleted: null,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        transactions: [],
        lastDeleted: null,
      };
    }

    case 'IMPORT_DATA': {
      return {
        ...state,
        transactions: [...action.payload, ...state.transactions],
      };
    }

    case 'ADD_TOAST': {
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    }

    case 'REMOVE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    }

    default:
      return state;
  }
}

export interface LedgerContextValue {
  state: LedgerState;
  // Computed values
  filteredTransactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
  recentTransactions: Transaction[];
  availableTags: string[];
  // Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  undoDelete: () => void;
  batchDelete: (ids: string[]) => void;
  duplicateTransaction: (id: string) => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setCurrency: (currency: Currency) => void;
  updateBudget: (category: TransactionCategory, monthlyLimit: number) => void;
  saveGitHubSubmission: (submission: GitHubSubmission) => void;
  resetToDemoData: () => void;
  clearAllTransactions: () => void;
  exportJSON: () => void;
  exportCSV: () => void;
  importJSON: (fileContent: string) => boolean;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(ledgerReducer, undefined, loadInitialState);

  // Sync state to local storage on modification
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(state.budgets));
      localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(state.currency));
      if (state.submission) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSION, JSON.stringify(state.submission));
      }
    } catch (e) {
      console.error('Storage sync error:', e);
    }
  }, [state.transactions, state.budgets, state.currency, state.submission]);

  // Toast trigger helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    dispatch({ type: 'ADD_TOAST', payload: newToast });

    const duration = toast.duration || (toast.action ? 6000 : 3500);
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, duration);
  };

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    const now = Date.now();
    const newTx: Transaction = {
      ...data,
      id: `tx-${now}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
    addToast({
      title: `${data.type === 'income' ? 'Income' : 'Expense'} recorded`,
      message: `${data.title} added successfully.`,
      type: 'success',
    });
    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
    addToast({
      title: 'Transaction updated',
      message: 'Changes saved to ledger.',
      type: 'info',
    });
  };

  const undoDelete = () => {
    dispatch({ type: 'UNDO_DELETE' });
    addToast({
      title: 'Restored',
      message: 'Transaction successfully restored.',
      type: 'success',
    });
  };

  const deleteTransaction = (id: string) => {
    const item = state.transactions.find((tx) => tx.id === id);
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });

    addToast({
      title: 'Transaction deleted',
      message: item ? `"${item.title}" removed.` : undefined,
      type: 'warning',
      action: {
        label: 'Undo',
        onClick: () => {
          undoDelete();
        },
      },
      duration: 6000,
    });
  };

  const batchDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    dispatch({ type: 'BATCH_DELETE', payload: ids });
    addToast({
      title: 'Batch deletion complete',
      message: `${ids.length} transaction${ids.length > 1 ? 's' : ''} removed.`,
      type: 'warning',
    });
  };

  const duplicateTransaction = (id: string) => {
    const source = state.transactions.find((tx) => tx.id === id);
    if (!source) return;
    const now = Date.now();
    const duplicated: Transaction = {
      ...source,
      id: `tx-${now}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${source.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: duplicated });
    addToast({
      title: 'Transaction duplicated',
      message: `Created copy of "${source.title}".`,
      type: 'success',
    });
  };

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    dispatch({ type: 'SET_FILTER', payload: { key, value } });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const setCurrency = (currency: Currency) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency });
    addToast({
      title: `Currency switched to ${currency.code}`,
      message: `Values formatted using ${currency.symbol} (${currency.name}).`,
      type: 'info',
    });
  };

  const updateBudget = (category: TransactionCategory, monthlyLimit: number) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: { category, monthlyLimit } });
    addToast({
      title: 'Budget goal updated',
      message: `${category} monthly limit set to ${state.currency.symbol}${monthlyLimit.toLocaleString()}.`,
      type: 'success',
    });
  };

  const saveGitHubSubmission = (submission: GitHubSubmission) => {
    dispatch({ type: 'SAVE_SUBMISSION', payload: submission });
    addToast({
      title: 'GitHub submission verified',
      message: `Repository ${submission.repoUrl} successfully logged.`,
      type: 'success',
    });
  };

  const resetToDemoData = () => {
    dispatch({ type: 'RESET_DEMO' });
    addToast({
      title: 'Reset to sample data',
      message: 'Ledger restored with realistic demo records.',
      type: 'info',
    });
  };

  const clearAllTransactions = () => {
    dispatch({ type: 'CLEAR_ALL' });
    addToast({
      title: 'Ledger cleared',
      message: 'All transaction records have been erased.',
      type: 'warning',
    });
  };

  const exportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'FlowLedger',
      transactions: state.transactions,
      budgets: state.budgets,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `flowledger_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    addToast({
      title: 'Export successful',
      message: 'Downloaded ledger backup in JSON format.',
      type: 'success',
    });
  };

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Title', 'Amount', 'Payment Method', 'Tags', 'Notes'];
    const rows = state.transactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type,
      `"${tx.category}"`,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.amount,
      tx.paymentMethod,
      `"${tx.tags.join(', ')}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flowledger_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    addToast({
      title: 'CSV exported',
      message: 'Transaction spreadsheet generated.',
      type: 'success',
    });
  };

  const importJSON = (fileContent: string): boolean => {
    try {
      const parsed = JSON.parse(fileContent);
      let list: Transaction[] = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && Array.isArray(parsed.transactions)) {
        list = parsed.transactions;
      }

      if (list.length === 0) {
        addToast({
          title: 'Import failed',
          message: 'No valid transactions found in file.',
          type: 'error',
        });
        return false;
      }

      // Validate required properties on imported records
      const valid = list.filter((tx) => tx.title && typeof tx.amount === 'number' && tx.date);
      dispatch({ type: 'IMPORT_DATA', payload: valid });
      addToast({
        title: 'Import successful',
        message: `Imported ${valid.length} transaction records.`,
        type: 'success',
      });
      return true;
    } catch {
      addToast({
        title: 'Import failed',
        message: 'Invalid JSON file structure.',
        type: 'error',
      });
      return false;
    }
  };

  // Memoized Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      const { search, type, category, paymentMethod, startDate, endDate, minAmount, maxAmount, selectedTag } =
        state.filters;

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesNotes = (tx.notes || '').toLowerCase().includes(q);
        const matchesCategory = tx.category.toLowerCase().includes(q);
        const matchesTag = tx.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesNotes && !matchesCategory && !matchesTag) {
          return false;
        }
      }

      // Type match
      if (type !== 'all' && tx.type !== type) {
        return false;
      }

      // Category match
      if (category !== 'all' && tx.category !== category) {
        return false;
      }

      // Payment method match
      if (paymentMethod !== 'all' && tx.paymentMethod !== paymentMethod) {
        return false;
      }

      // Date range match
      if (startDate && tx.date < startDate) {
        return false;
      }
      if (endDate && tx.date > endDate) {
        return false;
      }

      // Amount bounds
      if (minAmount && !isNaN(Number(minAmount)) && tx.amount < Number(minAmount)) {
        return false;
      }
      if (maxAmount && !isNaN(Number(maxAmount)) && tx.amount > Number(maxAmount)) {
        return false;
      }

      // Tag filter
      if (selectedTag && !tx.tags.includes(selectedTag)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (state.filters.sortBy) {
        case 'date_asc':
          return a.date.localeCompare(b.date);
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'date_desc':
        default:
          return b.date.localeCompare(a.date);
      }
    });
  }, [state.transactions, state.filters]);

  // Aggregate metrics
  const { totalIncome, totalExpense, netBalance, savingsRate } = useMemo(() => {
    let income = 0;
    let expense = 0;

    for (const tx of state.transactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    }

    const net = income - expense;
    const rate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: net,
      savingsRate: rate,
    };
  }, [state.transactions]);

  // Category Spend Breakdown
  const categoryBreakdown = useMemo(() => {
    const expenseOnly = state.transactions.filter((tx) => tx.type === 'expense');
    const totalExp = expenseOnly.reduce((sum, tx) => sum + tx.amount, 0);

    const map = new Map<string, { amount: number; count: number }>();
    for (const tx of expenseOnly) {
      const current = map.get(tx.category) || { amount: 0, count: 0 };
      map.set(tx.category, {
        amount: current.amount + tx.amount,
        count: current.count + 1,
      });
    }

    const breakdown = Array.from(map.entries()).map(([cat, data]) => ({
      category: cat,
      amount: data.amount,
      percentage: totalExp > 0 ? Math.round((data.amount / totalExp) * 100) : 0,
      count: data.count,
    }));

    return breakdown.sort((a, b) => b.amount - a.amount);
  }, [state.transactions]);

  // Available unique tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const tx of state.transactions) {
      for (const t of tx.tags) {
        set.add(t);
      }
    }
    return Array.from(set).sort();
  }, [state.transactions]);

  const recentTransactions = useMemo(() => {
    return [...state.transactions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6);
  }, [state.transactions]);

  const value: LedgerContextValue = {
    state,
    filteredTransactions,
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    categoryBreakdown,
    recentTransactions,
    availableTags,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    undoDelete,
    batchDelete,
    duplicateTransaction,
    setFilter,
    resetFilters,
    setCurrency,
    updateBudget,
    saveGitHubSubmission,
    resetToDemoData,
    clearAllTransactions,
    exportJSON,
    exportCSV,
    importJSON,
    addToast,
    removeToast,
  };

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerContextValue {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
}
