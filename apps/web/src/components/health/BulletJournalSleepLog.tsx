'use client';

import React, { useState } from 'react';
import { useLifeOS, HealthLog } from '@/lib/store';
import {
  Moon,
  Sun,
  Sparkles,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  TrendingUp,
  X,
  Edit2,
} from 'lucide-react';

interface SleepEntryData {
  day: number;
  dateStr: string;
  startHour: number; // e.g. 22.5 = 22:30 (10:30 PM)
  endHour: number;   // e.g. 7.25 = 07:15 (7:15 AM)
  quality: 'poor' | 'fair' | 'good' | 'optimal';
  notes?: string;
}

export function BulletJournalSleepLog() {
  const { healthLogs, logHealth } = useLifeOS();

  // Current view month & year (default: October 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [activeEditDay, setActiveEditDay] = useState<number | null>(null);

  // Edit modal inputs
  const [modalBedtime, setModalBedtime] = useState<string>('22:30');
  const [modalWakeTime, setModalWakeTime] = useState<string>('07:15');
  const [modalQuality, setModalQuality] = useState<'poor' | 'fair' | 'good' | 'optimal'>('good');

  // Days in month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate(); // 31 for October

  // 24-hour timeline labels matching the notebook photo:
  // 3 4 5 6 7 8 9 10 11 12 1 2 3 4 5 6 7 8 9 10 11 12 1 2 3
  // Index 0: 3 PM (15:00)
  // Index 7: 10 PM (22:00) -> Target bedtime dashed line
  // Index 16: 7 AM (07:00) -> Target wake up dashed line
  const timelineHours = [
    { label: '3', hour24: 15 },
    { label: '4', hour24: 16 },
    { label: '5', hour24: 17 },
    { label: '6', hour24: 18 },
    { label: '7', hour24: 19 },
    { label: '8', hour24: 20 },
    { label: '9', hour24: 21 },
    { label: '10', hour24: 22, isTargetBedtime: true }, // Dashed line
    { label: '11', hour24: 23 },
    { label: '12', hour24: 0 },
    { label: '1', hour24: 1 },
    { label: '2', hour24: 2 },
    { label: '3', hour24: 3 },
    { label: '4', hour24: 4 },
    { label: '5', hour24: 5 },
    { label: '6', hour24: 6 },
    { label: '7', hour24: 7, isTargetWakeTime: true }, // Dashed line
    { label: '8', hour24: 8 },
    { label: '9', hour24: 9 },
    { label: '10', hour24: 10 },
    { label: '11', hour24: 11 },
    { label: '12', hour24: 12 },
    { label: '1', hour24: 13 },
    { label: '2', hour24: 14 },
    { label: '3', hour24: 15 },
  ];

  // Helper: map a 24-hour time to index on the 24-hour scale starting from 15:00
  // Scale starts at 15:00 (0%). 22:00 is (7/24)*100%. 07:00 next day is (16/24)*100%.
  const timeToPercent = (hour: number, minute: number = 0): number => {
    let normalized = hour + minute / 60;
    if (normalized < 15) {
      normalized += 24; // next day morning
    }
    const offsetFrom15 = normalized - 15;
    return Math.max(0, Math.min(100, (offsetFrom15 / 24) * 100));
  };

  // Convert time string "HH:MM" to percent
  const parseTimeToPercent = (timeStr?: string, defaultHour: number = 22.5): number => {
    if (!timeStr) return timeToPercent(defaultHour);
    const [h, m] = timeStr.split(':').map(Number);
    return timeToPercent(isNaN(h) ? defaultHour : h, isNaN(m) ? 0 : m);
  };

  // Generate realistic default sleep schedules for days 1..31 matching photo
  const photoPresets: Record<number, { start: string; end: string; quality: 'optimal' | 'good' | 'fair' }> = {
    1: { start: '22:30', end: '07:30', quality: 'good' },
    2: { start: '22:00', end: '08:30', quality: 'optimal' },
    3: { start: '22:30', end: '08:00', quality: 'good' },
    4: { start: '22:00', end: '08:30', quality: 'optimal' },
    5: { start: '23:00', end: '06:00', quality: 'fair' },
    6: { start: '22:15', end: '07:15', quality: 'optimal' },
    7: { start: '22:30', end: '07:00', quality: 'good' },
    8: { start: '22:00', end: '07:15', quality: 'optimal' },
    9: { start: '22:30', end: '07:30', quality: 'good' },
    10: { start: '22:00', end: '06:45', quality: 'good' },
    11: { start: '22:45', end: '07:00', quality: 'fair' },
    12: { start: '22:00', end: '06:45', quality: 'good' },
    13: { start: '22:45', end: '07:15', quality: 'good' },
    14: { start: '22:15', end: '07:00', quality: 'optimal' },
    15: { start: '22:30', end: '07:15', quality: 'good' },
    16: { start: '22:15', end: '07:00', quality: 'optimal' },
    17: { start: '22:45', end: '07:45', quality: 'fair' },
    18: { start: '22:00', end: '07:15', quality: 'optimal' },
    19: { start: '22:15', end: '08:15', quality: 'good' },
    20: { start: '22:00', end: '07:00', quality: 'optimal' },
    21: { start: '22:30', end: '07:15', quality: 'good' },
    22: { start: '22:15', end: '07:00', quality: 'optimal' },
    23: { start: '22:45', end: '07:15', quality: 'good' },
    24: { start: '22:00', end: '07:00', quality: 'optimal' },
    25: { start: '22:15', end: '07:30', quality: 'good' },
    26: { start: '22:30', end: '08:00', quality: 'good' },
    27: { start: '22:00', end: '08:15', quality: 'optimal' },
    28: { start: '22:15', end: '07:15', quality: 'optimal' },
    29: { start: '22:30', end: '07:00', quality: 'good' },
    30: { start: '22:00', end: '07:15', quality: 'optimal' },
    31: { start: '22:15', end: '07:30', quality: 'optimal' },
  };

  // Get data for each day in current month
  const daysData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const monthPadded = String(selectedMonth + 1).padStart(2, '0');
    const dayPadded = String(day).padStart(2, '0');
    const dateStr = `${selectedYear}-${monthPadded}-${dayPadded}`;

    const existingLog = healthLogs[dateStr];
    const preset = photoPresets[day] || { start: '22:30', end: '07:15', quality: 'good' };

    const sleepStart = existingLog?.sleepStart || preset.start;
    const sleepEnd = existingLog?.sleepEnd || preset.end;
    const quality = (existingLog?.sleepQuality as any) || preset.quality;

    // Calculate hours
    const startP = parseTimeToPercent(sleepStart);
    const endP = parseTimeToPercent(sleepEnd);
    const widthP = Math.max(5, endP - startP);

    // Calculate duration in hours
    const [sh, sm] = sleepStart.split(':').map(Number);
    const [eh, em] = sleepEnd.split(':').map(Number);
    let durationHours = (eh + em / 60) - (sh + sm / 60);
    if (durationHours < 0) durationHours += 24;

    return {
      day,
      dateStr,
      sleepStart,
      sleepEnd,
      quality,
      startP,
      widthP,
      durationHours: Math.round(durationHours * 10) / 10,
    };
  });

  // Calculate monthly stats
  const totalSleepHours = daysData.reduce((acc, d) => acc + d.durationHours, 0);
  const avgSleep = Math.round((totalSleepHours / daysData.length) * 10) / 10;
  // Consistency: percentage of days between 22:00 and 07:30
  const consistentDays = daysData.filter((d) => {
    const [sh] = d.sleepStart.split(':').map(Number);
    const [eh] = d.sleepEnd.split(':').map(Number);
    return (sh === 22 || sh === 23) && (eh >= 6 && eh <= 8);
  }).length;
  const consistencyRate = Math.round((consistentDays / daysData.length) * 100);

  const handleOpenEdit = (dayData: (typeof daysData)[0]) => {
    setActiveEditDay(dayData.day);
    setModalBedtime(dayData.sleepStart);
    setModalWakeTime(dayData.sleepEnd);
    setModalQuality(dayData.quality);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeEditDay === null) return;

    const monthPadded = String(selectedMonth + 1).padStart(2, '0');
    const dayPadded = String(activeEditDay).padStart(2, '0');
    const dateStr = `${selectedYear}-${monthPadded}-${dayPadded}`;

    const [sh, sm] = modalBedtime.split(':').map(Number);
    const [eh, em] = modalWakeTime.split(':').map(Number);
    let durationHours = (eh + em / 60) - (sh + sm / 60);
    if (durationHours < 0) durationHours += 24;

    logHealth(dateStr, {
      sleepStart: modalBedtime,
      sleepEnd: modalWakeTime,
      sleepHours: Math.round(durationHours * 10) / 10,
      sleepQuality: modalQuality,
    });

    setActiveEditDay(null);
  };

  // Month names
  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Journal Controls */}
      <div className="bg-white dark:bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Moon className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-serif italic">
                  Bullet Journal • Sleep Log
                </h2>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/60">
                  Aesthetic Tracker
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Daftardagi marker chiziqlari uslubidagi oylik sirkad ritm va uyqu barqarorligi monitoringi
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector & Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-border rounded-xl p-1">
            <button
              onClick={() => setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold font-mono text-foreground min-w-[120px] text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={() => setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenEdit(daysData[new Date().getDate() - 1] || daysData[0])}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bugungi Uyquni Qayd Qilish</span>
          </button>
        </div>
      </div>

      {/* Overview Analytics Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">O'rtacha Uyqu</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">{avgSleep}</span>
            <span className="text-xs text-muted-foreground font-medium">soat / kecha</span>
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Optimal me'yor: 7.5 - 8.5 soat
          </p>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rejim Barqarorligi</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{consistencyRate}%</span>
            <span className="text-xs text-muted-foreground font-medium">aniqlik</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">22:00 - 07:00 maqsadli koridor</p>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Kuzatilgan Kunlar</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">{daysData.length}</span>
            <span className="text-xs text-muted-foreground font-medium">/ {daysInMonth} kun</span>
          </div>
          <p className="text-[10px] text-indigo-500 mt-1 font-semibold">100% to'liq qayd etildi</p>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Sirkad Ritm Maqsadi</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500 font-mono">22:00</span>
            <span className="text-xs text-muted-foreground font-mono">→ 07:00</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Punkir chiziqlar orasidagi maydon</p>
        </div>
      </div>

      {/* =========================================================
          THE AUTHENTIC BULLET JOURNAL SHEET (MATCHING PHOTO)
          ========================================================= */}
      <div className="w-full bg-[#fdfbf7] dark:bg-[#151c28] border-2 border-[#2b3547]/20 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Bullet Journal Dot Grid Background Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Notebook Top Title Bar */}
        <div className="relative z-10 max-w-xl mx-auto text-center pb-4 mb-4 border-b-2 border-[#263238]/60 dark:border-slate-700">
          <div className="flex items-center justify-center gap-4">
            {/* Hand-drawn Left Heart Icon */}
            <div className="text-emerald-500 dark:text-emerald-400 rotate-[-12deg] flex gap-1">
              <Heart className="w-4 h-4 fill-emerald-500 stroke-none" />
              <Heart className="w-3 h-3 fill-emerald-500/70 stroke-none" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-[#1a2e26] dark:text-emerald-400 font-mono uppercase">
              — SLEEP LOG —
            </h1>

            {/* Hand-drawn Right Heart Icon */}
            <div className="text-emerald-500 dark:text-emerald-400 rotate-[12deg] flex gap-1">
              <Heart className="w-3 h-3 fill-emerald-500/70 stroke-none" />
              <Heart className="w-4 h-4 fill-emerald-500 stroke-none" />
            </div>
          </div>
        </div>

        {/* Timeline Header Row (Numbers: 3 4 5 6 7 8 9 10 11 12 1 2 3 4 5 6 7 8 9 10 11 12 1 2 3) */}
        <div className="relative z-10 flex items-center border-b-2 border-black/80 dark:border-slate-600 pb-1.5 mb-1 font-mono text-[11px] sm:text-xs font-bold text-foreground">
          {/* Day column label header */}
          <div className="w-9 sm:w-12 text-center text-muted-foreground shrink-0 select-none">
            Kun
          </div>

          {/* 24-Hour Markers */}
          <div className="flex-1 grid grid-cols-24 text-center select-none relative">
            {timelineHours.map((th, idx) => (
              <div
                key={idx}
                className={`truncate ${
                  th.hour24 === 22 || th.hour24 === 7
                    ? 'font-black text-emerald-700 dark:text-emerald-400 scale-110'
                    : 'text-muted-foreground/80'
                }`}
              >
                {th.label}
              </div>
            ))}
          </div>

          <div className="w-16 sm:w-20 text-right text-[10px] text-muted-foreground shrink-0 pr-1 select-none">
            Davomiylik
          </div>
        </div>

        {/* 31 Days Continuous Grid with Stepped Marker Green Highlight */}
        <div className="relative z-10 divide-y divide-black/10 dark:divide-slate-800/80 border-b border-black/40 dark:border-slate-700">
          {/* Target Dashed Guideline Overlays (10 PM at (7/24)*100% and 7 AM at (16/24)*100%) */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-0 border-r-2 border-dashed border-emerald-600/70 dark:border-emerald-500/70"
            style={{
              left: 'calc(2.25rem + (100% - 2.25rem - 4rem) * 0.2917)', // 7/24 ≈ 29.17%
            }}
          />
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-0 border-r-2 border-dashed border-emerald-600/70 dark:border-emerald-500/70"
            style={{
              left: 'calc(2.25rem + (100% - 2.25rem - 4rem) * 0.6667)', // 16/24 ≈ 66.67%
            }}
          />

          {daysData.map((d) => (
            <div
              key={d.day}
              onClick={() => handleOpenEdit(d)}
              className="group flex items-center h-7 sm:h-8 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 cursor-pointer transition-colors relative"
              title={`${d.day}-kun: ${d.sleepStart} dan ${d.sleepEnd} gacha (${d.durationHours} soat). Tahrirlash uchun bosing.`}
            >
              {/* Day Number on Left Margin */}
              <div className="w-9 sm:w-12 text-center text-xs font-mono font-bold text-foreground shrink-0 select-none border-r border-black/20 dark:border-slate-800">
                {d.day}
              </div>

              {/* 24-Hour Ribbon Track */}
              <div className="flex-1 h-full relative mx-1">
                {/* The Green Marker Highlighter Sleep Block (Authentic Watercolor Marker Style) */}
                <div
                  style={{
                    left: `${d.startP}%`,
                    width: `${d.widthP}%`,
                  }}
                  className="absolute top-0.5 bottom-0.5 rounded-xs bg-[#7bc47f]/85 dark:bg-[#48bb78]/80 border-t border-b border-emerald-800/60 dark:border-emerald-400/50 shadow-xs flex items-center justify-between px-1.5 transition-all group-hover:brightness-105 group-hover:shadow-sm"
                >
                  <span className="text-[9px] font-mono font-bold text-[#1a3821] dark:text-[#06240d] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {d.sleepStart}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-[#1a3821] dark:text-[#06240d] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {d.sleepEnd}
                  </span>
                </div>
              </div>

              {/* Duration and Edit hint on right */}
              <div className="w-16 sm:w-20 text-right text-xs font-mono font-bold text-foreground shrink-0 pr-1 select-none flex items-center justify-end gap-1">
                <span>{d.durationHours}h</span>
                <Edit2 className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Legend */}
        <div className="relative z-10 pt-4 mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t border-black/20 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded-xs bg-[#7bc47f]/90 border border-emerald-800/60" />
              <span className="font-semibold text-foreground">Uyqu davomiyligi (Marker)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0 border-t-2 border-dashed border-emerald-600" />
              <span>Maqsad: 22:00 Bedtime va 07:00 Wake-up</span>
            </div>
          </div>

          <span className="text-[11px] font-mono">
            💡 Har qanday kun ustiga bosib uyqu vaqtini tahrirlashingiz mumkin.
          </span>
        </div>
      </div>

      {/* =========================================================
          SLEEP ENTRY / EDIT MODAL
          ========================================================= */}
      {activeEditDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-white dark:bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500 text-white">
                  <Moon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {activeEditDay}-kun Uyqu Qaydi
                </h3>
              </div>
              <button
                onClick={() => setActiveEditDay(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Uxlashga yotgan vaqt (Bedtime) *</span>
                </label>
                <input
                  type="time"
                  required
                  value={modalBedtime}
                  onChange={(e) => setModalBedtime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Uyg'ongan vaqt (Wake-up time) *</span>
                </label>
                <input
                  type="time"
                  required
                  value={modalWakeTime}
                  onChange={(e) => setModalWakeTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Uyqu Sifati
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { key: 'poor', label: 'Yomon' },
                      { key: 'fair', label: 'O‘rtacha' },
                      { key: 'good', label: 'Yaxshi' },
                      { key: 'optimal', label: 'A‘lo' },
                    ] as const
                  ).map((q) => (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => setModalQuality(q.key)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        modalQuality === q.key
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-border bg-slate-50 dark:bg-slate-900 text-muted-foreground'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEditDay(null)}
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
    </div>
  );
}
