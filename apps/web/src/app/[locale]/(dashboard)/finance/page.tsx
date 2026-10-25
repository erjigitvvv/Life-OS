'use client';

import React, { useState } from 'react';
import { useLifeOS, Transaction, Budget, SavingsGoal } from '@/lib/store';
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
  AlertTriangle,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  Calculator,
  CheckCircle2,
} from 'lucide-react';

export default function FinancePage() {
  const t = useTranslations('finance');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'transactions';

  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets' | 'savings' | 'rule503020'>(
    initialTab as any
  );

  const {
    transactions,
    budgets,
    savings,
    emergencyFund,
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    depositSavings,
    addSavingsGoal,
    depositEmergencyFund,
    autoAllocate503020,
  } = useLifeOS();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('Oziq-ovqat');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDesc, setTxDesc] = useState('');
  const [use503020InTx, setUse503020InTx] = useState(false);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState<number>(1000000);

  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [savingsName, setSavingsName] = useState('');
  const [savingsTarget, setSavingsTarget] = useState<number>(10000000);
  const [savingsDate, setSavingsDate] = useState('2026-12-31');

  const [depositModalGoalId, setDepositModalGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(500000);

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyDepositAmount, setEmergencyDepositAmount] = useState<number>(1000000);

  // 50/30/20 quick calculator state
  const [calcIncome, setCalcIncome] = useState<number>(5000000);

  // Calculations
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  // Monthly budget remaining
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);

  // Emergency Fund percent
  const efCurrent = emergencyFund?.currentAmount || 0;
  const efTarget = emergencyFund?.targetAmount || 50000000;
  const efPercent = Math.min(100, Math.round((efCurrent / efTarget) * 100));

  // Combined savings percent (all savings goals + emergency fund)
  const totalSavingsCurrent = savings.reduce((sum, s) => sum + s.currentAmount, 0) + efCurrent;
  const totalSavingsTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0) + efTarget;
  const combinedSavingsPercent = totalSavingsTarget > 0 ? Math.min(100, Math.round((totalSavingsCurrent / totalSavingsTarget) * 100)) : 0;

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) return;

    if (txType === 'income' && use503020InTx) {
      autoAllocate503020(Number(txAmount), txDesc.trim() || 'Oylik daromad (50/30/20)');
    } else {
      addTransaction({
        type: txType,
        category: txCategory,
        amount: Number(txAmount),
        description: txDesc.trim() || (txType === 'income' ? 'Kirim' : 'Xarajat'),
        date: new Date().toISOString().split('T')[0],
      });
    }

    setTxAmount(0);
    setTxDesc('');
    setUse503020InTx(false);
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

  const handleEmergencyDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emergencyDepositAmount <= 0) return;

    depositEmergencyFund(Number(emergencyDepositAmount));
    setIsEmergencyModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#f1f5f9] dark:bg-[#0b1329] p-4 sm:p-6 lg:p-8 font-sans select-none">
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#111c33] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {t('title')} (Budget Planner)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('subtitle')} • 50/30/20 qoidasi avtomatizatsiyasi va zaxira fondi
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-[#1c2a47] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('tabTransactions')}
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'budgets'
                ? 'bg-white dark:bg-[#1c2a47] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('tabBudgets')}
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'savings'
                ? 'bg-white dark:bg-[#1c2a47] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('tabSavings')}
          </button>
          <button
            onClick={() => setActiveTab('rule503020')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'rule503020'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>50/30/20 Qoidasi</span>
          </button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Net Balance */}
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('totalBalance')}
          </span>
          <p
            className={`text-2xl font-black mt-1.5 font-mono ${
              totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
            }`}
          >
            {totalBalance.toLocaleString()} so'm
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">
            Kirim: {totalIncome.toLocaleString()} | Chiqim: {totalExpense.toLocaleString()}
          </span>
        </div>

        {/* Monthly Budget Remaining */}
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('budgetRemaining')}
          </span>
          <p className="text-2xl font-black mt-1.5 text-blue-600 dark:text-blue-400 font-mono">
            {budgetRemaining.toLocaleString()} so'm
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">
            Jami Limit: {totalBudgetLimit.toLocaleString()} so'm
          </span>
        </div>

        {/* Emergency Reserve Fund (Zaxira fondi) */}
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('emergencyFund')} (Zaxira)
            </span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {efPercent}%
            </span>
          </div>
          <p className="text-xl font-black mt-1.5 text-slate-800 dark:text-slate-100 font-mono">
            {efCurrent.toLocaleString()} so'm
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${efPercent}%` }}
            />
          </div>
        </div>

        {/* Combined Savings Progress */}
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Jamg'arma Foizi
            </span>
            <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
              {combinedSavingsPercent}%
            </span>
          </div>
          <p className="text-xl font-black mt-1.5 text-slate-800 dark:text-slate-100 font-mono">
            {totalSavingsCurrent.toLocaleString()} so'm
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${combinedSavingsPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* TAB 1: TRANSACTIONS HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Tranzaksiyalar Tarixi & Avtomatlashtirilgan Kirim
              </h2>
            </div>
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addTransaction')}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 px-3 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-500'
                    }`}
                  >
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                      {tx.description}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`font-mono font-bold text-sm sm:text-base ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()} so'm
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BUDGETS PLANNER */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Kategoriyalar & Oylik Byudjet Rejalashtiruvchi
            </h2>
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
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
                  className={`bg-white dark:bg-[#111c33] border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                    isWarning ? 'border-amber-300 dark:border-amber-900/60' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{b.category}</h3>
                      <span className="text-xs text-slate-400 font-mono">Oylik limit rejam</span>
                    </div>
                    {isWarning && (
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 80%+ Sarflandi
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Sarflandi: {b.spent.toLocaleString()} so'm</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{percent}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Limit: {b.limit.toLocaleString()}</span>
                    <span className={`font-bold ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      Qoldiq: {remaining.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SAVINGS & EMERGENCY FUND */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          {/* Emergency Fund Special Card */}
          <div className="bg-gradient-to-tr from-emerald-900 to-teal-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-4 bottom-4 opacity-10">
              <ShieldCheck className="w-48 h-48" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/20 text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-md">
                    Zaxira Fondi (Emergency Reserve)
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-mono">
                  {efCurrent.toLocaleString()} / {efTarget.toLocaleString()} so'm
                </h2>
                <p className="text-xs text-emerald-100 max-w-xl">
                  Kutilmagan xarajatlar va moliyaviy xavfsizlik uchun 3-6 oylik yashash xarajatlari zaxirasi.
                </p>
              </div>

              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="px-5 py-3 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-50 transition-all shrink-0 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Zaxiraga Qo'shish</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Boshqa Jamg'arma Maqsadlari (Vault)
            </h2>
            <button
              onClick={() => setIsSavingsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
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
                  className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Muddati: {s.targetDate}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{s.name}</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                        {s.currentAmount.toLocaleString()} so'm
                      </span>
                      <span className="text-slate-500">{percent}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 block text-right font-mono">
                      Maqsad: {s.targetAmount.toLocaleString()} so'm
                    </span>
                  </div>

                  <button
                    onClick={() => setDepositModalGoalId(s.id)}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('deposit')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: 50/30/20 RULE AUTOMATION */}
      {activeTab === 'rule503020' && (
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                50/30/20 Qoidasi Avtomatizatsiyasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Har bir yangi daromad kelganda tizim uni avtomatik ravishda ehtiyoj, istak va jamg'armalarga bo'lib beradi.
              </p>
            </div>
          </div>

          {/* Interactive Calculator Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Daromadni Taqsimlash Kalkulyatori
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kiritiladigan Daromad Summasi (so'm)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={calcIncome}
                  onChange={(e) => setCalcIncome(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex justify-between">
                  <span>50% Zaruriy Ehtiyojlar (Needs):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {Math.round(calcIncome * 0.5).toLocaleString()} so'm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>30% Xohish-istaklar (Wants):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {Math.round(calcIncome * 0.3).toLocaleString()} so'm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>20% Jamg'arma & Zaxira (Savings):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(calcIncome * 0.2).toLocaleString()} so'm
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  autoAllocate503020(calcIncome, `Oylik avtomatik taqsimot (${calcIncome.toLocaleString()} so'm)`);
                  alert('Daromad 50/30/20 qoidasi bo‘yicha muvaffaqiyatli taqsimlandi va zaxiraga qo‘shildi!');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tizimga Qo'shish & Taqsimlash</span>
              </button>
            </div>

            {/* Explanation Breakdown Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  50%
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Zaruriy Ehtiyojlar</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Uy-joy solig'i, kommunal to'lovlar, oziq-ovqat, transport, dorixona va asosiy xarajatlar uchun.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  30%
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Xohish-istaklar</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Kafe, restoran, ko'ngilochar tadbirlar, obunalar, kiyim-kechak va shaxsiy zavqlar uchun.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  20%
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Jamg'arma & Zaxira</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Zaxira fondi (Emergency Fund), maqsadli jamg'armalar va investitsiyalar uchun yo'naltiriladi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131d33] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                {t('addTransaction')}
              </h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    txType === 'expense' ? 'bg-white dark:bg-card text-red-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {t('expense')}
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    txType === 'income' ? 'bg-white dark:bg-card text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {t('income')}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('amount')} (so'm) *
                </label>
                <input
                  type="number"
                  step="10000"
                  required
                  placeholder="masalan: 1500000"
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  autoFocus
                />
              </div>

              {txType === 'income' && (
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5" />
                      50/30/20 Qoidasi bo‘yicha avtomatik bo‘lish
                    </span>
                    <p className="text-[11px] text-emerald-600/80">
                      Daromadni ehtiyoj, istak va zaxiraga bir klikda taqsimlash
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={use503020InTx}
                    onChange={(e) => setUse503020InTx(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('category')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Oziq-ovqat, Transport, Freelance Maosh..."
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('description')}
                </label>
                <input
                  type="text"
                  placeholder="Izoh yozing..."
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Fund Deposit Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131d33] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zaxira Fondiga Qo'shish
              </h3>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEmergencyDeposit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Summa (so'm)
                </label>
                <input
                  type="number"
                  step="100000"
                  required
                  value={emergencyDepositAmount}
                  onChange={(e) => setEmergencyDepositAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  autoFocus
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Zaxiralash (+15 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Savings Modal */}
      {depositModalGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131d33] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
                Mablag' Qo'shish
              </h3>
              <button
                onClick={() => setDepositModalGoalId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Summa (so'm)
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  autoFocus
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoalId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131d33] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                {t('addBudget')}
              </h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategoriya Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Ta'lim, Kompyuter..."
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Oylik Limit (so'm) *
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131d33] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
                {t('addSavings')}
              </h3>
              <button
                onClick={() => setIsSavingsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSavings} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Maqsad Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Yangi MacBook Pro, Sayohat..."
                  value={savingsName}
                  onChange={(e) => setSavingsName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Maqsadli Summa (so'm) *
                </label>
                <input
                  type="number"
                  step="100000"
                  required
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Erishish Muddati
                </label>
                <input
                  type="date"
                  value={savingsDate}
                  onChange={(e) => setSavingsDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSavingsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
