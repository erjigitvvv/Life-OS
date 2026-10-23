'use client';

import React from 'react';
import { useLifeOS } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  TrendingUp,
  Target,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  PiggyBank,
  CheckSquare,
} from 'lucide-react';

export default function ProgressPage() {
  const { user, habits, goals, tasks, savings } = useLifeOS();

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const taskPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const avgGoalProgress =
    goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Yutuqlar & Progress
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Barcha odatlar, maqsadlar, vazifalar va jamg'armalarning umumiy ko'rsatkichi
          </p>
        </div>

        {/* Life Score & XP */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-600 fill-violet-600" />
            <span>{user.xp} XP • Level {user.level}</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Life Score</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground">{user.lifeScore} / 100</span>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${user.lifeScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Vazifalar</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground">{taskPercent}%</span>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${taskPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Maqsadlar (OKR)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground">{avgGoalProgress}%</span>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${avgGoalProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Faol Streak</span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground">{user.streak} kun</span>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${Math.min(100, user.streak * 5)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habit Streaks Progress */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            Odatlar Davomiyligi (Habit Streaks)
          </h2>

          <div className="space-y-3">
            {habits.map((habit) => {
              const percent = Math.min(100, Math.round((habit.streak / habit.targetDays) * 100));
              return (
                <div
                  key={habit.id}
                  className="p-3.5 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs text-foreground">{habit.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Streak: {habit.streak} / {habit.targetDays} kun
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: habit.color }}
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-foreground w-9 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            OKR Maqsadlar Bajarilishi
          </h2>

          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-3.5 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-xs text-foreground">{goal.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {goal.quarter} • {goal.category}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 w-9 text-right">
                    {goal.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
