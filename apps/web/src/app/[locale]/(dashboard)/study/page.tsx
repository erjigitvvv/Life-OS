'use client';

import React, { useState } from 'react';
import { useLifeOS, SkillStatus, LearningRoadmap } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  Shield,
  GraduationCap,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Plus,
  RotateCcw,
  ExternalLink,
  Award,
  Zap,
  Filter,
  Check,
  PlayCircle,
  HelpCircle,
  X,
} from 'lucide-react';

export default function StudyPage() {
  const t = useTranslations('study');
  const {
    roadmaps,
    toggleTopicStatus,
    addRoadmapTopic,
    addRoadmap,
    addRoadmapStage,
    studyCards,
    rateCard,
    addStudyCard,
    studyResources,
    addStudyResource,
  } = useLifeOS();

  const [activeTab, setActiveTab] = useState<'roadmap' | 'flashcards' | 'resources'>('roadmap');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(
    roadmaps?.[0]?.id || 'roadmap-cybersecurity'
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');

  
  // New Roadmap Modal State
  const [isAddRoadmapOpen, setIsAddRoadmapOpen] = useState(false);
  const [newRoadmapTitle, setNewRoadmapTitle] = useState('');
  const [newRoadmapCategory, setNewRoadmapCategory] = useState<'cybersecurity' | 'ielts' | 'programming' | 'other'>('programming');
  const [newRoadmapDesc, setNewRoadmapDesc] = useState('');
  const [newRoadmapDays, setNewRoadmapDays] = useState<number>(30);

  // New Stage Modal State
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newStageDuration, setNewStageDuration] = useState('2 hafta');

  // New Topic Modal State
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [targetStageId, setTargetStageId] = useState<string>('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDuration, setNewTopicDuration] = useState('4 soat');

  // Flashcards state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardDeck, setNewCardDeck] = useState('Kiberxavfsizlik');

  // Selected roadmap
  const activeRoadmap = React.useMemo(() => {
    return roadmaps?.find((r) => r.id === selectedRoadmapId) || roadmaps?.[0];
  }, [roadmaps, selectedRoadmapId]);

  // Overall roadmap statistics
  const roadmapStats = React.useMemo(() => {
    if (!activeRoadmap) return { totalTopics: 0, completedTopics: 0, inProgressTopics: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    let inProgress = 0;

    activeRoadmap.stages.forEach((stage) => {
      stage.topics.forEach((t) => {
        total++;
        if (t.status === 'completed') completed++;
        if (t.status === 'in_progress') inProgress++;
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalTopics: total, completedTopics: completed, inProgressTopics: inProgress, percent };
  }, [activeRoadmap]);

  
  const handleCreateRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoadmapTitle.trim()) return;

    addRoadmap({
      title: newRoadmapTitle.trim(),
      description: newRoadmapDesc.trim() || 'Shaxsiy o‘quv rejasi',
      category: newRoadmapCategory,
      icon: 'GraduationCap',
      color: 'emerald',
      stages: [
        {
          id: 'stage-' + Date.now(),
          title: 'Asosiy Boshlang‘ich Tushunchalar',
          description: '1-2 hafta',
          topics: [],
        },
      ],
    });

    setNewRoadmapTitle('');
    setNewRoadmapDesc('');
    setIsAddRoadmapOpen(false);
  };

  const handleCreateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim() || !activeRoadmap) return;

    addRoadmapStage(activeRoadmap.id, newStageTitle.trim(), newStageDuration.trim() || '2 hafta');
    setNewStageTitle('');
    setIsAddStageOpen(false);
  };

  const handleAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !activeRoadmap || !targetStageId) return;

    addRoadmapTopic(activeRoadmap.id, targetStageId, {
      title: newTopicTitle.trim(),
      status: 'not_started',
      duration: newTopicDuration.trim() || '3 soat',
    });

    setNewTopicTitle('');
    setIsAddTopicOpen(false);
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardFront.trim() || !newCardBack.trim()) return;

    addStudyCard({
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      deck: newCardDeck.trim(),
    });

    setNewCardFront('');
    setNewCardBack('');
    setIsAddCardOpen(false);
  };

  const renderRoadmapIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-5 h-5 text-emerald-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      default:
        return <GraduationCap className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <main className="min-h-screen bg-[#f1f5f9] dark:bg-[#0b1329] p-4 sm:p-6 lg:p-8 font-sans select-none">
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#111c33] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Bosqichma-bosqich o‘quv xaritalari (Cybersecurity & IELTS), Active Recall kartalar va bilimlar bazasi
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'roadmap'
                ? 'bg-white dark:bg-[#1c2a47] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ta‘lim Xaritalari</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-[#1c2a47] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('tabFlashcards')}</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'resources'
                ? 'bg-white dark:bg-[#1c2a47] text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('tabResources')}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ROADMAP & SKILL TRACKER */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          
          {/* Header row with Add Roadmap button */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>O'quv Xaritalari (Roadmaps)</span>
            </h2>
            <button
              onClick={() => setIsAddRoadmapOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Roadmap</span>
            </button>
          </div>

          {/* Roadmap Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmaps?.map((rm) => {
              const isSelected = rm.id === selectedRoadmapId;
              let comp = 0;
              let tot = 0;
              rm.stages.forEach((s) => {
                s.topics.forEach((t) => {
                  tot++;
                  if (t.status === 'completed') comp++;
                });
              });
              const pct = tot > 0 ? Math.round((comp / tot) * 100) : 0;

              return (
                <div
                  key={rm.id}
                  onClick={() => setSelectedRoadmapId(rm.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-white dark:bg-[#111c33] border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white/80 dark:bg-[#111c33]/70 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                        {renderRoadmapIcon(rm.icon)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 leading-tight">
                          {rm.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md mt-1 inline-block">
                          {rm.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {pct}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {rm.description}
                  </p>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Roadmap Detailed View */}
          {activeRoadmap && (
            <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header Details */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Tanlangan Yo‘nalish
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {activeRoadmap.stages.length} ta asosiy bosqich
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                    {activeRoadmap.title}
                  </h2>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === 'all'
                        ? 'bg-white dark:bg-[#1c2a47] text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Barchasi ({roadmapStats.totalTopics})
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      statusFilter === 'completed'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Bajarilgan ({roadmapStats.completedTopics})
                  </button>
                  <button
                    onClick={() => setStatusFilter('in_progress')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === 'in_progress'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
                    }`}
                  >
                    Jarayonda ({roadmapStats.inProgressTopics})
                  </button>
                </div>
              </div>

              {/* Curriculum Stages Tree */}
              <div className="space-y-6">
                {activeRoadmap.stages.map((stage, stageIndex) => {
                  const stageTotal = stage.topics.length;
                  const stageCompleted = stage.topics.filter((t) => t.status === 'completed').length;
                  const stagePercent = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;

                  const visibleTopics = stage.topics.filter((t) => {
                    if (statusFilter === 'completed') return t.status === 'completed';
                    if (statusFilter === 'in_progress') return t.status === 'in_progress';
                    if (statusFilter === 'not_started') return t.status === 'not_started';
                    return true;
                  });

                  return (
                    <div
                      key={stage.id}
                      className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-5 bg-slate-50/50 dark:bg-slate-900/30 space-y-4"
                    >
                      {/* Stage Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {stageIndex + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                              {stage.title}
                            </h3>
                            {stage.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {stage.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {stageCompleted}/{stageTotal} mavzu
                            </span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              ({stagePercent}%)
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setTargetStageId(stage.id);
                              setIsAddTopicOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Yangi mavzu qo'shish"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Topics Grid: Interactive Cells */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {visibleTopics.map((topic) => {
                          const isDone = topic.status === 'completed';
                          const isInProg = topic.status === 'in_progress';

                          return (
                            <div
                              key={topic.id}
                              onClick={() => toggleTopicStatus(activeRoadmap.id, stage.id, topic.id)}
                              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group select-none ${
                                isDone
                                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20 hover:bg-emerald-600 scale-[1.02]'
                                  : isInProg
                                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-slate-800 dark:text-slate-100 hover:border-blue-400'
                                  : 'bg-white dark:bg-[#111c33] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                      isDone
                                        ? 'bg-white/20 text-white'
                                        : isInProg
                                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}
                                  >
                                    {isDone ? 'Tugatildi ✅' : isInProg ? 'O‘rganilmoqda ⏳' : 'Kutilmoqda ⚪'}
                                  </span>

                                  {/* Status indicator icon */}
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                                  ) : isInProg ? (
                                    <PlayCircle className="w-4 h-4 text-blue-500 shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                                  )}
                                </div>

                                <h4
                                  className={`font-bold text-xs leading-snug line-clamp-3 ${
                                    isDone ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {topic.title}
                                </h4>
                              </div>

                              <div className="pt-3 mt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
                                <span
                                  className={`flex items-center gap-1 font-mono ${
                                    isDone ? 'text-white/80' : 'text-slate-400'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {topic.duration || '3 soat'}
                                </span>

                                <span
                                  className={`font-semibold text-[10px] ${
                                    isDone ? 'text-white font-bold' : 'text-emerald-600 dark:text-emerald-400'
                                  }`}
                                >
                                  {isDone ? '+20 XP' : 'Bosib o‘zgartiring'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {visibleTopics.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">
                          Bu toifada mavzular topilmadi.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE RECALL (SM-2 FLASHCARDS) */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                SuperMemo SM-2 Takrorlash Tizimi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bilimlarni uzoq muddatli xotirada mustahkamlash uchun intervalli takrorlash
              </p>
            </div>
            <button
              onClick={() => setIsAddCardOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-500 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addCard')}</span>
            </button>
          </div>

          {studyCards && studyCards.length > 0 ? (
            <div className="space-y-4">
              {/* Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[260px] p-8 rounded-2xl bg-white dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 shadow-lg cursor-pointer flex flex-col justify-between transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-primary px-2.5 py-1 bg-primary/10 rounded-md">
                    {studyCards[activeCardIndex % studyCards.length]?.deck || 'Umumiy'}
                  </span>
                  <span>
                    Karta {((activeCardIndex % studyCards.length) + 1)} / {studyCards.length}
                  </span>
                </div>

                <div className="text-center py-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    {isFlipped ? t('back') : t('front')}
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                    {isFlipped
                      ? studyCards[activeCardIndex % studyCards.length]?.back
                      : studyCards[activeCardIndex % studyCards.length]?.front}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('flipCard')}</span>
                </div>
              </div>

              {/* SM-2 Rating Quality Buttons (Shown when flipped) */}
              {isFlipped && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in space-y-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block text-center">
                    {t('ratePrompt')}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        const card = studyCards[activeCardIndex % studyCards.length];
                        if (card) rateCard(card.id, 0);
                        setIsFlipped(false);
                        setActiveCardIndex((prev) => prev + 1);
                      }}
                      className="py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-bold hover:bg-red-100 transition-all text-center"
                    >
                      {t('again')}
                    </button>
                    <button
                      onClick={() => {
                        const card = studyCards[activeCardIndex % studyCards.length];
                        if (card) rateCard(card.id, 3);
                        setIsFlipped(false);
                        setActiveCardIndex((prev) => prev + 1);
                      }}
                      className="py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 text-xs font-bold hover:bg-amber-100 transition-all text-center"
                    >
                      {t('hard')}
                    </button>
                    <button
                      onClick={() => {
                        const card = studyCards[activeCardIndex % studyCards.length];
                        if (card) rateCard(card.id, 4);
                        setIsFlipped(false);
                        setActiveCardIndex((prev) => prev + 1);
                      }}
                      className="py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-xs font-bold hover:bg-blue-100 transition-all text-center"
                    >
                      {t('good')}
                    </button>
                    <button
                      onClick={() => {
                        const card = studyCards[activeCardIndex % studyCards.length];
                        if (card) rateCard(card.id, 5);
                        setIsFlipped(false);
                        setActiveCardIndex((prev) => prev + 1);
                      }}
                      className="py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-all text-center"
                    >
                      {t('easy')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-[#111c33] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
                Hozircha kartalar mavjud emas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Yangi Flashcard qo‘shib o‘rganishni boshlang
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESOURCES LIBRARY */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Resurslar Kutubxonasi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kitoblar, amaliy maqolalar va o‘quv kurslari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyResources?.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider text-[10px] bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                      {res.type}
                    </span>
                    <span className="font-semibold text-slate-500 text-[11px]">
                      {res.status === 'completed'
                        ? 'Tugatilgan ✅'
                        : res.status === 'reading'
                        ? 'O‘qilmoqda 📖'
                        : 'Rejada 📌'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug">
                    {res.title}
                  </h3>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="font-bold font-mono">{res.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${res.progress || 0}%` }}
                    />
                  </div>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold mt-3 hover:underline"
                    >
                      <span>Resurs havolasi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {/* Add Roadmap Modal */}
      {isAddRoadmapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131d33] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Yangi O'quv Roadmapini Yaratish</span>
              </h3>
              <button
                onClick={() => setIsAddRoadmapOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoadmap} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Roadmap Nomi (Yo'nalish) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Full-Stack Next.js, Python AI, IELTS 7.5..."
                  value={newRoadmapTitle}
                  onChange={(e) => setNewRoadmapTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={newRoadmapCategory}
                    onChange={(e) => setNewRoadmapCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="programming">Dasturlash & IT</option>
                    <option value="cybersecurity">Kiberxavfsizlik</option>
                    <option value="ielts">Chet Tillari (IELTS)</option>
                    <option value="other">Boshqa soha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Maqsadli muddat (kun)
                  </label>
                  <input
                    type="number"
                    min="7"
                    required
                    value={newRoadmapDays}
                    onChange={(e) => setNewRoadmapDays(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qisqacha Tavsif
                </label>
                <textarea
                  rows={2}
                  placeholder="Maqsad va natijalar haqida..."
                  value={newRoadmapDesc}
                  onChange={(e) => setNewRoadmapDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoadmapOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Roadmapni Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stage Modal */}
      {isAddStageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131d33] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Yangi Bosqich (Stage) Qo'shish
              </h3>
              <button
                onClick={() => setIsAddStageOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bosqich Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Backend API & Auth, Advanced Writing..."
                  value={newStageTitle}
                  onChange={(e) => setNewStageTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Taxminiy Davomiyligi
                </label>
                <input
                  type="text"
                  placeholder="masalan: 2 hafta, 10 kun..."
                  value={newStageDuration}
                  onChange={(e) => setNewStageDuration(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStageOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Bosqichni Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131d33] p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                Yangi Mavzu Qo‘shish
              </h3>
              <button
                onClick={() => setIsAddTopicOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTopicSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mavzu Nomi *
                </label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="masalan: Wireshark packet tahlili yoki Task 1 Essay..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Taxminiy Davomiylik
                </label>
                <input
                  type="text"
                  value={newTopicDuration}
                  onChange={(e) => setNewTopicDuration(e.target.value)}
                  placeholder="masalan: 4 soat, 2 kun..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTopicOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Mavzuni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Flashcard Modal */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131d33] p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                {t('addCard')}
              </h3>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('deck')}
                </label>
                <input
                  type="text"
                  required
                  value={newCardDeck}
                  onChange={(e) => setNewCardDeck(e.target.value)}
                  placeholder="masalan: Kiberxavfsizlik, IELTS..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('front')} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  placeholder="Savol yoki tushuncha..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('back')} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Javob yoki batafsil ta'rif..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-500"
                >
                  Kartani Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
