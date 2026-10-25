'use client';

import React, { useState } from 'react';
import { useLifeOS } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  TrendingUp,
  Target,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Calendar,
  Lightbulb,
  ArrowRight,
  Flame,
  X,
  Plus,
  Award,
  Clock,
  Droplets,
  Moon,
  Dumbbell,
  Check,
  BarChart2,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GrowthPage() {
  const t = useTranslations('growth');
  const tNav = useTranslations('nav');
  const [activeTab, setActiveTab] = useState<'kaizen' | 'goals' | 'health'>('kaizen');
  const [isKaizenModalOpen, setIsKaizenModalOpen] = useState(false);
  const [winsText, setWinsText] = useState('');
  const [improvementText, setImprovementText] = useState('');
  const [learningText, setLearningText] = useState('');
  const [rating, setRating] = useState<number>(5);

  const {
    user,
    kaizenEntries,
    addKaizenEntry,
    goals,
    addGoal,
    updateGoalProgress,
    toggleKeyResult,
    healthLogs,
    logHealth,
    habits,
    toggleHabit,
  } = useLifeOS();

  const todayIso = new Date().toISOString().split('T')[0];

  const handleCreateKaizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!improvementText.trim()) return;

    const wins = winsText
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);

    addKaizenEntry({
      wins: wins.length > 0 ? wins : ['Kun rejasini bajardim'],
      improvements: improvementText.trim(),
      learnings: learningText.trim() || 'Kichik qadamlar katta natijaga olib keladi.',
      rating,
    });

    setWinsText('');
    setImprovementText('');
    setLearningText('');
    setIsKaizenModalOpen(false);
  };

  const tabs = [
    { id: 'kaizen', label: t('kaizen'), icon: TrendingUp },
    { id: 'goals', label: t('goals'), icon: Target },
    { id: 'health', label: t('health'), icon: HeartPulse },
  ];

  const todayHealth = healthLogs[todayIso] || {
    waterGlasses: 0,
    sleepHours: 0,
    sleepQuality: 'Yaxshi',
    workoutMinutes: 0,
    workoutType: 'Erkin',
  };

  const completedHabitsToday = habits.filter((h) => h.completedDates.includes(todayIso)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Tab Switcher */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {t('growthTitle')}
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {t('growthSubtitle')}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-border/60 w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'kaizen' && (
          <motion.div
            key="kaizen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Kaizen Compound Formula Hero Card */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                  Kaizen Falsafasi
                </span>
                <h2 className="text-base font-bold text-foreground">
                  Kuniga atigi 1% yaxshilanish yiliga 37 barobar natija beradi
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Katta sakrashlar emas, balki kundalik mayda odatlar, tizimli retrospektiva va o'z xatolaridan to'g'ri xulosa chiqarish muvaffaqiyat garovidir.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white dark:bg-card border border-border p-4 rounded-xl shadow-xs shrink-0">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block">1.00^365</span>
                  <span className="text-lg font-bold text-slate-400">1.0</span>
                </div>
                <span className="text-muted-foreground text-sm font-bold">vs</span>
                <div className="text-center">
                  <span className="text-xs text-amber-600 font-bold block">1.01^365</span>
                  <span className="text-xl font-black text-amber-500">37.8x</span>
                </div>
              </div>
            </div>

            {/* Add Kaizen Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsKaizenModalOpen(true)}
                className="px-4 py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addKaizen')}</span>
              </button>
            </div>

            {/* Retrospectives Journal Feed */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                O'tgan Kunlar Retrospektivasi ({kaizenEntries.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {kaizenEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <span className="text-xs font-mono font-semibold text-primary">
                        {entry.date}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < entry.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Wins */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('todayWins')}
                      </span>
                      <ul className="space-y-1">
                        {entry.wins.map((win, idx) => (
                          <li key={idx} className="text-xs text-foreground font-medium pl-3 border-l-2 border-emerald-500">
                            {win}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvement */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t('improvements')}
                      </span>
                      <p className="text-xs text-foreground bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-2.5 rounded-xl font-medium">
                        {entry.improvements}
                      </p>
                    </div>

                    {/* Learning */}
                    {entry.learnings && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-indigo-500" />
                          {t('learnings')}
                        </span>
                        <p className="text-xs text-muted-foreground italic">
                          "{entry.learnings}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Add Kaizen Modal */}
            {isKaizenModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-lg rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border/70">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      {t('addKaizen')}
                    </h3>
                    <button
                      onClick={() => setIsKaizenModalOpen(false)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateKaizen} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t('todayWins')} (Har birini alohida qatorda yozing)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="1. Yangi modulni tugatdim&#10;2. 2 litr suv ichdim..."
                        value={winsText}
                        onChange={(e) => setWinsText(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t('improvements')} *
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Ertaga ertalabki blokda ijtimoiy tarmoqqa kirmaslik..."
                        value={improvementText}
                        onChange={(e) => setImprovementText(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t('learnings')}
                      </label>
                      <input
                        type="text"
                        placeholder="Bugungi asosiy xulosa..."
                        value={learningText}
                        onChange={(e) => setLearningText(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        {t('dailyRating')}
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-foreground ml-2">
                          {rating} / 5
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsKaizenModalOpen(false)}
                        className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-semibold bg-amber-500 text-white rounded-xl shadow-sm hover:bg-amber-600"
                      >
                        Saqlash (+50 XP)
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Goals Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{t('goals')}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t('goalsSubtitle')}</p>
              </div>
              <button className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('addGoal')}
              </button>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {goal.quarter}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                      {goal.progress}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{goal.category}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      className="bg-primary h-full rounded-full transition-all duration-500"
                    ></motion.div>
                  </div>

                  {/* Key Results */}
                  <div className="space-y-3">
                    {goal.keyResults.map((kr) => (
                      <div key={kr.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground truncate pr-2">{kr.title}</span>
                          <button
                            onClick={() => toggleKeyResult(goal.id, kr.id)}
                            className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-all ${
                              kr.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-border bg-white dark:bg-slate-800 hover:border-primary'
                            }`}
                          >
                            {kr.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${kr.progress}%` }}
                            className="bg-emerald-500 h-full rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {goals.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-card border border-border rounded-2xl">
                <Award className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Hozircha maqsadlar yo'q</h3>
                <p className="text-sm text-muted-foreground mb-6">Birinchi maqsadingizni qo'shing va rivojlaning</p>
                <button className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  {t('addGoal')}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div
            key="health"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Health Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{t('health')}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t('healthSubtitle')}</p>
              </div>
            </div>

            {/* Health Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Water */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground">{t('water')}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Droplets className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{todayHealth.waterGlasses} / 8</div>
                <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (todayHealth.waterGlasses / 8) * 100)}%` }}
                    className="bg-blue-500 h-full rounded-full"
                  ></motion.div>
                </div>
                <button
                  onClick={() => logHealth(todayIso, { waterGlasses: todayHealth.waterGlasses + 1 })}
                  className="mt-3 w-full text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Stakan qo'shish
                </button>
              </motion.div>

              {/* Sleep */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground">{t('sleep')}</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{todayHealth.sleepHours}h</div>
                <div className="text-xs text-muted-foreground mt-1">{todayHealth.sleepQuality}</div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 px-2 py-1.5 text-xs font-semibold bg-indigo-500/10 text-indigo-600 rounded-lg hover:bg-indigo-500/20">-30m</button>
                  <button className="flex-1 px-2 py-1.5 text-xs font-semibold bg-indigo-500/10 text-indigo-600 rounded-lg hover:bg-indigo-500/20">+30m</button>
                </div>
              </motion.div>

              {/* Workout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground">{t('workout')}</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{todayHealth.workoutMinutes} min</div>
                <div className="text-xs text-muted-foreground mt-1">{todayHealth.workoutType}</div>
                <button className="mt-3 w-full text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Mashg'ulot qo'shish
                </button>
              </motion.div>

              {/* Habits Done */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground">{t('habitsDone')}</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{completedHabitsToday} / {habits.length}</div>
                <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${habits.length > 0 ? (completedHabitsToday / habits.length) * 100 : 0}%` }}
                    className="bg-amber-500 h-full rounded-full"
                  ></motion.div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-xs text-muted-foreground">Bugungi odatlaringiz</span>
                </div>
              </motion.div>
            </div>

            {/* Habits Quick Toggle */}
            <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Bugungi Odatlar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {habits.map((habit) => {
                  const isCompletedToday = habit.completedDates.includes(todayIso);
                  return (
                    <motion.button
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id, todayIso)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isCompletedToday
                          ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                          : 'border-border bg-white dark:bg-card hover:border-primary/40 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isCompletedToday
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-border bg-white dark:bg-slate-900'
                          }`}
                        >
                          {isCompletedToday && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isCompletedToday ? 'text-emerald-900 dark:text-emerald-200' : 'text-foreground'}`}>
                            {habit.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> {habit.streak} kun
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Weekly Health Chart Placeholder */}
            <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Haftalik Sog'lik Dinamikasi
              </h3>
              <div className="h-64 bg-slate-50 dark:bg-slate-900/40 rounded-xl flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Grafik tez orada qo'shiladi (Recharts)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}