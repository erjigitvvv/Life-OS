'use client';

import React, { useState } from 'react';
import { useLifeOS, KaizenEntry } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Plus,
  Star,
  Award,
  Calendar,
  Lightbulb,
  ArrowRight,
  Flame,
  X,
} from 'lucide-react';

export default function KaizenPage() {
  const t = useTranslations('growth');
  const { kaizenEntries, addKaizenEntry } = useLifeOS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winsText, setWinsText] = useState('');
  const [improvementText, setImprovementText] = useState('');
  const [learningText, setLearningText] = useState('');
  const [rating, setRating] = useState<number>(5);

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
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('kaizenTitle')}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t('kaizenSubtitle')} • 1.01^365 = 37.78x compounding effect
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addKaizen')}</span>
        </button>
      </div>

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

      {/* Retrospectives Journal Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          O'tgan Kunlar Retrospektivasi ({kaizenEntries.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {kaizenEntries.map((entry) => (
            <div
              key={entry.id}
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
            </div>
          ))}
        </div>
      </div>

      {/* Add Kaizen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                {t('addKaizen')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
                  onClick={() => setIsModalOpen(false)}
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
          </div>
        </div>
      )}
    </div>
  );
}
