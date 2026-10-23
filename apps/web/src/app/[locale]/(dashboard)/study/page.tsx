'use client';

import React, { useState } from 'react';
import { useLifeOS, StudyCard, StudyResource } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Layers,
  Clock,
  BookOpen,
  Plus,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Trash2,
  X,
  Sparkles,
  Bookmark,
  Calendar,
  Award,
} from 'lucide-react';

export default function StudyPage() {
  const t = useTranslations('study');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'flashcards';

  const [activeTab, setActiveTab] = useState<'flashcards' | 'queue' | 'resources'>(
    initialTab as any
  );

  const {
    studyCards,
    studyResources,
    rateCard,
    addStudyCard,
    addStudyResource,
    updateStudyResource,
  } = useLifeOS();

  // Active Recall Card state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardDeck, setCardDeck] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<'book' | 'article' | 'course'>('book');
  const [resUrl, setResUrl] = useState('');

  const todayIso = new Date().toISOString().split('T')[0];

  const currentCard = studyCards[currentCardIndex] || studyCards[0];

  const handleRate = (quality: number) => {
    if (!currentCard) return;
    rateCard(currentCard.id, quality);
    setIsFlipped(false);
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;

    addStudyCard({
      deck: cardDeck.trim() || 'Umumiy',
      front: cardFront.trim(),
      back: cardBack.trim(),
    });

    setCardFront('');
    setCardBack('');
    setIsCardModalOpen(false);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    addStudyResource({
      title: resTitle.trim(),
      type: resType,
      url: resUrl.trim() || undefined,
      status: 'want_to_read',
      progress: 0,
    });

    setResTitle('');
    setResUrl('');
    setIsResourceModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('title')}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-border/60">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-card text-purple-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabFlashcards')}
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-white dark:bg-card text-purple-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabQueue')}
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'resources'
                ? 'bg-white dark:bg-card text-purple-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabResources')}
          </button>
        </div>
      </div>

      {/* Tab 1: Active Recall 3D Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">
              Karta {currentCardIndex + 1} / {studyCards.length} • Bo'lim: <b className="text-foreground">{currentCard?.deck}</b>
            </span>
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addCard')}</span>
            </button>
          </div>

          {currentCard ? (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[300px] sm:min-h-[340px] rounded-3xl border-2 border-border/80 bg-white dark:bg-card p-8 shadow-sm hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-800 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-md">
                    {currentCard.deck}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    {isFlipped ? t('back') : t('front')}
                  </span>
                </div>

                <div className="my-auto py-6 text-center">
                  {!isFlipped ? (
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-foreground leading-relaxed">
                        {currentCard.front}
                      </p>
                      <p className="mt-4 text-xs text-muted-foreground font-medium group-hover:text-purple-600 transition-colors">
                        {t('flipCard')}
                      </p>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                        {currentCard.back}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] text-muted-foreground">
                  <span>Interval: {currentCard.interval} kun</span>
                  <span>EF Factor: {currentCard.easinessFactor}</span>
                  <span>Takrorlar: {currentCard.repetitions}</span>
                </div>
              </div>

              {/* SM-2 Algorithm Rating Buttons */}
              {isFlipped && (
                <div className="p-4 bg-white dark:bg-card border border-border rounded-2xl shadow-sm space-y-3 animate-slide-up">
                  <p className="text-xs font-semibold text-center text-muted-foreground">
                    {t('ratePrompt')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => handleRate(0)}
                      className="py-2.5 px-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 font-semibold text-xs hover:bg-red-100 hover:shadow-xs transition-all"
                    >
                      {t('again')}
                    </button>
                    <button
                      onClick={() => handleRate(3)}
                      className="py-2.5 px-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 font-semibold text-xs hover:bg-amber-100 hover:shadow-xs transition-all"
                    >
                      {t('hard')}
                    </button>
                    <button
                      onClick={() => handleRate(4)}
                      className="py-2.5 px-3 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 font-semibold text-xs hover:bg-blue-100 hover:shadow-xs transition-all"
                    >
                      {t('good')}
                    </button>
                    <button
                      onClick={() => handleRate(5)}
                      className="py-2.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 font-semibold text-xs hover:bg-emerald-100 hover:shadow-xs transition-all"
                    >
                      {t('easy')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-card border border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">Hozircha kartochkalar mavjud emas</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Spaced Repetition Queue */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <h2 className="text-sm font-bold text-foreground">Kutilayotgan takrorlashlar navbati</h2>
            <span className="text-xs text-muted-foreground font-mono">Bugun: {todayIso}</span>
          </div>

          <div className="divide-y divide-border/60">
            {studyCards.map((card) => {
              const isDueToday = card.nextReviewDate <= todayIso;
              return (
                <div key={card.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase bg-purple-50 dark:bg-purple-950/40 text-purple-600 px-2 py-0.5 rounded">
                        {card.deck}
                      </span>
                      {isDueToday && (
                        <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 px-2 py-0.5 rounded">
                          Bugun takrorlash kerak
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground">{card.front}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{card.back}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground shrink-0">
                    <div>
                      <span className="text-[10px] block opacity-70">Keyingi sana</span>
                      <span className="font-semibold text-foreground">{card.nextReviewDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block opacity-70">Interval</span>
                      <span>{card.interval} kun</span>
                    </div>
                    <div>
                      <span className="text-[10px] block opacity-70">EF</span>
                      <span>{card.easinessFactor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Resource Library */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsResourceModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addResource')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {studyResources.map((res) => (
              <div
                key={res.id}
                className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded">
                    {t(res.type)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      res.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                        : res.status === 'reading'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40'
                        : 'bg-slate-100 text-muted-foreground'
                    }`}
                  >
                    {t(res.status === 'want_to_read' ? 'wantToRead' : res.status)}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-foreground line-clamp-2">{res.title}</h3>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">O'qilish darajasi</span>
                    <span className="font-bold text-primary">{res.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${res.progress}%` }}
                    />
                  </div>
                </div>

                {res.url && (
                  <div className="pt-2 border-t border-border/60">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      Havolani ochish <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Flashcard Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                {t('addCard')}
              </h3>
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('deck')}
                </label>
                <input
                  type="text"
                  placeholder="masalan: Algoritmlar, IELTS, SOC..."
                  value={cardDeck}
                  onChange={(e) => setCardDeck(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/40"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('front')} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Savol yoki tushuncha..."
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('back')} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Javob yoki ta'rif..."
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/40"
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl shadow-sm hover:bg-purple-700"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                {t('addResource')}
              </h3>
              <button
                onClick={() => setIsResourceModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Resurs Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Designing Data-Intensive Applications..."
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/40"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('resourceType')}
                </label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/40"
                >
                  <option value="book">{t('book')}</option>
                  <option value="article">{t('article')}</option>
                  <option value="course">{t('course')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Havola (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/40"
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl shadow-sm hover:bg-purple-700"
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
