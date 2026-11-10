export type TransactionType = 'expense' | 'income';

export type TransactionCategory =
  | 'Housing'
  | 'Food & Dining'
  | 'Transportation'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Education'
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Other';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'paypal'
  | 'crypto';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  tags: string[];
  notes?: string;
  receiptName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CategoryBudget {
  category: TransactionCategory;
  monthlyLimit: number;
  color: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // against USD
}

export interface FilterState {
  search: string;
  type: 'all' | 'expense' | 'income';
  category: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'title_asc';
  selectedTag: string;
}

export interface TransactionFormData {
  title: string;
  amount: string;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  paymentMethod: PaymentMethod;
  tagsInput: string;
  notes: string;
  receiptName?: string;
}

export interface FormErrors {
  title?: string;
  amount?: string;
  type?: string;
  category?: string;
  date?: string;
  paymentMethod?: string;
  tagsInput?: string;
  notes?: string;
  general?: string;
}

export interface GitHubSubmission {
  repoUrl: string;
  projectTitle: string;
  branch: string;
  authorName: string;
  authorEmail: string;
  notes: string;
  submittedAt: string;
  status: 'draft' | 'verified' | 'submitted';
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}
