'use client';

import React, { useState } from 'react';
import { useLifeOS, HealthLog } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  Heart,
  Droplets,
  Moon,
  Dumbbell,
  Plus,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';

export default function HealthPage() {
  const t = useTranslations('growth');
  const { healthLogs, logHealth } = useLifeOS();

  const healthLogsList: HealthLog[] = Object.values(healthLogs);
  const todayIso = new Date().toISOString().split('T')[0];
  const todayLog = healthLogsList.find((l: HealthLog) => l.date === todayIso) || {
    date: todayIso,
    waterGlasses: 6,
    sleepHours: 7.5,
    sleepQuality: 'good' as const,
    workoutMinutes: 45,
    workoutType: 'Zal mashg‘uloti',
  };

  const [workoutInput, setWorkoutInput] = useState(todayLog.workoutMinutes);
  const [workoutTypeInput, setWorkoutTypeInput] = useState(todayLog.workoutType);

  const handleAddWater = () => {
    logHealth(todayIso, {
      waterGlasses: Math.min(16, (todayLog.waterGlasses || 0) + 1),
    });
  };

  const handleRemoveWater = () => {
    logHealth(todayIso, {
      waterGlasses: Math.max(0, (todayLog.waterGlasses || 0) - 1),
    });
  };

  const handleSetSleepQuality = (quality: 'poor' | 'fair' | 'good' | 'optimal') => {
    logHealth(todayIso, { sleepQuality: quality });
  };

  const handleUpdateSleep = (hours: number) => {
    logHealth(todayIso, { sleepHours: Math.max(0, Math.min(14, hours)) });
  };

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    logHealth(todayIso, {
      workoutMinutes: Number(workoutInput),
      workoutType: workoutTypeInput,
    });
  };

  const waterTarget = 8;
  const waterPercent = Math.min(100, Math.round(((todayLog.waterGlasses || 0) / waterTarget) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500 text-white shadow-sm">
              <Heart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('healthTitle')}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t('healthSubtitle')} • {todayIso}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            <span>Optimal Vital Signs</span>
          </div>
        </div>
      </div>

      {/* Main 3 Health Trackers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Water Tracker */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{t('waterGlasses')}</h3>
                  <span className="text-[11px] text-muted-foreground">
                    Maqsad: {waterTarget} stakan (2.0L)
                  </span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-cyan-600 font-mono">
                {todayLog.waterGlasses} / {waterTarget}
              </span>
            </div>

            {/* Glasses Visual Grid */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[...Array(8)].map((_, i) => {
                const filled = i < todayLog.waterGlasses;
                return (
                  <button
                    key={i}
                    onClick={() => logHealth(todayIso, { waterGlasses: i + 1 })}
                    className={`h-12 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      filled
                        ? 'bg-cyan-500 border-cyan-500 text-white shadow-xs scale-102'
                        : 'border-border bg-slate-50 dark:bg-slate-900 text-muted-foreground/40 hover:border-cyan-400'
                    }`}
                    title={`${i + 1}-stakan (${(i + 1) * 250} ml)`}
                  >
                    <Droplets className={`w-4 h-4 ${filled ? 'fill-white' : ''}`} />
                    <span className="text-[9px] font-mono mt-0.5">250ml</span>
                  </button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Kunlik norma</span>
                <span className="font-bold text-foreground">{waterPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleRemoveWater}
              className="flex-1 py-2 text-xs font-semibold border border-border text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              -1 Stakan
            </button>
            <button
              onClick={handleAddWater}
              className="flex-1 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addGlass')}</span>
            </button>
          </div>
        </div>

        {/* 2. Sleep Monitor */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{t('sleepHours')}</h3>
                  <span className="text-[11px] text-muted-foreground">Optimal: 7.5 - 8.5 soat</span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-indigo-600 font-mono">
                {todayLog.sleepHours}h
              </span>
            </div>

            {/* Sleep Duration Controls */}
            <div className="flex items-center justify-center gap-4 py-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border">
              <button
                onClick={() => handleUpdateSleep(todayLog.sleepHours - 0.5)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-card border border-border text-foreground font-bold shadow-xs hover:bg-slate-100"
              >
                -
              </button>
              <span className="text-2xl font-black text-foreground font-mono">
                {todayLog.sleepHours} <span className="text-xs font-normal text-muted-foreground">soat</span>
              </span>
              <button
                onClick={() => handleUpdateSleep(todayLog.sleepHours + 0.5)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-card border border-border text-foreground font-bold shadow-xs hover:bg-slate-100"
              >
                +
              </button>
            </div>

            {/* Sleep Quality Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                {t('sleepQuality')}:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { key: 'poor', label: 'Yomon' },
                    { key: 'fair', label: 'O‘rtacha' },
                    { key: 'good', label: 'Yaxshi' },
                    { key: 'optimal', label: 'A‘lo' },
                  ] as const
                ).map((sq) => (
                  <button
                    key={sq.key}
                    onClick={() => handleSetSleepQuality(sq.key)}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                      todayLog.sleepQuality === sq.key
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'border-border bg-slate-50 dark:bg-slate-900 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sq.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30 text-[11px] text-indigo-700 dark:text-indigo-300">
            Sirkad ritm: 23:00 - 07:00 oraliqlarida uxlash melatonin ishlab chiqarishini 40% oshiradi.
          </div>
        </div>

        {/* 3. Workout & Fitness Logger */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{t('workoutMinutes')}</h3>
                  <span className="text-[11px] text-muted-foreground">
                    Kunlik faollik va trenajyor
                  </span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-orange-600 font-mono">
                {todayLog.workoutMinutes}m
              </span>
            </div>

            <form onSubmit={handleSaveWorkout} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Mashg'ulot Turi
                </label>
                <select
                  value={workoutTypeInput}
                  onChange={(e) => setWorkoutTypeInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                >
                  <option value="Zal mashg‘uloti">Zal mashg‘uloti (Kuch mashqlari)</option>
                  <option value="Yugurish">Kardio / Yugurish (5 km)</option>
                  <option value="Yoga / Cho‘zilish">Yoga va Cho‘zilish (Flexibility)</option>
                  <option value="Suzish">Suzish</option>
                  <option value="Piyoda yurish">Tez piyoda yurish (10k qadam)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Mashq Davomiyligi (Daqiqa)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={workoutInput}
                  onChange={(e) => setWorkoutInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs transition-all"
              >
                Mashqni Yangilash
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-orange-50/40 dark:bg-orange-950/20 p-2.5 rounded-xl border border-orange-200/50">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Taxminiy sarflangan energiya: ~{todayLog.workoutMinutes * 7} kcal</span>
          </div>
        </div>
      </div>

      {/* Health History Table */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Oxirgi Kunlar Salomatlik Tarixi ({healthLogsList.length} kun)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="pb-2">Sana</th>
                <th className="pb-2">Suv (stakan)</th>
                <th className="pb-2">Uyqu (soat)</th>
                <th className="pb-2">Uyqu Sifati</th>
                <th className="pb-2">Mashg‘ulot (daqiqa)</th>
                <th className="pb-2">Mashq Turi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {healthLogsList.map((log: HealthLog) => (
                <tr key={log.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 font-mono font-bold text-foreground">{log.date}</td>
                  <td className="py-3 font-mono text-cyan-600 font-bold">{log.waterGlasses} / 8</td>
                  <td className="py-3 font-mono text-indigo-600 font-bold">{log.sleepHours}h</td>
                  <td className="py-3">
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-foreground">
                      {log.sleepQuality}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-orange-600 font-bold">{log.workoutMinutes} min</td>
                  <td className="py-3 text-muted-foreground">{log.workoutType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
