'use client';

import React, { useState } from 'react';
import { useLifeOS } from '@/lib/store';
import { Habit } from '@lifeos/shared';
import { useTranslations } from 'next-intl';
import {
  CheckSquare,
  Plus,
  Flame,
  Clock,
  Trash2,
  X,
  Check,
  Calendar,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
} from 'lucide-react';

const HABIT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function HabitsPage() {
  const t = useTranslations('habits');
  const { habits, toggleHabit, addHabit, deleteHabit } = useLifeOS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetDays, setTargetDays] = useState(30);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const todayIso = new Date().toISOString().split('T')[0];

  // Generate 30 days array for heatmap
  const getPast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        iso,
        dayNum: d.getDate(),
        isToday: iso === todayIso,
      });
    }
    return days;
  };

  const past30Days = getPast30Days();

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name: name.trim(),
      targetDays: Number(targetDays) || 30,
      color,
      icon: 'CheckSquare',
      reminderTime,
      timeOfDay,
    });

    setName('');
    setIsModalOpen(false);
  };

  const getTimeOfDayIcon = (tod: string) => {
    switch (tod) {
      case 'morning':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'afternoon':
        return <Sunset className="w-3.5 h-3.5 text-orange-500" />;
      default:
        return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('title')}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addHabit')}</span>
        </button>
      </div>

      {/* Habits List with 30-Day Matrix Heatmap */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const isDoneToday = habit.completedDates.includes(todayIso);
          const percent = Math.min(100, Math.round((habit.streak / habit.targetDays) * 100));

          return (
            <div
              key={habit.id}
              className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => toggleHabit(habit.id, todayIso)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                      isDoneToday
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm scale-105'
                        : 'border-border bg-slate-50 dark:bg-slate-900 text-muted-foreground hover:border-emerald-500'
                    }`}
                    title={isDoneToday ? "Bugun bajarildi" : "Bugun bajarish"}
                  >
                    <Check className={`w-5 h-5 stroke-[2.5] ${isDoneToday ? 'opacity-100' : 'opacity-30'}`} />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">{habit.name}</h3>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {getTimeOfDayIcon(habit.timeOfDay)}
                        {t(habit.timeOfDay)} ({habit.reminderTime})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        {habit.streak} kunlik streak
                      </span>
                      <span>•</span>
                      <span>Eng yaxshi: {habit.bestStreak} kun</span>
                      <span>•</span>
                      <span>Maqsad: {habit.targetDays} kun ({percent}%)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 hidden sm:block">
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: habit.color }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 30-Day Grid Heatmap */}
              <div className="pt-3.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground/80">{t('matrix')}</span>
                  <span>Oxirgi 30 kun</span>
                </div>

                <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5">
                  {past30Days.map((d) => {
                    const completed = habit.completedDates.includes(d.iso);
                    return (
                      <div
                        key={d.iso}
                        onClick={() => toggleHabit(habit.id, d.iso)}
                        title={`${d.iso}: ${completed ? 'Bajarilgan' : 'Bajarilmagan'}`}
                        className={`h-7 rounded-md flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all ${
                          completed
                            ? 'text-white font-bold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground/60 hover:bg-slate-200'
                        } ${d.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                        style={{ backgroundColor: completed ? habit.color : undefined }}
                      >
                        {d.dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                {t('addHabit')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('habitName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Kitob mutolaasi, 10 000 qadam..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t('targetDays')}
                  </label>
                  <input
                    type="number"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t('reminderTime')}
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('timeOfDay')}
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="morning">{t('morning')}</option>
                  <option value="afternoon">{t('afternoon')}</option>
                  <option value="evening">{t('evening')}</option>
                </select>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Rang belgisi
                </label>
                <div className="flex items-center gap-2">
                  {HABIT_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
