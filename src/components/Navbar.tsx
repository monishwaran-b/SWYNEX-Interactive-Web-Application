import React from 'react';
import { useLedger } from '../context/LedgerContext';
import { SUPPORTED_CURRENCIES } from '../utils/formatters';
import { Button } from './ui/Button';
import { Plus, Github, Sun, Moon, CheckCircle2 } from 'lucide-react';

export interface NavbarProps {
  activeTab: 'overview' | 'transactions' | 'budgets' | 'analytics';
  onSelectTab: (tab: 'overview' | 'transactions' | 'budgets' | 'analytics') => void;
  onOpenAddModal: () => void;
  onOpenRepoModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Navbar({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenRepoModal,
  isDarkMode,
  onToggleTheme,
}: NavbarProps) {
  const { state, setCurrency } = useLedger();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Contract: Brand — 4-5 Nav Links — Primary Action */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              FL
            </div>
            <span>FlowLedger</span>
          </button>

          {/* Zone 2: 4-5 Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <button
              onClick={() => onSelectTab('overview')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                activeTab === 'overview'
                  ? 'text-slate-900 dark:text-slate-100 border-b-2 border-indigo-600 font-semibold'
                  : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onSelectTab('transactions')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                activeTab === 'transactions'
                  ? 'text-slate-900 dark:text-slate-100 border-b-2 border-indigo-600 font-semibold'
                  : ''
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => onSelectTab('budgets')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                activeTab === 'budgets'
                  ? 'text-slate-900 dark:text-slate-100 border-b-2 border-indigo-600 font-semibold'
                  : ''
              }`}
            >
              Budgets & Limits
            </button>
            <button
              onClick={() => onSelectTab('analytics')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                activeTab === 'analytics'
                  ? 'text-slate-900 dark:text-slate-100 border-b-2 border-indigo-600 font-semibold'
                  : ''
              }`}
            >
              Analytics
            </button>
            <button
              onClick={onOpenRepoModal}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
              {state.submission && (
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Action + Utility Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Currency selector */}
            <select
              aria-label="Select currency"
              value={state.currency.code}
              onChange={(e) => {
                const found = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
                if (found) setCurrency(found);
              }}
              className="px-2 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            {/* Dark / Light toggle */}
            <button
              onClick={onToggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* GitHub repo action modal trigger for mobile/desktop */}
            <button
              onClick={onOpenRepoModal}
              title="Submit & View GitHub Repository"
              className="p-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden cursor-pointer"
            >
              <Github className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onOpenAddModal}
            >
              Log Entry
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
