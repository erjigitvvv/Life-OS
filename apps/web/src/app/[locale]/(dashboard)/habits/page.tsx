'use client';

import React, { useState } from 'react';
import { useLifeOS } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  CheckSquare,
  Plus,
  Flame,
  Trash2,
  X,
  Check,
  Sun,
  Sunset,
  Moon,
  BookOpen,
  Activity,
  Heart,
  Zap,
  Coffee,
  Brain,
  Palette,
  Sparkles,
  Calendar,
  Filter,
} from 'lucide-react';

const HABIT_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#ef4444', // Rose
];

const HABIT_ICONS = [
  { name: 'CheckSquare', icon: CheckSquare },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Activity', icon: Activity },
  { name: 'Heart', icon: Heart },
  { name: 'Zap', icon: Zap },
  { name: 'Coffee', icon: Coffee },
  { name: 'Brain', icon: Brain },
];

const WEEKDAY_NAMES_UZ = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

export default function HabitsPage() {
  const t = useTranslations('habits');
  const { habits, toggleHabit, addHabit, deleteHabit } = useLifeOS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTime, setFilterTime] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [name, setName] = useState('');
  const [targetDays, setTargetDays] = useState(30);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('CheckSquare');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];

  // Generate past 30 days array with weekday information
  const past30Days = React.useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const weekdayIndex = d.getDay();
      days.push({
        iso,
        dayNum: d.getDate(),
        monthName: d.toLocaleString('uz-UZ', { month: 'short' }),
        weekday: WEEKDAY_NAMES_UZ[weekdayIndex],
        isToday: iso === todayIso,
      });
    }
    return days;
  }, [todayIso]);

  // Filtered habits
  const filteredHabits = React.useMemo(() => {
    if (filterTime === 'all') return habits;
    return habits.filter((h) => h.timeOfDay === filterTime);
  }, [habits, filterTime]);

  // Overall Statistics
  const stats = React.useMemo(() => {
    const total = habits.length;
    const completedToday = habits.filter((h) => h.completedDates?.includes(todayIso)).length;
    const completionRate = total > 0 ? Math.round((completedToday / total) * 100) : 0;
    const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0)) : 0;
    const totalCompletionsThisMonth = habits.reduce((sum, h) => {
      const inLast30 = (h.completedDates || []).filter((date) =>
        past30Days.some((p) => p.iso === date)
      ).length;
      return sum + inLast30;
    }, 0);

    return { total, completedToday, completionRate, maxStreak, totalCompletionsThisMonth };
  }, [habits, todayIso, past30Days]);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name: name.trim(),
      targetDays: Number(targetDays) || 30,
      color,
      icon: selectedIcon,
      reminderTime,
      timeOfDay,
    });

    setName('');
    setIsModalOpen(false);
  };

  const renderHabitIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Coffee':
        return <Coffee className={className} />;
      case 'Brain':
        return <Brain className={className} />;
      default:
        return <CheckSquare className={className} />;
    }
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
    <main
      className="min-h-screen bg-[#f1f5f9] dark:bg-[#0b1329] p-4 sm:p-6 lg:p-8 transition-colors duration-300 font-sans select-none"
      style={{ cursor: 'default' }}
    >
      {/* Top Banner & Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#111c33] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {t('title')} (Habit Hub)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t('subtitle')} • Kunlik interaktiv katakchalar (yorqin bajarilgan & xira kutilayotgan kunlar)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('addHabit')}</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {/* Total Active Habits */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Faol Odatlar
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</span>
              <span className="text-xs text-slate-400 font-medium">ta odat</span>
            </div>
          </div>
        </div>

        {/* Today's Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Bugungi Bajarilish
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.completionRate}%</span>
              <span className="text-xs text-slate-400 font-medium">
                ({stats.completedToday}/{stats.total})
              </span>
            </div>
          </div>
        </div>

        {/* Longest Active Streak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Maksimal Streak
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.maxStreak}</span>
              <span className="text-xs text-slate-400 font-medium">kun ketma-ket</span>
            </div>
          </div>
        </div>

        {/* Total Monthly Check-ins */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Oylik Bajarilganlar
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalCompletionsThisMonth}
              </span>
              <span className="text-xs text-slate-400 font-medium">marta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Filter and Legend Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#111c33] rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
        {/* Time of day filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl">
          <button
            onClick={() => setFilterTime('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterTime === 'all'
                ? 'bg-white dark:bg-[#1c2a47] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Barchasi ({habits.length})
          </button>
          <button
            onClick={() => setFilterTime('morning')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              filterTime === 'morning'
                ? 'bg-white dark:bg-[#1c2a47] text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Ertalab
          </button>
          <button
            onClick={() => setFilterTime('afternoon')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              filterTime === 'afternoon'
                ? 'bg-white dark:bg-[#1c2a47] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sunset className="w-3.5 h-3.5" />
            Kunduzi
          </button>
          <button
            onClick={() => setFilterTime('evening')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              filterTime === 'evening'
                ? 'bg-white dark:bg-[#1c2a47] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Kechqurun
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              Yorqin = Bajarilgan
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700/60" />
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Xira = Bajarilmagan
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-800 ring-2 ring-emerald-500 ring-offset-1" />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              Bugungi kun
            </span>
          </div>
        </div>
      </div>

      {/* Habits List with Day-by-Day Interactive Grids */}
      <div className="space-y-5">
        {filteredHabits.map((habit) => {
          const isDoneToday = habit.completedDates?.includes(todayIso);
          const percent = Math.min(100, Math.round((habit.streak / (habit.targetDays || 30)) * 100));
          const habitThemeColor = habit.color || '#10b981';

          return (
            <div
              key={habit.id}
              className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md group relative overflow-hidden"
              style={{ borderLeftColor: habitThemeColor, borderLeftWidth: '5px' }}
            >
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3.5">
                  {/* Today Quick Toggle Button */}
                  <button
                    onClick={() => toggleHabit(habit.id, todayIso)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isDoneToday
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700'
                    }`}
                    title={isDoneToday ? 'Bugun bajarildi (Bekor qilish)' : 'Bugun bajarish uchun bosing'}
                  >
                    <Check className={`w-5 h-5 stroke-[3] ${isDoneToday ? 'opacity-100' : 'opacity-40'}`} />
                  </button>

                  {/* Habit info */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0"
                      style={{ backgroundColor: habitThemeColor }}
                    >
                      {renderHabitIcon(habit.icon, 'w-5 h-5')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 tracking-tight">
                          {habit.name}
                        </h3>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                          {getTimeOfDayIcon(habit.timeOfDay)}
                          {t(habit.timeOfDay)} • {habit.reminderTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          {habit.streak} kunlik streak
                        </span>
                        <span>•</span>
                        <span>Eng yaxshi: {habit.bestStreak} kun</span>
                        <span>•</span>
                        <span>
                          Maqsad: {habit.targetDays || 30} kun ({percent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right controls: Progress bar & Delete */}
                <div className="flex items-center gap-4">
                  <div className="w-40 hidden sm:block">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      <span>Taraqqiyot</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: habitThemeColor }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 30-Day Heatmap Grid */}
              <div className="pt-3.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    30 Kunlik Interaktiv Heatmap
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Katakchani bosib holatni o‘zgartiring
                  </span>
                </div>

                {/* The 30 Cells Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-1.5 sm:gap-2">
                  {past30Days.map((d) => {
                    const completed = (habit.completedDates || []).includes(d.iso);

                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => toggleHabit(habit.id, d.iso)}
                        title={`${d.iso} (${d.weekday}): ${
                          completed ? 'Bajarilgan ✅ (Bekor qilish uchun bosing)' : 'Bajarilmagan ❌ (Bajarish uchun bosing)'
                        }`}
                        className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer relative ${
                          completed
                            ? 'text-white font-bold scale-[1.03] shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-200'
                        } ${
                          d.isToday
                            ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#111c33]'
                            : ''
                        }`}
                        style={{
                          backgroundColor: completed ? habitThemeColor : undefined,
                          boxShadow: completed ? `0 0 12px ${habitThemeColor}66` : undefined,
                        }}
                      >
                        {/* Day number */}
                        <span className="text-xs font-mono font-bold leading-none">{d.dayNum}</span>

                        {/* Weekday abbreviation */}
                        <span
                          className={`text-[9px] mt-0.5 leading-none uppercase ${
                            completed ? 'text-white/80' : 'text-slate-400/80 dark:text-slate-500'
                          }`}
                        >
                          {d.weekday}
                        </span>

                        {/* Mini check badge when completed */}
                        {completed && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredHabits.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#111c33] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
            <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
              Bu toifada odat topilmadi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Yangi odat yaratish uchun yuqoridagi tugmani bosing
            </p>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131d33] p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                {t('addHabit')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('habitName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Kitob mutolaasi, 10 000 qadam..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  autoFocus
                />
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mavzu Iconi
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {HABIT_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedIcon === item.name;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setSelectedIcon(item.name)}
                        className={`p-2.5 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-md scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('targetDays')}
                  </label>
                  <input
                    type="number"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('reminderTime')}
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('timeOfDay')}
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="morning">{t('morning')}</option>
                  <option value="afternoon">{t('afternoon')}</option>
                  <option value="evening">{t('evening')}</option>
                </select>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  Yorqin rang tanlash
                </label>
                <div className="flex items-center gap-3">
                  {HABIT_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-xl transition-all flex items-center justify-center ${
                        color === c
                          ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2 shadow-sm'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition-all"
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
