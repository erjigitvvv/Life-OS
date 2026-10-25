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
} from 'lucide-react';

const HABIT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
const HABIT_ICONS = [
  { name: 'CheckSquare', icon: CheckSquare },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Activity', icon: Activity },
  { name: 'Heart', icon: Heart },
  { name: 'Zap', icon: Zap },
  { name: 'Coffee', icon: Coffee },
  { name: 'Brain', icon: Brain },
];

export default function HabitsPage() {
  const t = useTranslations('habits');
  const { habits, toggleHabit, addHabit, deleteHabit } = useLifeOS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetDays, setTargetDays] = useState(30);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('CheckSquare');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const todayIso = new Date().toISOString().split('T')[0];

  // Generate 30 days array for heatmap grid
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
      className="min-h-screen bg-[#e4ebf5] dark:bg-[#0b1329] p-6 transition-colors duration-300 font-sans select-none"
      style={{ cursor: 'default' }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#e4ebf5] dark:bg-[#111c33] p-6 rounded-2xl shadow-[8px_8px_16px_#b8bec9,-8px_-8px_16px_#ffffff] dark:shadow-[6px_6px_14px_#070c18,-6px_-6px_14px_#1b2c4e]">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-[0_0_12px_#10b981]">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
              {t('title')} (Habit Hub)
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('subtitle')} • 30-day interactive heatmap grids and customized themes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-[#e4ebf5] dark:bg-[#1a263d] rounded-xl shadow-[5px_5px_10px_#b8bec9,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#070c18,-5px_-5px_10px_#1b2c4e] active:shadow-[inset_3px_3px_6px_#b8bec9,inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#070c18,inset_-3px_-3px_6px_#1b2c4e] transition-all duration-150 cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-500" />
          <span>{t('addHabit')}</span>
        </button>
      </div>

      {/* Habits List with Heatmap Grids */}
      <div className="space-y-6">
        {habits.map((habit: any) => {
          const isDoneToday = habit.completedDates.includes(todayIso);
          const percent = Math.min(100, Math.round((habit.streak / (habit.targetDays || 30)) * 100));

          return (
            <div
              key={habit.id}
              className="bg-[#e4ebf5] dark:bg-[#131d31] border border-border/60 rounded-2xl p-6 shadow-[6px_6px_12px_#b8bec9,-6px_-6px_12px_#ffffff] dark:shadow-[5px_5px_10px_#070c17,-5px_-5px_10px_#1c2b45] transition-all duration-200 group relative overflow-hidden"
              style={{ borderLeftColor: habit.color || '#10b981', borderLeftWidth: '6px' }}
            >
              {/* Top row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-300 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  {/* Toggle button */}
                  <button
                    onClick={() => toggleHabit(habit.id, todayIso)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-[4px_4px_8px_#b8bec9,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#070c17,-4px_-4px_8px_#1c2b45] active:shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#070c17,inset_-2px_-2px_4px_#1c2b45] ${
                      isDoneToday ? 'bg-emerald-500 text-white scale-105' : 'bg-[#e4ebf5] dark:bg-[#192742] text-gray-500'
                    }`}
                    title={isDoneToday ? 'Bugun bajarildi' : 'Bugun bajarish'}
                  >
                    <Check className={`w-6 h-6 stroke-[3] ${isDoneToday ? 'opacity-100' : 'opacity-30'}`} />
                  </button>

                  {/* Habit title & icon */}
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-md flex items-center justify-center"
                      style={{ backgroundColor: habit.color || '#10b981' }}
                    >
                      {renderHabitIcon(habit.icon, 'w-5 h-5')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-base text-gray-800 dark:text-gray-100">{habit.name}</h3>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-[#d9e2ef] dark:bg-[#0e1628] px-2.5 py-1 rounded-lg shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#050812,inset_-2px_-2px_4px_#17243e]">
                          {getTimeOfDayIcon(habit.timeOfDay)}
                          {t(habit.timeOfDay)} • {habit.reminderTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Flame className="w-4 h-4 fill-amber-500" />
                          {habit.streak} day streak
                        </span>
                        <span>•</span>
                        <span>Best: {habit.bestStreak} days</span>
                        <span>•</span>
                        <span>Target: {habit.targetDays || 30} days ({percent}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-36 hidden sm:block">
                    <div className="h-2.5 rounded-full bg-[#d9e2ef] dark:bg-[#0e1628] overflow-hidden shadow-[inset_1px_1px_3px_#b8bec9,inset_-1px_-1px_3px_#ffffff] dark:shadow-[inset_1px_1px_3px_#050812,inset_-1px_-1px_3px_#17243e]">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-[0_0_8px_currentColor]"
                        style={{ width: `${percent}%`, backgroundColor: habit.color }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 30-Day Heatmap Grid */}
              <div className="pt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2.5">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{t('matrix')} (Heatmap Grid)</span>
                  <span className="font-mono text-[11px]">Oxirgi 30 kunlik faollik</span>
                </div>

                <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-2">
                  {past30Days.map((d) => {
                    const completed = habit.completedDates.includes(d.iso);
                    return (
                      <div
                        key={d.iso}
                        onClick={() => toggleHabit(habit.id, d.iso)}
                        title={`${d.iso}: ${completed ? 'Bajarilgan ✅' : 'Bajarilmagan ❌'}`}
                        className={`h-8 rounded-lg flex items-center justify-center text-[11px] font-mono cursor-pointer transition-all ${
                          completed
                            ? 'text-white font-bold shadow-[2px_2px_5px_rgba(0,0,0,0.2)] scale-105'
                            : 'bg-[#d9e2ef] dark:bg-[#0e1628] text-gray-400 dark:text-gray-500 hover:bg-gray-300 shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#050812,inset_-2px_-2px_4px_#17243e]'
                        } ${d.isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-[#131d31]' : ''}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#e4ebf5] dark:bg-[#131d33] p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-gray-300 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                {t('addHabit')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t('habitName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Kitob mutolaasi, 10 000 qadam..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#050812,inset_-2px_-2px_4px_#17243e]"
                  autoFocus
                />
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
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
                            : 'bg-[#d9e2ef] dark:bg-[#0b1329] text-gray-600 dark:text-gray-400 shadow-[3px_3px_6px_#b8bec9,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#050812,-3px_-3px_6px_#17243e]'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t('targetDays')}
                  </label>
                  <input
                    type="number"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t('reminderTime')}
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t('timeOfDay')}
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="morning">{t('morning')}</option>
                  <option value="afternoon">{t('afternoon')}</option>
                  <option value="evening">{t('evening')}</option>
                </select>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                  Rang belgisi
                </label>
                <div className="flex items-center gap-3">
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

              <div className="pt-3 border-t border-gray-300 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500 active:scale-95 transition-all"
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
