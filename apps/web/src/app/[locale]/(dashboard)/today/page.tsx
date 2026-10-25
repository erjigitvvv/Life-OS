'use client';

import React, { useState } from 'react';
import { useLifeOS } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  Target,
  Flame,
  Zap,
  Trophy,
  CheckCircle2,
  Clock,
  Wallet,
  Sparkles,
  ArrowRight,
  Plus,
  TrendingUp,
  Droplets,
  Moon,
  Calendar,
  Check,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

export default function TodayPage() {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const {
    user,
    tasks,
    habits,
    trackers,
    transactions,
    moveTask,
    addTask,
    toggleHabit,
  } = useLifeOS();

  const todayIso = new Date().toISOString().split('T')[0];

  // Calculate live stats
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;
  const totalTasksCount = tasks.length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const completedHabitsToday = habits.filter((h) => h.completedDates.includes(todayIso)).length;
  const totalHabits = habits.length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;

  // Finance calculations
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: newTaskPriority,
      tags: ['Tezkor'],
      color: '#2563eb',
      icon: 'Target',
      dueDate: todayIso,
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Unified Daily Center & Daily Stats Title */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {tNav('dailyCenter')} & {tNav('dailyStats')}
            </h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Yaxlit Boshqaruv
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Bugungi kunlik markaz vazifalari, odatlar va real vaqt statistikasi yagona sahifada
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addTask')}</span>
          </button>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Life Score */}
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t('lifeScore')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-foreground">{user.lifeScore}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              +4% o'sish
            </span>
          </div>
          <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${user.lifeScore}%` }} />
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t('streak')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-500">{user.streak} kun</span>
            <span className="text-xs font-semibold text-muted-foreground">Eng yaxshi: 25</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">To'xtovsiz rejim davom etmoqda</p>
        </div>

        {/* XP Points */}
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t('xp')}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-indigo-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{user.xp}</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
              XP
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Keyingi darajagacha 180 XP</p>
        </div>

        {/* Level */}
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t('level')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-foreground">Lvl {user.level}</span>
            <span className="text-xs font-bold text-emerald-600">Senior</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Barcha funksiyalar ochiq</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks & Habits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Tasks Checklist */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{t('topTasks')}</h2>
                  <p className="text-xs text-muted-foreground">
                    {completedTasksCount} / {totalTasksCount} bajarildi ({taskCompletionRate}%)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addTask')}</span>
              </button>
            </div>

            {/* Quick Add Task Form */}
            {isAddingTask && (
              <form onSubmit={handleCreateTask} className="mt-4 p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-scale-in">
                <input
                  type="text"
                  placeholder="Vazifa nomi..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewTaskPriority(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                          newTaskPriority === p ? 'bg-primary text-white' : 'bg-white dark:bg-card border border-border text-muted-foreground'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90"
                    >
                      Qo'shish
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Task Item List */}
            <div className="mt-4 space-y-2.5">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  {t('noTasks')}
                </div>
              ) : (
                tasks.slice(0, 5).map((task) => {
                  const isDone = task.status === 'done';
                  return (
                    <div
                      key={task.id}
                      className={`group p-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3.5 ${
                        isDone
                          ? 'border-border/60 bg-slate-50/60 dark:bg-slate-900/30 opacity-75'
                          : 'border-border bg-white dark:bg-card hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5'
                      }`}
                    >
                      <button
                        onClick={() => moveTask(task.id, isDone ? 'todo' : 'done')}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-border bg-white dark:bg-slate-900 hover:border-primary'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            task.priority === 'urgent'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/40'
                              : task.priority === 'high'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {task.tags[0] && (
                          <span className="hidden sm:inline-block text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded-md font-medium">
                            #{task.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border/70 flex justify-end">
              <Link
                href="/uz/board"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Kanban doskasida to'liq ko'rish <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Habits Quick Toggles */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{t('habitsTitle')}</h2>
                  <p className="text-xs text-muted-foreground">
                    Bugun: {completedHabitsToday} / {totalHabits} ({habitCompletionRate}%)
                  </p>
                </div>
              </div>

              <Link
                href="/uz/habits"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Matritsa <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {habits.map((habit) => {
                const isCompletedToday = habit.completedDates.includes(todayIso);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id, todayIso)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                      isCompletedToday
                        ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-border bg-white dark:bg-card hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                          isCompletedToday
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-border bg-white dark:bg-slate-900'
                        }`}
                      >
                        {isCompletedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCompletedToday ? 'text-emerald-900 dark:text-emerald-200' : 'text-foreground'}`}>
                          {habit.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> {habit.streak} kunlik streak
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0">
                      {habit.reminderTime}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Excel Tracker & Finance Widgets & AI Insight */}
        <div className="space-y-6">
          {/* Tracker Overview Widget */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t('timeToday')} (Excel Tracker)
              </h3>
              <Link href="/uz/time" className="text-xs text-primary hover:underline font-semibold">
                Jadval
              </Link>
            </div>

            <div className="space-y-3.5">
              {trackers.slice(0, 3).map((tr) => {
                const todayVal = tr.values[todayIso] || 0;
                const percent = Math.min(100, Math.round((todayVal / tr.goal) * 100));
                return (
                  <div key={tr.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-foreground">{tr.name}</span>
                      <span className="text-primary font-bold">
                        {todayVal} / {tr.goal} {tr.unit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finance Snapshot Widget */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                {t('financeTitle')}
              </h3>
              <Link href="/uz/finance" className="text-xs text-primary hover:underline font-semibold">
                Moliya
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-border/70 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">{t('balance')}</span>
                <span className={`font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {netBalance.toLocaleString()} so'm
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-border/50 text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{totalIncome.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-red-500 font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5" /> -{totalExpense.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* AI Kaizen Insight Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200/70 dark:border-blue-900/40 rounded-2xl p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t('aiInsight')}</span>
            </div>
            <p className="text-xs leading-relaxed text-foreground/90 font-medium">
              "Bugun 4 ta vazifani yakunladingiz! Diqqat blokini 45 daqiqa SM-2 kartalariga va IELTS lug'atiga bag'ishlash tavsiya etiladi."
            </p>
            <Link
              href="/uz/kaizen"
              className="w-full py-2 bg-white dark:bg-card border border-primary/30 rounded-xl text-xs font-bold text-primary flex items-center justify-center gap-1.5 hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <span>{t('getAiCoaching')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
