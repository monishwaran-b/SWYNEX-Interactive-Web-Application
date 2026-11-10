import { Currency } from '../types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 154.5 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 84.2 },
];

export function formatCurrency(amount: number, currency: Currency): string {
  const converted = amount * currency.rate;
  
  // Format depending on currency
  if (currency.code === 'JPY') {
    return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
  }
  
  return `${currency.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === yesterday) return 'Yesterday';

  return formatDate(dateStr);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCategoryColor(category: string): { bg: string; text: string; dot: string } {
  switch (category) {
    case 'Housing':
      return { bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' };
    case 'Food & Dining':
      return { bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' };
    case 'Transportation':
      return { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' };
    case 'Utilities':
      return { bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' };
    case 'Entertainment':
      return { bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' };
    case 'Healthcare':
      return { bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' };
    case 'Shopping':
      return { bg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' };
    case 'Education':
      return { bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' };
    case 'Salary':
      return { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' };
    case 'Freelance':
      return { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' };
    case 'Investments':
      return { bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' };
    default:
      return { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500' };
  }
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'credit_card':
      return 'Credit Card';
    case 'debit_card':
      return 'Debit Card';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'paypal':
      return 'PayPal';
    case 'crypto':
      return 'Crypto';
    case 'cash':
    default:
      return 'Cash';
  }
}
