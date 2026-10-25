'use client';

import React, { useState } from 'react';
import { useLifeOS } from '@/lib/store';
import { Transaction, Budget, SavingsGoal } from '@lifeos/shared';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  PiggyBank,
  PieChart,
  CreditCard,
  Trash2,
  X,
  ShieldCheck,
  Laptop,
  Plane,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Layers,
} from 'lucide-react';

export default function FinancePage() {
  const t = useTranslations('finance');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'transactions';

  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets' | 'savings'>(
    initialTab as any
  );

  const {
    transactions,
    budgets,
    savings,
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    depositSavings,
    addSavingsGoal,
  } = useLifeOS();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('Oziq-ovqat');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDesc, setTxDesc] = useState('');

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState<number>(1000000);

  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [savingsName, setSavingsName] = useState('');
  const [savingsTarget, setSavingsTarget] = useState<number>(10000000);
  const [savingsDate, setSavingsDate] = useState('2026-12-31');

  const [depositModalGoalId, setDepositModalGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(500000);

  // Calculations
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) return;

    addTransaction({
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      description: txDesc.trim() || (txType === 'income' ? 'Kirim' : 'Xarajat'),
      date: new Date().toISOString().split('T')[0],
    });

    setTxAmount(0);
    setTxDesc('');
    setIsTxModalOpen(false);
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetCategory.trim() || budgetLimit <= 0) return;

    addBudget({
      category: budgetCategory.trim(),
      limit: Number(budgetLimit),
      month: '2026-10',
    });

    setBudgetCategory('');
    setIsBudgetModalOpen(false);
  };

  const handleCreateSavings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savingsName.trim() || savingsTarget <= 0) return;

    addSavingsGoal({
      name: savingsName.trim(),
      targetAmount: Number(savingsTarget),
      targetDate: savingsDate,
      icon: 'ShieldCheck',
    });

    setSavingsName('');
    setIsSavingsModalOpen(false);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoalId || depositAmount <= 0) return;

    depositSavings(depositModalGoalId, Number(depositAmount));
    setDepositModalGoalId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('title')}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-border/60">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-card text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabTransactions')}
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'budgets'
                ? 'bg-white dark:bg-card text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabBudgets')}
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'savings'
                ? 'bg-white dark:bg-card text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabSavings')}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-muted-foreground">{t('totalBalance')}</span>
          <p className={`text-2xl sm:text-3xl font-black mt-2 ${totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalBalance.toLocaleString()} so'm
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Umumiy erkin likvidlik
          </p>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-muted-foreground">{t('totalIncome')}</span>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-foreground flex items-center gap-1.5">
            <ArrowUpRight className="w-6 h-6 text-emerald-500" />
            {totalIncome.toLocaleString()} so'm
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            + Keshbek va to'lovlar
          </p>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-muted-foreground">{t('totalExpense')}</span>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-foreground flex items-center gap-1.5">
            <ArrowDownRight className="w-6 h-6 text-red-500" />
            {totalExpense.toLocaleString()} so'm
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Oylik xarajatlar monitoringi
          </p>
        </div>
      </div>

      {/* Tab 1: Transactions Logging */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-foreground">Tranzaksiyalar tarixi</h2>
            </div>
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addTransaction')}</span>
            </button>
          </div>

          <div className="divide-y divide-border/60">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/30 px-2 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-500'
                    }`}
                  >
                    {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <h3 className="font-semibold text-xs text-foreground">{tx.description}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-medium">
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-xs ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-foreground'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()} so'm
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Budgets Planner */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addBudget')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {budgets.map((b) => {
              const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const remaining = b.limit - b.spent;
              const isWarning = percent >= 80;

              return (
                <div
                  key={b.id}
                  className={`bg-white dark:bg-card border rounded-2xl p-5 shadow-sm space-y-3.5 transition-all ${
                    isWarning ? 'border-amber-300 dark:border-amber-900/60' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{b.category}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">Oylik limit</span>
                    </div>
                    {isWarning && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 80%+ Sarflandi
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Sarflandi: {b.spent.toLocaleString()}</span>
                      <span className="text-foreground">{percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-border/60">
                    <span className="text-muted-foreground">Limit: {b.limit.toLocaleString()} so'm</span>
                    <span className={`font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      Qoldiq: {remaining.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Savings Goals / Vault */}
      {activeTab === 'savings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsSavingsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addSavings')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {savings.map((s) => {
              const percent = Math.min(100, Math.round((s.currentAmount / s.targetAmount) * 100));

              return (
                <div
                  key={s.id}
                  className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Muddati: {s.targetDate}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{s.name}</h3>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-primary font-bold">{s.currentAmount.toLocaleString()} so'm</span>
                      <span className="text-muted-foreground">{percent}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground block text-right">
                      Maqsad: {s.targetAmount.toLocaleString()} so'm
                    </span>
                  </div>

                  <button
                    onClick={() => setDepositModalGoalId(s.id)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('deposit')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                {t('addTransaction')}
              </h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    txType === 'expense' ? 'bg-white dark:bg-card text-red-600 shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {t('expense')}
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    txType === 'income' ? 'bg-white dark:bg-card text-emerald-600 shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {t('income')}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('amount')} (so'm) *
                </label>
                <input
                  type="number"
                  step="1000"
                  required
                  placeholder="masalan: 150000"
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('category')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Oziq-ovqat, Transport, Maosh..."
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('description')}
                </label>
                <input
                  type="text"
                  placeholder="Izoh..."
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Savings Modal */}
      {depositModalGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
                Mablag' Qo'shish
              </h3>
              <button
                onClick={() => setDepositModalGoalId(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Summa (so'm)
                </label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  autoFocus
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoalId(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700"
                >
                  Kiritish (+20 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                {t('addBudget')}
              </h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kategoriya Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Ta'lim, Sog'liq..."
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Oylik Limit (so'm) *
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Savings Modal */}
      {isSavingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
                {t('addSavings')}
              </h3>
              <button
                onClick={() => setIsSavingsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSavings} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Maqsad Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Yangi Avtomobil, Seyf..."
                  value={savingsName}
                  onChange={(e) => setSavingsName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Maqsadli Summa (so'm) *
                </label>
                <input
                  type="number"
                  step="100000"
                  required
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Erishish Muddati
                </label>
                <input
                  type="date"
                  value={savingsDate}
                  onChange={(e) => setSavingsDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSavingsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
