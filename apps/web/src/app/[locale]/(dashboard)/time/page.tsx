'use client';

import React, { useState } from 'react';
import { useLifeOS, TrackerRow } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  Table,
  Plus,
  Trash2,
  TrendingUp,
  BarChart3,
  Moon,
  CheckCircle,
  BookOpen,
  Droplets,
  Dumbbell,
  Sparkles,
  X,
  Calendar,
  Save,
} from 'lucide-react';

export default function TrackerTablePage() {
  const t = useTranslations('tracker');
  const { trackers, updateTrackerCell, addTracker, deleteTracker } = useLifeOS();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTrackerName, setNewTrackerName] = useState('');
  const [newTrackerUnit, setNewTrackerUnit] = useState('soat');
  const [newTrackerGoal, setNewTrackerGoal] = useState<number>(5);

  // Generate 7 days labels for current week
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    // Monday of current week
    const currentDay = today.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        iso,
        labelKey: dayKeys[i],
        dayNum: d.getDate(),
        isToday: iso === today.toISOString().split('T')[0],
      });
    }
    return days;
  };

  const weekDays = getDaysArray();

  const handleCellBlur = (trackerId: string, dateIso: string, rawVal: string) => {
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      updateTrackerCell(trackerId, dateIso, num);
    }
  };

  const handleCreateTracker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackerName.trim()) return;

    addTracker({
      name: newTrackerName.trim(),
      unit: newTrackerUnit.trim() || 'birlik',
      goal: Number(newTrackerGoal) || 1,
      icon: 'Table',
    });

    setNewTrackerName('');
    setIsAddModalOpen(false);
  };

  const getTrackerIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('uyqu') || lower.includes('sleep')) return <Moon className="w-4 h-4 text-indigo-500" />;
    if (lower.includes('vazifa') || lower.includes('task')) return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (lower.includes('ilm') || lower.includes('study') || lower.includes('o\'qish')) return <BookOpen className="w-4 h-4 text-purple-500" />;
    if (lower.includes('suv') || lower.includes('water')) return <Droplets className="w-4 h-4 text-cyan-500" />;
    if (lower.includes('mashq') || lower.includes('workout')) return <Dumbbell className="w-4 h-4 text-amber-500" />;
    return <Table className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-white shadow-sm">
              <Table className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('title')}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t('subtitle')} • {t('inlineEditTip')}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addTracker')}</span>
        </button>
      </div>

      {/* Excel Spreadsheet Grid Table */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 border-b border-border flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-foreground">Haftalik Interaktiv Kataklar (Hafta kunlari)</span>
          </div>
          <span className="text-muted-foreground font-mono text-[11px]">
            ⚡ Katakchani bosib to'g'ridan-to'g'ri qiymat kiriting
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50/40 dark:bg-slate-900/20 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 min-w-[200px] border-r border-border/60">
                  {t('trackerName')}
                </th>
                <th className="py-3.5 px-3 text-center min-w-[80px] border-r border-border/60">
                  {t('goal')}
                </th>
                {weekDays.map((d) => (
                  <th
                    key={d.iso}
                    className={`py-3.5 px-2 text-center min-w-[80px] border-r border-border/60 ${
                      d.isToday ? 'bg-primary/5 text-primary' : ''
                    }`}
                  >
                    <div>{t(d.labelKey)}</div>
                    <div className="text-[10px] font-normal opacity-70">{d.dayNum}-sana</div>
                  </th>
                ))}
                <th className="py-3.5 px-4 text-center min-w-[100px] border-r border-border/60">
                  {t('total')}
                </th>
                <th className="py-3.5 px-3 text-center w-12"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {trackers.map((tracker) => {
                let rowSum = 0;
                let recordedDays = 0;

                weekDays.forEach((d) => {
                  const val = tracker.values[d.iso];
                  if (typeof val === 'number') {
                    rowSum += val;
                    recordedDays += 1;
                  }
                });

                const average = recordedDays > 0 ? (rowSum / recordedDays).toFixed(1) : '0';

                return (
                  <tr key={tracker.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Tracker Name */}
                    <td className="py-3 px-4 font-semibold text-foreground border-r border-border/60 flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getTrackerIcon(tracker.name)}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">{tracker.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {tracker.unit}
                        </span>
                      </div>
                    </td>

                    {/* Goal */}
                    <td className="py-3 px-3 text-center font-mono font-medium text-muted-foreground border-r border-border/60">
                      {tracker.goal}
                    </td>

                    {/* 7 Days In-Cell Editable Cells */}
                    {weekDays.map((d) => {
                      const currentVal = tracker.values[d.iso] ?? '';
                      const isOverGoal = typeof currentVal === 'number' && currentVal >= tracker.goal;

                      return (
                        <td
                          key={d.iso}
                          className={`p-1.5 text-center border-r border-border/60 ${
                            d.isToday ? 'bg-primary/[0.02]' : ''
                          }`}
                        >
                          <input
                            type="number"
                            step="0.1"
                            defaultValue={currentVal}
                            placeholder="-"
                            onBlur={(e) => handleCellBlur(tracker.id, d.iso, e.target.value)}
                            className={`w-full py-1.5 px-1 text-center font-mono text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                              isOverGoal
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-200'
                                : currentVal !== ''
                                ? 'bg-white dark:bg-card border-border text-foreground font-semibold'
                                : 'bg-transparent border-transparent hover:border-border/60 text-muted-foreground'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Row Average & Total */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-foreground border-r border-border/60">
                      <span className="text-primary">{average}</span>
                      <span className="text-[10px] text-muted-foreground font-normal block">
                        Jami: {rowSum}
                      </span>
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => deleteTracker(tracker.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Statistical Charts & Trends Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trackers.map((tracker) => {
          return (
            <div
              key={tracker.id}
              className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTrackerIcon(tracker.name)}
                  <h3 className="font-bold text-xs text-foreground truncate">{tracker.name}</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-primary">
                  Maqsad: {tracker.goal} {tracker.unit}
                </span>
              </div>

              {/* 7-Day Visual Bars */}
              <div className="pt-2 flex items-end justify-between gap-2 h-28 border-b border-border/60 pb-2">
                {weekDays.map((d) => {
                  const val = tracker.values[d.iso] || 0;
                  const maxDisplay = Math.max(tracker.goal * 1.2, 10);
                  const barHeightPercent = Math.min(100, Math.round((val / maxDisplay) * 100));
                  const reached = val >= tracker.goal;

                  return (
                    <div key={d.iso} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar">
                      <span className="text-[9px] font-mono text-muted-foreground opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {val}
                      </span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            reached ? 'bg-emerald-500' : 'bg-primary'
                          } ${d.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                          style={{ height: `${Math.max(barHeightPercent, val > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold ${d.isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                        {t(d.labelKey)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Maqsad bajarildi
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Jarayonda
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Tracker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Table className="w-4 h-4 text-primary" />
                {t('addTracker')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTracker} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('trackerName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Kitob o'qish, Meditatsiya..."
                  value={newTrackerName}
                  onChange={(e) => setNewTrackerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t('unit')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="soat, stakan, bet..."
                    value={newTrackerUnit}
                    onChange={(e) => setNewTrackerUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t('goal')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newTrackerGoal}
                    onChange={(e) => setNewTrackerGoal(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
