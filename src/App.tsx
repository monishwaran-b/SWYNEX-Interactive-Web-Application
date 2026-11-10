/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LedgerProvider, useLedger } from './context/LedgerContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { AnalyticsView } from './components/AnalyticsView';
import { TransactionFormModal } from './components/TransactionFormModal';
import { GitHubSubmissionModal } from './components/GitHubSubmissionModal';
import { ToastContainer } from './components/ToastContainer';
import { Transaction } from './types';
import { Github, ShieldCheck, Heart } from 'lucide-react';

function AppContent() {
  const { state } = useLedger();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'analytics'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('flowledger_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('flowledger_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('flowledger_theme', 'light');
      }
      return next;
    });
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Navigation Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenRepoModal={() => setIsRepoModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <DashboardView
            onOpenAddModal={handleOpenAddModal}
            onEditTransaction={handleEditTransaction}
            onNavigateToTab={setActiveTab}
            onOpenRepoModal={() => setIsRepoModalOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenAddModal={handleOpenAddModal}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'budgets' && <BudgetsView />}

        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Clean Anti-Slop Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">FlowLedger Studio</span>
            <span>·</span>
            <span>Reusable Components</span>
            <span>·</span>
            <span>Real-time Form Validation</span>
            <span>·</span>
            <span>State Management</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRepoModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Submission: {state.submission ? 'Verified' : 'Ready to Submit'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Portals */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseFormModal}
        initialTransaction={editingTransaction}
      />

      <GitHubSubmissionModal
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
      />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <LedgerProvider>
      <AppContent />
    </LedgerProvider>
  );
}
