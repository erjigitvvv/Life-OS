'use client';

import React, { useState, useMemo } from 'react';
import { useLifeOS, TrackerRow } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  Table,
  Plus,
  Trash2,
  Calendar,
  Check,
  X as XIcon,
  ChevronDown,
  Moon,
  BookOpen,
  Droplets,
  Dumbbell,
  Sparkles,
  Award,
  Flame,
  BarChart3,
  TrendingUp,
  Percent,
  CheckCircle2,
  SlidersHorizontal,
  Hash,
  SquareCheck,
  Ban,
  Clock,
} from 'lucide-react';

export default function TrackerTablePage() {
  const t = useTranslations('tracker');
  const { trackers = [], updateTrackerCell, addTracker, deleteTracker } = useLifeOS();

  // Selected tracker in dropdown (default to first tracker)
  const [selectedTrackerId, setSelectedTrackerId] = useState<string>(
    trackers[0]?.id || ''
  );

  // View mode: Weekly or Monthly
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  // Input tool selected on right-hand palette: 'number' | 'check' | 'cross'
  const [inputTool, setInputTool] = useState<'number' | 'check' | 'cross'>('number');

  // Modal to add new tracker
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTrackerName, setNewTrackerName] = useState('');
  const [newTrackerUnit, setNewTrackerUnit] = useState('soat');
  const [newTrackerGoal, setNewTrackerGoal] = useState<number>(8);
  const [newTrackerCategory, setNewTrackerCategory] = useState('Productivity');
  // --- REAL-TIME FOCUS / POMODORO TIMER STATE ---
  const [focusSeconds, setFocusSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<'pomodoro' | 'short_break' | 'deep_work'>('pomodoro');
  const [completedSessions, setCompletedSessions] = useState<number>(2);

  // Ticking effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setCompletedSessions((c) => c + 1);
            if (typeof window !== 'undefined' && 'Notification' in window) {
              try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a1/O2ZRoHQZTV7LdiGAU/ldbvtmUYBkKV1u22ZRgGQpTW7bZlGAY/ldbwtmUYBkKV1u22ZRgGQpTW7bZlGAY=').play(); } catch {}
            }
            alert('🎉 Tabriklaymiz! Fokus sessiyasi muvaffaqiyatli yakunlandi! +25 XP qo\'shildi.');
            return focusMode === 'pomodoro' ? 25 * 60 : focusMode === 'deep_work' ? 50 * 60 : 5 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, focusMode]);

  const handleSetFocusMode = (mode: 'pomodoro' | 'short_break' | 'deep_work') => {
    setIsTimerRunning(false);
    setFocusMode(mode);
    if (mode === 'pomodoro') setFocusSeconds(25 * 60);
    else if (mode === 'short_break') setFocusSeconds(5 * 60);
    else if (mode === 'deep_work') setFocusSeconds(50 * 60);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };


  // Active tracker object
  const activeTracker = useMemo(() => {
    return trackers.find((tr) => tr.id === selectedTrackerId) || trackers[0];
  }, [trackers, selectedTrackerId]);

  // Realtime Calendar Days generation
  const calendarDays = useMemo(() => {
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];
    const days: Array<{
      iso: string;
      dayNum: number;
      weekdayName: string;
      isToday: boolean;
      isWeekend: boolean;
    }> = [];

    const weekDayNamesUz = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

    if (viewMode === 'weekly') {
      // Current week (Monday to Sunday)
      const currentDay = today.getDay();
      const distanceToMonday = (currentDay + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - distanceToMonday);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay();
        days.push({
          iso,
          dayNum: d.getDate(),
          weekdayName: weekDayNamesUz[dayOfWeek],
          isToday: iso === todayIso,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        });
      }
    } else {
      // Current month (all days in month)
      const year = today.getFullYear();
      const month = today.getMonth();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= totalDaysInMonth; day++) {
        const d = new Date(year, month, day);
        const iso = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay();
        days.push({
          iso,
          dayNum: day,
          weekdayName: weekDayNamesUz[dayOfWeek],
          isToday: iso === todayIso,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        });
      }
    }

    return days;
  }, [viewMode]);

  // Handle cell click / edit
  const handleCellClick = (dateIso: string) => {
    if (!activeTracker) return;

    if (inputTool === 'check') {
      // Set to goal or 1
      updateTrackerCell(activeTracker.id, dateIso, activeTracker.goal || 1);
    } else if (inputTool === 'cross') {
      // Special indicator for X / missed (e.g. -1)
      const current = activeTracker.values[dateIso];
      updateTrackerCell(activeTracker.id, dateIso, current === -1 ? 0 : -1);
    }
  };

  const handleCellNumberChange = (dateIso: string, rawVal: string) => {
    if (!activeTracker) return;
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      updateTrackerCell(activeTracker.id, dateIso, num);
    } else if (rawVal === '') {
      updateTrackerCell(activeTracker.id, dateIso, 0);
    }
  };

  // Performance statistics for active tracker
  const stats = useMemo(() => {
    if (!activeTracker) return { total: 0, avg: 0, doneDays: 0, missedDays: 0, completionRate: 0, streak: 0 };

    let total = 0;
    let recordedDays = 0;
    let doneDays = 0;
    let missedDays = 0;

    calendarDays.forEach((d) => {
      const val = activeTracker.values[d.iso];
      if (typeof val === 'number') {
        if (val === -1) {
          missedDays++;
        } else if (val > 0) {
          total += val;
          recordedDays++;
          if (val >= (activeTracker.goal || 1)) {
            doneDays++;
          }
        }
      }
    });

    const avg = recordedDays > 0 ? Number((total / recordedDays).toFixed(1)) : 0;
    const completionRate = calendarDays.length > 0 ? Math.round((doneDays / calendarDays.length) * 100) : 0;

    return { total, avg, doneDays, missedDays, completionRate, recordedDays };
  }, [activeTracker, calendarDays]);

  const handleCreateTracker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackerName.trim()) return;

    addTracker({
      name: newTrackerName.trim(),
      unit: newTrackerUnit.trim() || 'birlik',
      goal: Number(newTrackerGoal) || 1,
      category: newTrackerCategory,
      icon: 'Table',
    });

    setNewTrackerName('');
    setIsAddModalOpen(false);
  };

  const getTrackerIcon = (name: string = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('uyqu') || lower.includes('sleep')) return <Moon className="w-5 h-5 text-indigo-500" />;
    if (lower.includes('o\'qish') || lower.includes('ilm') || lower.includes('kitob')) return <BookOpen className="w-5 h-5 text-purple-500" />;
    if (lower.includes('suv') || lower.includes('water')) return <Droplets className="w-5 h-5 text-cyan-500" />;
    if (lower.includes('mashq') || lower.includes('sport') || lower.includes('workout')) return <Dumbbell className="w-5 h-5 text-amber-500" />;
    return <Table className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      {/* Top Header & Dropdown Tracker Selector */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="p-3 rounded-2xl bg-primary text-white shadow-md shadow-primary/20 shrink-0">
            {getTrackerIcon(activeTracker?.name)}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tanlangan Tracker:
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                {activeTracker?.category || 'Umumiy'}
              </span>
            </div>

            {/* Dropdown list to choose tracker */}
            <div className="relative inline-block w-full sm:w-80">
              <select
                value={activeTracker?.id || ''}
                onChange={(e) => setSelectedTrackerId(e.target.value)}
                className="w-full text-lg sm:text-xl font-black text-foreground bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-3.5 py-2 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-xs"
              >
                {trackers.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.name} ({tr.goal} {tr.unit}/kun)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* View Switcher (Weekly vs Monthly) & Add Tracker Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Realtime Calendar View Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-border text-xs font-bold">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Haftalik Ko'rinish (7 kun)
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white dark:bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Oylik Ko'rinish ({new Date().toLocaleString('uz-UZ', { month: 'long' })})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Tracker</span>
          </button>
        </div>
      </div>

      {/* Main Single Tracker Spreadsheet Layout */}
      {activeTracker && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          {/* Main Excel-style Calendar Table (Left 3 cols) */}
          <div className="xl:col-span-3 bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden space-y-0">
            {/* Table Top Info Bar */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-900/40 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-foreground">{activeTracker.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Kunlik maqsad: <b>{activeTracker.goal} {activeTracker.unit}</b>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bajarildi
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Bajarilmadi (X)
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Bugungi kun
                </span>
              </div>
            </div>

            {/* Interactive Grid Spreadsheet */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-slate-50/60 dark:bg-slate-900/20 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 text-center w-12 border-r border-border/60">#</th>
                    <th className="py-3 px-3 min-w-[110px] border-r border-border/60">Hafta Kuni</th>
                    <th className="py-3 px-3 min-w-[100px] border-r border-border/60">Kalendar Sanasi</th>
                    <th className="py-3 px-3 text-center min-w-[160px] border-r border-border/60">
                      Qiymat ({activeTracker.unit}) / Holat
                    </th>
                    <th className="py-3 px-3 text-center min-w-[120px] border-r border-border/60">
                      Bajarilish Holati
                    </th>
                    <th className="py-3 px-3 text-center min-w-[100px]">Natija</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60">
                  {calendarDays.map((d, idx) => {
                    const currentVal = activeTracker.values[d.iso];
                    const isOverGoal = typeof currentVal === 'number' && currentVal >= activeTracker.goal;
                    const isCrossed = currentVal === -1;
                    const isFilled = typeof currentVal === 'number' && currentVal > 0;

                    return (
                      <tr
                        key={d.iso}
                        className={`transition-colors group ${
                          d.isToday
                            ? 'bg-primary/[0.04] dark:bg-primary/[0.08]'
                            : d.isWeekend
                            ? 'bg-slate-50/40 dark:bg-slate-900/20'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Index */}
                        <td className="py-3 px-3 text-center font-mono text-muted-foreground border-r border-border/60">
                          {idx + 1}
                        </td>

                        {/* Weekday name */}
                        <td className="py-3 px-3 font-bold text-foreground border-r border-border/60">
                          <div className="flex items-center gap-2">
                            <span>{d.weekdayName}</span>
                            {d.isToday && (
                              <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                                Bugun
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Realtime Calendar date */}
                        <td className="py-3 px-3 font-mono text-muted-foreground border-r border-border/60">
                          {d.iso}
                        </td>

                        {/* Input Value / Status (Interactive Cell) */}
                        <td className="py-2 px-3 border-r border-border/60">
                          <div className="flex items-center gap-2 justify-center">
                            {/* Number input box */}
                            <input
                              type="number"
                              step="0.1"
                              value={isCrossed ? '' : (currentVal !== undefined && currentVal > 0 ? currentVal : '')}
                              placeholder={isCrossed ? 'X (O‘tkazildi)' : '0'}
                              onChange={(e) => handleCellNumberChange(d.iso, e.target.value)}
                              className={`w-28 py-1.5 px-2.5 text-center font-mono text-xs font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                                isCrossed
                                  ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-300 font-black'
                                  : isOverGoal
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-300'
                                  : isFilled
                                  ? 'bg-white dark:bg-card text-foreground border-border'
                                  : 'bg-slate-50 dark:bg-slate-900/60 border-transparent text-muted-foreground hover:border-border'
                              }`}
                            />

                            {/* Direct Check / Cross Clickable Buttons */}
                            <button
                              onClick={() => {
                                updateTrackerCell(activeTracker.id, d.iso, activeTracker.goal);
                              }}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isOverGoal
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                  : 'text-muted-foreground border-border hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600'
                              }`}
                              title="Galochka (✓) qo'yish"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                updateTrackerCell(activeTracker.id, d.iso, isCrossed ? 0 : -1);
                              }}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isCrossed
                                  ? 'bg-red-500 text-white border-red-500 shadow-xs'
                                  : 'text-muted-foreground border-border hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600'
                              }`}
                              title="X belgisi qo'yish"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Progress status bar */}
                        <td className="py-3 px-3 text-center border-r border-border/60">
                          {isCrossed ? (
                            <span className="text-[11px] font-bold text-red-600 bg-red-100 dark:bg-red-950/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <XIcon className="w-3 h-3" /> Bajarilmadi
                            </span>
                          ) : isOverGoal ? (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> 100% Maqsad
                            </span>
                          ) : isFilled ? (
                            <span className="text-[11px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                              Qisman ({Math.round(((currentVal || 0) / activeTracker.goal) * 100)}%)
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Kiritilmagan</span>
                          )}
                        </td>

                        {/* Result Tag */}
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {isCrossed ? (
                            <span className="text-red-500">0 / {activeTracker.goal}</span>
                          ) : (
                            <span className={isOverGoal ? 'text-emerald-600' : 'text-foreground'}>
                              {currentVal || 0} / {activeTracker.goal} {activeTracker.unit}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Input Mode Palette & Tracker Analytics */}
          <div className="space-y-5">
            {/* Quick Input Tool Selector (Right Palette) */}
            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>O'ng tomon Kiritish Usuli:</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setInputTool('number')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                    inputTool === 'number'
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-border text-foreground hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Hash className="w-4 h-4" />
                    <span>Raqam Kiritish (Aniq qiymat)</span>
                  </div>
                  {inputTool === 'number' && <Check className="w-4 h-4 text-primary" />}
                </button>

                <button
                  onClick={() => setInputTool('check')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                    inputTool === 'check'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shadow-xs'
                      : 'border-border text-foreground hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SquareCheck className="w-4 h-4 text-emerald-500" />
                    <span>Galochka (✓) Rejimi</span>
                  </div>
                  {inputTool === 'check' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => setInputTool('cross')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                    inputTool === 'cross'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 shadow-xs'
                      : 'border-border text-foreground hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Ban className="w-4 h-4 text-red-500" />
                    <span>X Belgisi (Bajarilmadi)</span>
                  </div>
                  {inputTool === 'cross' && <Check className="w-4 h-4 text-red-600" />}
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground pt-1">
                Katak ustida to'g'ridan-to'g'ri raqam yozishingiz yoki yonidagi <b>✓</b> va <b>X</b> tugmachalarini bosishingiz mumkin.
              </p>
            </div>

            {/* Bottom/Side Tracker Performance Stats */}
            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Tracker Ko'rsatkichlari
                </span>
                <span className="text-xs font-bold font-mono text-primary">
                  {stats.completionRate}% Muvaffaqiyat
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Jami to'plangan qiymat:</span>
                  <span className="font-bold font-mono text-foreground">
                    {stats.total} {activeTracker.unit}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Kunlik o'rtacha ko'rsatkich:</span>
                  <span className="font-bold font-mono text-primary">
                    {stats.avg} {activeTracker.unit}/kun
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Bajarilgan kunlar (✓):</span>
                  <span className="font-bold font-mono text-emerald-600">
                    {stats.doneDays} kun
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">O'tkazib yuborilgan (X):</span>
                  <span className="font-bold font-mono text-red-500">
                    {stats.missedDays} kun
                  </span>
                </div>

                {/* Completion rate progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Reja bajarilishi</span>
                    <span>{stats.completionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Danger delete tracker action */}
              <div className="pt-3 border-t border-border flex justify-end">
                <button
                  onClick={() => {
                    if (confirm(`Rostdan ham "${activeTracker.name}" trackerini o'chirmoqchimisiz?`)) {
                      deleteTracker(activeTracker.id);
                      if (trackers.length > 1) {
                        const remaining = trackers.filter((t) => t.id !== activeTracker.id);
                        setSelectedTrackerId(remaining[0]?.id || '');
                      }
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ushbu trackerni o'chirish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Statistical Charts & Trends Section (Ustunlarda ko'rsatkichlar) */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              {activeTracker?.name} — Dinamik Trend & Kunlik Taqsimot Ustunlari
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Maqsad: {activeTracker?.goal} {activeTracker?.unit}
          </span>
        </div>

        {/* Visual Bar Columns */}
        <div className="pt-4 flex items-end justify-between gap-2 h-40 border-b border-border/60 pb-3 overflow-x-auto">
          {calendarDays.map((d) => {
            const val = activeTracker?.values[d.iso] || 0;
            const isCrossed = val === -1;
            const goal = activeTracker?.goal || 1;
            const maxDisplay = Math.max(goal * 1.3, 10);
            const barHeightPercent = isCrossed ? 0 : Math.min(100, Math.round((Math.max(0, val) / maxDisplay) * 100));
            const reached = val >= goal;

            return (
              <div key={d.iso} className="flex-1 min-w-[36px] flex flex-col items-center gap-1.5 h-full justify-end group/bar">
                <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  {isCrossed ? 'X' : val}
                </span>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end overflow-hidden">
                  {isCrossed ? (
                    <div className="w-full h-2 bg-red-400 rounded-t-sm" />
                  ) : (
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        reached ? 'bg-emerald-500' : 'bg-primary'
                      } ${d.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                      style={{ height: `${Math.max(barHeightPercent, val > 0 ? 8 : 0)}%` }}
                    />
                  )}
                </div>

                <div className="text-center">
                  <span className={`text-[10px] block font-semibold ${d.isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {d.weekdayName}
                  </span>
                  <span className="text-[9px] text-muted-foreground block font-mono">
                    {d.dayNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Maqsadga erishildi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Jarayonda
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              Bajarilmadi (X)
            </span>
          </div>

          <span className="text-[11px] font-mono">
            Jami kunlar: <b>{calendarDays.length}</b>
          </span>
        </div>
      </div>

      {/* Add New Tracker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Table className="w-4 h-4 text-primary" />
                <span>Yangi Tracker Qo'shish</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTracker} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tracker Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Kitob o'qish, Uyqu, Suv ichish..."
                  value={newTrackerName}
                  onChange={(e) => setNewTrackerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kategoriya
                </label>
                <select
                  value={newTrackerCategory}
                  onChange={(e) => setNewTrackerCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Productivity">Productivity (Mahsuldorlik)</option>
                  <option value="Health & Sport">Health & Sport (Salomatlik)</option>
                  <option value="Mindset">Mindset (Tafakkur)</option>
                  <option value="General">General (Umumiy)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    O'lchov Birligi
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
                    Kunlik Maqsad
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newTrackerGoal}
                    onChange={(e) => setNewTrackerGoal(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono font-bold"
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
