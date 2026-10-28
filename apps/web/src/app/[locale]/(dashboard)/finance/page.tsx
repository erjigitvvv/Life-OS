'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLifeOS, Budget, WalletCard, Transaction } from '@/lib/store';
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
  Sparkles,
  ArrowRightLeft,
  TrendingUp,
  Banknote,
  Search,
  Filter,
  SlidersHorizontal,
  PieChart,
  Edit2,
  Check,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';

export default function FinancePage() {
  const t = useTranslations('finance');
  const searchParams = useSearchParams();

  // ONLY 2 MAIN FINANCE MODULES AS REQUESTED
  const tabQuery = searchParams.get('tab');
  const initialTab = tabQuery === 'budgets' ? 'budgets' : 'transactions';
  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets'>(initialTab);

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab === 'budgets' || currentTab === 'transactions') {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const {
    transactions = [],
    budgets = [],
    cards = [],
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addCard,
    updateCardBalance,
    updateCard,
    deleteCard,
    autoAllocate503020,
  } = useLifeOS();

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('Oziq-ovqat');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDesc, setTxDesc] = useState('');
  const [txCardId, setTxCardId] = useState<string>('');

  // Transaction Filters & Search
  const [txFilterType, setTxFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [txSearchQuery, setTxSearchQuery] = useState('');

  // Budget Modal State (Add & Edit)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState<number>(2000000);

  // 50/30/20 Smart Allocator Modal State
  const [is503020ModalOpen, setIs503020ModalOpen] = useState(false);
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState<number>(10000000);

  // Predefined Popular Categories
  const popularCategories = [
    'Oziq-ovqat',
    'Uy-joy & Kommunal',
    'Transport & Yoqilg‘i',
    'Ta\'lim & Kurslar',
    'Salomatlik & Sport',
    'Ko‘ngilochar & Restoran',
    'Kiyim & Shaxsiy',
    'Texnika & Gadjetlar',
    'Kutilmagan xarajatlar',
  ];

  // Calculations: Income, Expense, Balance
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const totalBalance = totalIncome - totalExpense;

  // Total Net balance from cards & cash wallets
  const totalCardBalance = useMemo(
    () => (cards || []).reduce((sum, c) => sum + c.balance, 0),
    [cards]
  );

  // Budget Calculations
  const totalBudgetLimit = useMemo(
    () => budgets.reduce((sum, b) => sum + b.limit, 0),
    [budgets]
  );

  const totalBudgetSpent = useMemo(
    () => budgets.reduce((sum, b) => sum + b.spent, 0),
    [budgets]
  );

  const totalBudgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);
  const budgetSpentPercent =
    totalBudgetLimit > 0
      ? Math.min(100, Math.round((totalBudgetSpent / totalBudgetLimit) * 100))
      : 0;

  // Days left in current month for daily spend recommendation
  const daysLeftInMonth = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.max(1, lastDay - now.getDate());
  }, []);

  const dailyRecommendedSpend = Math.round(totalBudgetRemaining / daysLeftInMonth);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = txFilterType === 'all' || tx.type === txFilterType;
      const matchesSearch =
        tx.description.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
        (tx.cardName && tx.cardName.toLowerCase().includes(txSearchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [transactions, txFilterType, txSearchQuery]);

  // Handle Add Transaction (Mandatory Card Selection + Realtime Balance Sync)
  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) return;
    if (!txCardId) {
      alert("Iltimos, to'lov qaysi karta yoki naqd hamyon orqali amalga oshirilishini tanlang!");
      return;
    }

    const chosenCard = (cards || []).find((c) => c.id === txCardId);

    addTransaction({
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      description: txDesc.trim() || (txType === 'income' ? 'Kirim' : 'Xarajat'),
      date: new Date().toISOString().split('T')[0],
      cardId: txCardId,
      cardName: chosenCard
        ? `${chosenCard.name} (${chosenCard.bankName || chosenCard.type.toUpperCase()})`
        : 'Karta',
    });

    setTxAmount(0);
    setTxDesc('');
    setIsTxModalOpen(false);
  };

  // Handle Create Budget
  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetCategory.trim() || budgetLimit <= 0) return;

    addBudget({
      category: budgetCategory.trim(),
      limit: Number(budgetLimit),
      month: new Date().toISOString().slice(0, 7),
    });

    setBudgetCategory('');
    setBudgetLimit(2000000);
    setIsBudgetModalOpen(false);
  };

  // Handle Edit Budget
  const handleOpenEditBudget = (b: Budget) => {
    setEditingBudgetId(b.id);
    setBudgetCategory(b.category);
    setBudgetLimit(b.limit);
    setIsEditBudgetModalOpen(true);
  };

  const handleSaveEditBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudgetId || budgetLimit <= 0) return;

    updateBudget(editingBudgetId, {
      category: budgetCategory.trim(),
      limit: Number(budgetLimit),
    });

    setIsEditBudgetModalOpen(false);
    setEditingBudgetId(null);
  };

  // Quick Expense for a specific Budget Category
  const handleQuickExpenseForCategory = (category: string) => {
    setTxType('expense');
    setTxCategory(category);
    setTxAmount(0);
    setTxDesc(`${category} xarajati`);
    if (cards?.length && !txCardId) setTxCardId(cards[0].id);
    setIsTxModalOpen(true);
  };

  // Handle 50/30/20 Smart Allocation
  const handleApply503020 = (e: React.FormEvent) => {
    e.preventDefault();
    if (monthlyIncomeInput <= 0) return;
    autoAllocate503020(monthlyIncomeInput, 'Oylik daromad asosida 50/30/20 avtomatik byudjet');
    setIs503020ModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* =========================================================
          TOP HEADER: 2 MAIN MODULES SWITCHER (TRANSACTIONS & BUDGETS)
          ========================================================= */}
      <div className="bg-white dark:bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Moliya Markazi
              </h1>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/60">
                Real-Time DB
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {activeTab === 'transactions'
                ? 'Hamyonlar, kartalar va kirim-chiqim tranzaksiyalari nazorati'
                : 'Oylik xarajat limitlari, kategoriya trackerlari va tejamkorlik rejasi'}
            </p>
          </div>
        </div>

        {/* The 2 Core Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Tranzaksiyalar</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-mono">
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'budgets'
                ? 'bg-white dark:bg-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Budget Planner</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-mono">
              {budgets.length} ta
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================
          MODULE 1: TRANSACTIONS & WALLETS (KIRIM / CHIQIM)
          ========================================================= */}
      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-fade-in">
          {/* 3D Interactive Apple-Style Card Stack */}
          <CardStack3D
            cards={cards || []}
            onAddCard={addCard}
            onUpdateCardBalance={updateCardBalance}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
          />

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Jami Sof Balans
              </span>
              <p className="text-2xl font-black mt-1.5 font-mono text-emerald-600 dark:text-emerald-400">
                {totalCardBalance.toLocaleString()} so'm
              </p>
              <span className="text-xs text-muted-foreground font-medium mt-1 block">
                Barcha kartalar va naqd pul jamg'armasi
              </span>
            </div>

            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Jami Kirim
              </span>
              <p className="text-2xl font-black mt-1.5 font-mono text-emerald-600">
                +{totalIncome.toLocaleString()} so'm
              </p>
              <span className="text-xs text-muted-foreground font-medium mt-1 block">
                Barcha qayd etilgan daromadlar
              </span>
            </div>

            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Jami Chiqim
              </span>
              <p className="text-2xl font-black mt-1.5 font-mono text-rose-600">
                -{totalExpense.toLocaleString()} so'm
              </p>
              <span className="text-xs text-muted-foreground font-medium mt-1 block">
                Barcha sarf-xarajatlar
              </span>
            </div>

            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Tezkor Harakat
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Har bir kirim va chiqim tegishli kartadan avtomatik hisoblanadi.
                </p>
              </div>
              <button
                onClick={() => {
                  if (cards?.length && !txCardId) setTxCardId(cards[0].id);
                  setIsTxModalOpen(true);
                }}
                className="mt-3 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Tranzaksiya Qo'shish</span>
              </button>
            </div>
          </div>

          {/* Transactions List & Table with Live Filters */}
          <div className="bg-white dark:bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                  <span>Tranzaksiyalar Tarixi ({filteredTransactions.length})</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Bajarilgan barcha to'lovlar va daromadlar real vaqtda saqlanadi
                </p>
              </div>

              {/* Filter Buttons & Search */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Qidirish..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-border">
                  <button
                    onClick={() => setTxFilterType('all')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      txFilterType === 'all'
                        ? 'bg-white dark:bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Barchasi
                  </button>
                  <button
                    onClick={() => setTxFilterType('income')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      txFilterType === 'income'
                        ? 'bg-white dark:bg-card text-emerald-600 shadow-xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Kirim
                  </button>
                  <button
                    onClick={() => setTxFilterType('expense')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      txFilterType === 'expense'
                        ? 'bg-white dark:bg-card text-rose-600 shadow-xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Chiqim
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                <p>Hozircha hech qanday tranzaksiya qayd etilmagan.</p>
                <button
                  onClick={() => setIsTxModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Birinchi tranzaksiyani kiritish
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="pb-3">Sana</th>
                      <th className="pb-3">Kategoriya</th>
                      <th className="pb-3">Izoh / Tafsilot</th>
                      <th className="pb-3">To'lov Manbasi (Karta)</th>
                      <th className="pb-3 text-right">Summa</th>
                      <th className="pb-3 text-center">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-mono text-muted-foreground">{tx.date}</td>
                        <td className="py-3.5">
                          <span className="font-bold text-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3.5 text-foreground font-medium">{tx.description}</td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{tx.cardName || 'Asosiy Hamyon'}</span>
                          </span>
                        </td>
                        <td
                          className={`py-3.5 text-right font-mono font-bold text-sm ${
                            tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {tx.amount.toLocaleString()} so'm
                        </td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => {
                              if (confirm('Ushbu tranzaksiyani o\'chirmoqchimisiz? Karta balansi avtomatik tiklanadi.')) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODULE 2: BUDGET PLANNER & TRACKER TABLE (JADVAL)
          ========================================================= */}
      {activeTab === 'budgets' && (
        <div className="space-y-6 animate-fade-in">
          {/* Budget Overview KPI Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Jami Oylik Byudjet
              </span>
              <p className="text-2xl font-black mt-1.5 font-mono text-foreground">
                {totalBudgetLimit.toLocaleString()} so'm
              </p>
              <span className="text-xs text-muted-foreground font-medium mt-1 block">
                {budgets.length} ta kategoriya bo'yicha belgilangan
              </span>
            </div>

            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Haqiqiy Sarflangan
              </span>
              <p className="text-2xl font-black mt-1.5 font-mono text-amber-600">
                {totalBudgetSpent.toLocaleString()} so'm
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetSpentPercent > 90 ? 'bg-rose-500' : budgetSpentPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetSpentPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Qolgan Byudjet Zaxirasi
              </span>
              <p className="text-2xl font-black mt-1.5 font-mono text-emerald-600">
                {totalBudgetRemaining.toLocaleString()} so'm
              </p>
              <span className="text-xs text-muted-foreground font-medium mt-1 block">
                Limitdan ortiqcha sarf qilinmagan qoldiq
              </span>
            </div>

            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Kunlik Tavsiya Xarajat
              </span>
              <p className="text-2xl font-black mt-1.5 font-mono text-primary">
                ~{dailyRecommendedSpend.toLocaleString()} so'm
              </p>
              <span className="text-xs text-muted-foreground font-medium mt-1 block">
                Oy oxirigacha qolgan {daysLeftInMonth} kun uchun
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Dinamik Byudjet Dvigateli</h4>
                <p className="text-[11px] text-muted-foreground">
                  Tranzaksiyalar kiritilganda ushbu jadvaldagi sarflar real vaqtda yangilanadi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIs503020ModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>50/30/20 Smart Rejalash</span>
              </button>

              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Byudjet Qo'shish</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              THE CORE BUDGET TRACKER TABLE (JADVALDA BOSHQARISH)
              ========================================================= */}
          <div className="bg-white dark:bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Oylik Xarajat Byudjetlari Tracker Jadvali</span>
              </h3>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                Umumiy sarf: {budgetSpentPercent}%
              </span>
            </div>

            {budgets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                <p>Hozircha byudjet limitlari belgilanmagan.</p>
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  + Birinchi byudjetni belgilash
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="pb-3">Kategoriya</th>
                      <th className="pb-3 text-right">Oylik Limit</th>
                      <th className="pb-3 text-right">Sarflangan</th>
                      <th className="pb-3 text-right">Qolgan Qoldiq</th>
                      <th className="pb-3 px-4 w-44">Sarf Progressi</th>
                      <th className="pb-3 text-right">Kunlik Tavsiya</th>
                      <th className="pb-3 text-center">Holat</th>
                      <th className="pb-3 text-center">Boshqaruv</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {budgets.map((b) => {
                      const remaining = Math.max(0, b.limit - b.spent);
                      const percent = b.limit > 0 ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0;
                      const dailyCat = Math.round(remaining / daysLeftInMonth);
                      const isOver = b.spent >= b.limit;
                      const isWarning = !isOver && percent >= 75;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground flex items-center justify-center font-bold">
                                {b.category.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-sm text-foreground block">{b.category}</span>
                                <span className="text-[10px] text-muted-foreground">{b.month}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 text-right font-mono font-bold text-foreground">
                            {b.limit.toLocaleString()} so'm
                          </td>

                          <td className="py-4 text-right font-mono font-bold text-amber-600">
                            {b.spent.toLocaleString()} so'm
                          </td>

                          <td className="py-4 text-right font-mono font-bold">
                            <span className={isOver ? 'text-rose-600' : 'text-emerald-600'}>
                              {remaining.toLocaleString()} so'm
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                <span>{percent}%</span>
                                <span>{isOver ? 'Tugadi' : `${100 - percent}% qoldi`}</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-4 text-right font-mono font-semibold text-muted-foreground">
                            ~{dailyCat.toLocaleString()} / kun
                          </td>

                          <td className="py-4 text-center">
                            {isOver ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800/40">
                                🔴 Limit Oshdi
                              </span>
                            ) : isWarning ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800/40">
                                🟡 Chegara Yaqin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40">
                                🟢 Xavfsiz Me'yor
                              </span>
                            )}
                          </td>

                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleQuickExpenseForCategory(b.category)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="Ushbu kategoriyaga xarajat qo'shish"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditBudget(b)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Limitni tahrirlash"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`${b.category} byudjetini o'chirmoqchimisiz?`)) {
                                    deleteBudget(b.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="O'chirish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: ADD TRANSACTION (WITH MANDATORY CARD SELECTOR)
          ========================================================= */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                <span>Yangi Tranzaksiya Qo'shish</span>
              </h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    txType === 'expense'
                      ? 'bg-white dark:bg-card text-rose-600 shadow-xs'
                      : 'text-muted-foreground'
                  }`}
                >
                  Xarajat (Chiqim)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    txType === 'income'
                      ? 'bg-white dark:bg-card text-emerald-600 shadow-xs'
                      : 'text-muted-foreground'
                  }`}
                >
                  Daromad (Kirim)
                </button>
              </div>

              {/* Mandatory Card / Cash Selector */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                  <span>To'lov Manbasi / Karta yoki Naqd Hamyon *</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    Majburiy
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto overscroll-contain p-1 border border-border/80 rounded-xl bg-slate-50/70 dark:bg-slate-900/60">
                  {(cards || []).map((card) => {
                    const isSelected = txCardId === card.id;
                    return (
                      <button
                        type="button"
                        key={card.id}
                        onClick={() => setTxCardId(card.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500 shadow-sm'
                            : 'border-border/60 bg-white dark:bg-card hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              card.type === 'uzcard'
                                ? 'bg-blue-600 text-white'
                                : card.type === 'humo'
                                ? 'bg-orange-500 text-white'
                                : card.type === 'visa'
                                ? 'bg-indigo-900 text-amber-300 font-black'
                                : card.type === 'mastercard'
                                ? 'bg-red-600 text-amber-200 font-bold'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {card.type === 'cash' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-3.5 h-3.5" />}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-foreground truncate">{card.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{card.bankName || card.type}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2 font-mono">
                          <p className="text-xs font-bold text-foreground">{card.balance.toLocaleString()}</p>
                          {isSelected && <span className="text-[9px] font-bold text-emerald-600">✓ Tanlandi</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Summa (so'm) *
                </label>
                <input
                  type="number"
                  step="10000"
                  required
                  placeholder="masalan: 150000"
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kategoriya *
                </label>
                <input
                  type="text"
                  required
                  list="popular-categories"
                  placeholder="Oziq-ovqat, Transport, Ta'lim..."
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                <datalist id="popular-categories">
                  {popularCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Izoh
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Bozorlik, Tushlik, Kitob xaridi..."
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground rounded-xl"
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

      {/* =========================================================
          MODAL 2: ADD NEW BUDGET
          ========================================================= */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Yangi Byudjet Qo'shish</span>
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
                  list="budget-categories"
                  placeholder="Masalan: Oziq-ovqat, Transport..."
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  autoFocus
                />
                <datalist id="budget-categories">
                  {popularCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Oylik Limit Summasi (so'm) *
                </label>
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
                  Byudjetni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: EDIT BUDGET LIMIT
          ========================================================= */}
      {isEditBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                Byudjet Limitini Tahrirlash
              </h3>
              <button
                onClick={() => setIsEditBudgetModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kategoriya Nomi
                </label>
                <input
                  type="text"
                  required
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Oylik Yangi Limit (so'm) *
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditBudgetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  O'zgarishni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: 50/30/20 SMART ALLOCATION
          ========================================================= */}
      {is503020ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>50/30/20 Qoidasi Bo'yicha Byudjet</span>
              </h3>
              <button
                onClick={() => setIs503020ModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply503020} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Oylik Taxminiy Daromadingiz (so'm) *
                </label>
                <input
                  type="number"
                  step="500000"
                  required
                  value={monthlyIncomeInput}
                  onChange={(e) => setMonthlyIncomeInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Preview distribution */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-600">50% Ehtiyojlar (Needs):</span>
                  <span className="font-mono font-bold">
                    {(monthlyIncomeInput * 0.5).toLocaleString()} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-600">30% Xohishlar (Wants):</span>
                  <span className="font-mono font-bold">
                    {(monthlyIncomeInput * 0.3).toLocaleString()} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-600">20% Jamg'arma & Zaxira:</span>
                  <span className="font-mono font-bold">
                    {(monthlyIncomeInput * 0.2).toLocaleString()} so'm
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIs503020ModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Avtomatik Taqsimlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
