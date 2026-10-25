'use client';

import React, { useState } from 'react';
import { useLifeOS } from '@/lib/store';
import { Goal } from '@lifeos/shared';
import { useTranslations } from 'next-intl';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

export default function GoalsPage() {
  const t = useTranslations('growth');
  const { goals, toggleKeyResult, addGoal } = useLifeOS();

  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q4');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Karyera');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [kr1, setKr1] = useState('');
  const [kr2, setKr2] = useState('');
  const [kr3, setKr3] = useState('');

  const filteredGoals = goals.filter((g) => g.quarter === selectedQuarter);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const keyResults = [kr1, kr2, kr3]
      .filter((k) => k.trim().length > 0)
      .map((k, i) => ({
        id: `kr-${Date.now()}-${i}`,
        title: k.trim(),
        completed: false,
        progress: 0,
      }));

    addGoal({
      title: title.trim(),
      category: category.trim(),
      quarter: selectedQuarter,
      targetDate,
      progress: 0,
      keyResults: keyResults.length > 0 ? keyResults : [
        { id: `kr-${Date.now()}-1`, title: 'Dastlabki rejalashtirish', completed: false, progress: 0 }
      ],
    });

    setTitle('');
    setKr1('');
    setKr2('');
    setKr3('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('goalsTitle')}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t('goalsSubtitle')}
          </p>
        </div>

        {/* Quarter Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-border/60">
            {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedQuarter === q
                    ? 'bg-white dark:bg-card text-blue-600 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addGoal')}</span>
          </button>
        </div>
      </div>

      {/* OKR Goal Tree Cards */}
      <div className="space-y-5">
        {filteredGoals.length === 0 ? (
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-12 text-center">
            <p className="text-xs text-muted-foreground">Ushbu chorak ({selectedQuarter}) uchun hali maqsadlar belgilanmagan</p>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Objective Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-600 px-2 py-0.5 rounded">
                      {goal.category}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {goal.quarter} • Muddat: {goal.targetDate}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground">{goal.title}</h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                      {goal.progress}% Erishildi
                    </span>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Key Results Checklist Tree */}
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  {t('keyResults')}:
                </span>

                <div className="space-y-2 pl-2">
                  {goal.keyResults.map((kr) => (
                    <div
                      key={kr.id}
                      onClick={() => toggleKeyResult(goal.id, kr.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        kr.completed
                          ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                          : 'border-border bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            kr.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-border bg-white dark:bg-slate-900'
                          }`}
                        >
                          {kr.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            kr.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {kr.title}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        {kr.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                {t('addGoal')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Asosiy Maqsad (Objective) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Q4 da yangi darajaga chiqish..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Kategoriya
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Karyera, Moliya, Salomatlik..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Muddat
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                  />
                </div>
              </div>

              {/* Key Results */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Asosiy Natijalar (Key Results):
                </label>
                <input
                  type="text"
                  placeholder="1. Birinchi o'lchanadigan natija..."
                  value={kr1}
                  onChange={(e) => setKr1(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="2. Ikkinchi o'lchanadigan natija..."
                  value={kr2}
                  onChange={(e) => setKr2(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="3. Uchinchi natija (ixtiyoriy)..."
                  value={kr3}
                  onChange={(e) => setKr3(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-lg"
                />
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
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700"
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
