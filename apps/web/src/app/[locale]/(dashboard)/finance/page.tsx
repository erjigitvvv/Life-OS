'use client';

import React, { useState, useEffect } from 'react';
import { useLifeOS, Debt } from '@/lib/store';
import { CardStack3D } from '@/components/finance/CardStack3D';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  Trash2,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  HandCoins,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function FinancePage() {
  const t = useTranslations('finance');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'budgets' ? 'budgets' : 'transactions';

  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets'>(initialTab);

  const {
    transactions,
    budgets,
    cards,
    debts = [],
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    addCard,
    updateCardBalance,
    deleteCard,
    addDebt,
    updateDebtPayment,
    toggleDebtCompleted,
    deleteDebt,
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

  // Debt modal and state
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtFilter, setDebtFilter] = useState<'all' | 'borrowed' | 'lent'>('all');
  const [newDebtType, setNewDebtType] = useState<'borrowed' | 'lent'>('borrowed'); // 'borrowed' = oldim, 'lent' = berdim
  const [newDebtPerson, setNewDebtPerson] = useState('');
  const [newDebtAmount, setNewDebtAmount] = useState<number>(0);
  const [newDebtDueDate, setNewDebtDueDate] = useState('');
  const [newDebtNote, setNewDebtNote] = useState('');

  // Payment modal state
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Set default due date to 10 days from now
  useEffect(() => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    setNewDebtDueDate(future.toISOString().split('T')[0]);
  }, []);

  // Sync search param tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'budgets') setActiveTab('budgets');
    if (tabParam === 'transactions') setActiveTab('transactions');
  }, [searchParams]);

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

  // Debts calculations
  const totalBorrowed = debts
    .filter((d) => d.type === 'borrowed' && !d.isCompleted)
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const totalLent = debts
    .filter((d) => d.type === 'lent' && !d.isCompleted)
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const filteredDebts = debts.filter((d) => {
    if (debtFilter === 'borrowed') return d.type === 'borrowed';
    if (debtFilter === 'lent') return d.type === 'lent';
    return true;
  });

  // Countdown timer helper
  const getDebtTimeRemaining = (dueDateStr: string) => {
    if (!dueDateStr) return { status: 'normal', text: 'Muddatsiz' };
    const target = new Date(dueDateStr + 'T23:59:59').getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      const overdueDays = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return {
        status: 'overdue',
        text: `${overdueDays} kun kechikdi!`,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0) {
      return {
        status: 'urgent',
        text: `${hours} soat qoldi`,
      };
    }

    if (days <= 3) {
      return {
        status: 'soon',
        text: `${days} kun, ${hours} soat qoldi`,
      };
    }

    return {
      status: 'normal',
      text: `${days} kun qoldi`,
    };
  };

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
      month: new Date().toISOString().slice(0, 7),
    });

    setBudgetCategory('');
    setIsBudgetModalOpen(false);
  };

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtPerson.trim() || newDebtAmount <= 0 || !newDebtDueDate) return;

    addDebt({
      type: newDebtType,
      person: newDebtPerson.trim(),
      amount: Number(newDebtAmount),
      dueDate: newDebtDueDate,
      note: newDebtNote.trim(),
    });

    setNewDebtPerson('');
    setNewDebtAmount(0);
    setNewDebtNote('');
    setIsDebtModalOpen(false);
  };

  const handleApplyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDebtId || paymentAmount <= 0) return;

    updateDebtPayment(paymentDebtId, Number(paymentAmount));
    setPaymentDebtId(null);
    setPaymentAmount(0);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('title')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Tranzaksiyalar, Byudjet rejalari va Qarzlar/Nasiyalar nazorati
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Only Transactions & Budgets) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabTransactions')}
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'budgets'
                ? 'bg-white dark:bg-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabBudgets')}
          </button>
        </div>
      </div>

      {/* 3D Interactive Apple-Style Card Stack (One click transitions to next card) */}
      <div className="mb-6">
        <CardStack3D
          cards={cards || []}
          onAddCard={addCard}
          onUpdateCardBalance={updateCardBalance}
          onDeleteCard={deleteCard}
        />
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Net Balance */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            {t('totalBalance')}
          </span>
          <p
            className={`text-2xl font-black mt-1.5 font-mono ${
              totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
            }`}
          >
            {totalBalance.toLocaleString()} so'm
          </p>
          <span className="text-xs text-muted-foreground font-medium mt-1 block">
            Kirim: {totalIncome.toLocaleString()} | Chiqim: {totalExpense.toLocaleString()}
          </span>
        </div>

        {/* Monthly Budget Remaining */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            {t('budgetRemaining')}
          </span>
          <p className="text-2xl font-black mt-1.5 text-blue-600 dark:text-blue-400 font-mono">
            {budgetRemaining.toLocaleString()} so'm
          </p>
          <span className="text-xs text-muted-foreground font-medium mt-1 block">
            Jami Limit: {totalBudgetLimit.toLocaleString()} so'm
          </span>
        </div>

        {/* Qarzlarim (Oldim) */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Men Qarz Oldim (Qaytarishim kerak)
            </span>
            <span className="p-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <HandCoins className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black mt-1.5 text-amber-600 dark:text-amber-400 font-mono">
            {totalBorrowed.toLocaleString()} so'm
          </p>
          <span className="text-xs text-muted-foreground font-medium mt-1 block">
            Faol qarzlar yig'indisi
          </span>
        </div>

        {/* Nasiyalarim (Berdim) */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Men Qarz Berdim (Qaytarishlari kerak)
            </span>
            <span className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black mt-1.5 text-emerald-600 dark:text-emerald-400 font-mono">
            {totalLent.toLocaleString()} so'm
          </p>
          <span className="text-xs text-muted-foreground font-medium mt-1 block">
            Qaytarilishi kutilayotgan mablag'
          </span>
        </div>
      </div>

      {/* SECTION: QARZLAR VA NASIYALAR (DEBTS & LOANS) WITH TIMER */}
      <div className="mb-6 bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-foreground">
                Qarzlar & Nasiyalar Nazorati (Timerli Muddatlar)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              "Oldim" (qarzlarim) va "Berdim" (nasiyalarim) hisobi, qaytarish taymeri va to'lov monitoringi
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-border text-xs font-semibold">
              <button
                onClick={() => setDebtFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  debtFilter === 'all' ? 'bg-white dark:bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Barchasi ({debts.length})
              </button>
              <button
                onClick={() => setDebtFilter('borrowed')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  debtFilter === 'borrowed' ? 'bg-white dark:bg-card text-amber-600 shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Oldim
              </button>
              <button
                onClick={() => setDebtFilter('lent')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  debtFilter === 'lent' ? 'bg-white dark:bg-card text-emerald-600 shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Berdim
              </button>
            </div>

            <button
              onClick={() => setIsDebtModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Qarz Qo'shish</span>
            </button>
          </div>
        </div>

        {/* Debt Cards Grid */}
        {filteredDebts.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-xs">
            Hozircha hech qanday qarz yoki nasiya qayd etilmagan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDebts.map((debt) => {
              const timer = getDebtTimeRemaining(debt.dueDate);
              const remainingAmount = Math.max(0, debt.amount - (debt.paidAmount || 0));
              const percentPaid = Math.min(100, Math.round(((debt.paidAmount || 0) / debt.amount) * 100));

              return (
                <div
                  key={debt.id}
                  className={`border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                    debt.isCompleted
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-border opacity-70'
                      : debt.type === 'borrowed'
                      ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-900/40 hover:shadow-md'
                      : 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/40 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Type Tag & Realtime Countdown Timer Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md ${
                          debt.type === 'borrowed'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {debt.type === 'borrowed' ? 'Oldim (Qarz)' : 'Berdim (Nasiya)'}
                      </span>

                      {/* Small Live Countdown Timer */}
                      {!debt.isCompleted ? (
                        <div
                          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                            timer.status === 'overdue'
                              ? 'bg-red-500 text-white animate-pulse'
                              : timer.status === 'urgent' || timer.status === 'soon'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{timer.text}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Yopilgan
                        </span>
                      )}
                    </div>

                    {/* Person & Note */}
                    <div>
                      <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                        {debt.person}
                      </h3>
                      {debt.note && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {debt.note}
                        </p>
                      )}
                    </div>

                    {/* Amounts and Progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-muted-foreground font-medium">Qolgan:</span>
                        <span className="font-mono font-black text-sm text-foreground">
                          {remainingAmount.toLocaleString()} so'm
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            debt.type === 'borrowed' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                        <span>Jami: {debt.amount.toLocaleString()}</span>
                        <span>To'landi: {debt.paidAmount?.toLocaleString() || 0} ({percentPaid}%)</span>
                      </div>
                    </div>

                    {/* Date info */}
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono pt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Qaytarish muddati: <b>{debt.dueDate}</b></span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleDebtCompleted(debt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        debt.isCompleted
                          ? 'bg-slate-200 dark:bg-slate-800 text-muted-foreground'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{debt.isCompleted ? 'Qayta ochish' : 'To‘liq yopildi'}</span>
                    </button>

                    {!debt.isCompleted && (
                      <button
                        onClick={() => {
                          setPaymentDebtId(debt.id);
                          setPaymentAmount(Math.min(remainingAmount, 500000));
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        To'lov qo'shish
                      </button>
                    )}

                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TAB 1: TRANSACTIONS HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-foreground">
                Tranzaksiyalar Tarixi (Kirim & Chiqim)
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

          <div className="divide-y divide-border/60">
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
                    <h3 className="font-bold text-xs sm:text-sm text-foreground">
                      {tx.description}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 font-mono">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-foreground font-semibold">
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
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()} so'm
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
            <h2 className="text-lg font-bold text-foreground">
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
                  className={`bg-white dark:bg-card border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                    isWarning ? 'border-amber-300 dark:border-amber-900/60' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{b.category}</h3>
                      <span className="text-xs text-muted-foreground font-mono">Oylik limit rejam</span>
                    </div>
                    {isWarning && (
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 80%+ Sarflandi
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Sarflandi: {b.spent.toLocaleString()} so'm</span>
                      <span className="text-foreground font-bold">{percent}%</span>
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

                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-border">
                    <span className="text-muted-foreground">Limit: {b.limit.toLocaleString()}</span>
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

      {/* Add Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
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
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
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
                  step="10000"
                  required
                  placeholder="masalan: 1500000"
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
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
                  placeholder="Oziq-ovqat, Transport, Freelance..."
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('description')}
                </label>
                <input
                  type="text"
                  placeholder="Izoh yozing..."
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
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

      {/* Add Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Yangi Byudjet Belgilash</h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Kategoriya Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Restoranlar, Kiyim-kechak..."
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Oylik Limit Summasi (so'm) *</label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Debt Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-emerald-600" />
                <span>Yangi Qarz / Nasiya Qo'shish</span>
              </h3>
              <button
                onClick={() => setIsDebtModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewDebtType('borrowed')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    newDebtType === 'borrowed'
                      ? 'bg-white dark:bg-card text-amber-600 shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  Men Qarz Oldim
                </button>
                <button
                  type="button"
                  onClick={() => setNewDebtType('lent')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    newDebtType === 'lent'
                      ? 'bg-white dark:bg-card text-emerald-600 shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  Men Qarz Berdim
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {newDebtType === 'borrowed' ? 'Kimdan oldingiz? (Shaxs/Tashkilot)' : 'Kimga berdingiz? (Shaxs)'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Akmal aka, TBC Bank..."
                  value={newDebtPerson}
                  onChange={(e) => setNewDebtPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Qarz Summasi (so'm) *
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  placeholder="masalan: 3000000"
                  value={newDebtAmount || ''}
                  onChange={(e) => setNewDebtAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Qaytarish Muddati (Vaqt) *</span>
                </label>
                <input
                  type="date"
                  required
                  value={newDebtDueDate}
                  onChange={(e) => setNewDebtDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Izoh / Sabab
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Mashina ta'miri, maoshgacha..."
                  value={newDebtNote}
                  onChange={(e) => setNewDebtNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Qarzni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partial Payment Modal */}
      {paymentDebtId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Qarzga To'lov Kiritish</h3>
              <button
                onClick={() => setPaymentDebtId(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  To'lanayotgan Summa (so'm) *
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  autoFocus
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentDebtId(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  To'lovni Kiritish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
