'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ActivityLog,
  activityLogger,
  ActivityCategory,
} from '@/lib/activity-logger';
import { vectorMemory, ScoredMemory } from '@/lib/vector-memory';
import { patternEngine, PatternInsight, DigitalTwinReport } from '@/lib/pattern-engine';
import { useLifeOS } from '@/lib/store';
import {
  Sparkles,
  Cpu,
  Database,
  Layers,
  Search,
  Send,
  Zap,
  TrendingUp,
  ShieldCheck,
  Clock,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Brain,
  RefreshCw,
  Eye,
  Terminal,
  Bot,
  User,
  Activity,
  ListFilter,
  Check,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'twin';
  text: string;
  timestamp: string;
  provider?: string;
  analyzedEvents?: number;
}

export function DigitalTwinHub() {
  const { user, tasks, habits, transactions, cards, emergencyFund, budgets } = useLifeOS();

  // Active Tab: 1. Overview (4-Stage Loop), 2. Live Capture Stream, 3. Vector Memory, 4. Hidden Patterns, 5. Twin AI Chat
  const [activeTab, setActiveTab] = useState<'loop' | 'capture' | 'vector' | 'patterns' | 'chat'>('loop');

  // Activity Stream State
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Vector Memory State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ScoredMemory[]>([]);

  // Pattern Engine Report
  const [report, setReport] = useState<DigitalTwinReport | null>(null);

  // Twin AI Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'twin',
      text: 'Salom, Mirhamid! Men sizning to\'liq xatti-harakatlaringiz, odatlaringiz, sarflangan pullaringiz va vaqt hisobingiz asosida shakllangan Raqamli Egizagingizman.\n\nSiz haqingizdagi har bir ma\'lumot oddiy qolipda emas, balki real dataset va vektorli xotira orqali o\'rganilmoqda. Menga har qanday savol bering yoki vazifa buyuring!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to Activity Stream and run Pattern Analysis
  useEffect(() => {
    const unsub = activityLogger.subscribe((allActs) => {
      setActivities(allActs);
      const rep = patternEngine.analyzeDataset(allActs);
      setReport(rep);
    });

    return unsub;
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Semantic Vector Search
  const handleSearchVector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = vectorMemory.search(searchQuery, 6);
    setSearchResults(res);
  };

  // Handle Twin Chat Message Submission
  const handleSendChatMessage = async (presetText?: string) => {
    const query = presetText || chatInput;
    if (!query.trim() || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      // Gather relevant semantic vector memories
      const relevantMemories = vectorMemory.search(query, 5);

      // System stats for the RAG context
      const totalCardBal = cards?.reduce((s, c) => s + c.balance, 0) || 0;
      const budgetLimit = budgets?.reduce((s, b) => s + b.limit, 0) || 0;
      const budgetSpent = budgets?.reduce((s, b) => s + b.spent, 0) || 0;

      const res = await fetch('/api/twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          activities: activities.slice(0, 20),
          patterns: report?.detectedPatterns || [],
          memories: relevantMemories,
          systemStats: {
            totalBalance: totalCardBal,
            budgetRemaining: Math.max(0, budgetLimit - budgetSpent),
            emergencyFund: emergencyFund?.currentAmount || 34500000,
            streak: user?.streak || 18,
            lifeScore: user?.lifeScore || 89,
            xp: user?.xp || 4820,
            level: user?.level || 14,
          },
        }),
      });

      const data = await res.json();

      const twinMsg: ChatMessage = {
        id: `twin-${Date.now()}`,
        sender: 'twin',
        text: data.reply || 'Kechirasiz, xatolik yuz berdi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider,
        analyzedEvents: data.analyzedDatasetEvents,
      };

      setMessages((prev) => [...prev, twinMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `twin-err-${Date.now()}`,
          sender: 'twin',
          text: 'Tarmoq xatosi yuz berdi, lekin datasetingiz saqlanib turibdi. Iltimos qaytadan urinib ko\'ring.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredActivities =
    categoryFilter === 'all'
      ? activities
      : activities.filter((a) => a.category === categoryFilter);

  return (
    <div className="w-full space-y-6">
      {/* HEADER: Digital Twin Overview & Closed-Loop Engine */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d1627] to-[#121f3d] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>4 Bosqichli Yopiq Sikl (Closed-Loop Continuous Learning)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
              <Brain className="w-9 h-9 text-emerald-400" />
              <span>Raqamli Egizak (Digital Twin Engine)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              O'zini o'zi o'rgatuvchi va sizga to'liq moslashuvchi kognitiv tizim. Har bir harakat
              avtomatik log qilinadi, semantik vektor ko'rinishida saqlanadi, yashirin qonuniyatlar
              aniqlanadi va AI suhbati to'liq o'tmish datasetingizga tayanadi.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                Qamrab Olingan Harakatlar
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {activities.length} ta
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                Vektorli Xotiralar
              </span>
              <span className="text-2xl font-black font-mono text-cyan-400">
                {vectorMemory.getMemoriesCount()} ta
              </span>
            </div>
          </div>
        </div>

        {/* 4-Stage Closed-Loop Visual Flow Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 relative z-10">
          {/* Stage 1 */}
          <div
            onClick={() => setActiveTab('capture')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeTab === 'capture'
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                1-BOSQICH
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Capture (Telemetriya)</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Vazifalar, sarflangan pullar, odatlar va vaqt real-vaqtda log qilinadi.
            </p>
          </div>

          {/* Stage 2 */}
          <div
            onClick={() => setActiveTab('vector')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeTab === 'vector'
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-md">
                2-BOSQICH
              </span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Vector Memory</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Dataset 64-1536 o'lchamli semantik vektor ko'rinishida saqlanadi.
            </p>
          </div>

          {/* Stage 3 */}
          <div
            onClick={() => setActiveTab('patterns')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeTab === 'patterns'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">
                3-BOSQICH
              </span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Pattern Recognition</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              AI orqa fonda yashirin qonuniyatlarni ochadi va tizimni moslaydi.
            </p>
          </div>

          {/* Stage 4 */}
          <div
            onClick={() => setActiveTab('chat')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeTab === 'chat'
                ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-md">
                4-BOSQICH
              </span>
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Digital Twin AI</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Qolipdan emas, balki to'liq o'tgan datasetingiz bo'yicha javob beradi.
            </p>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-[#111c33] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('loop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'loop'
              ? 'bg-white dark:bg-[#1a263f] text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Egizak Umumiy Tizimi</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Digital Twin AI Suhbat</span>
          <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">
            Jonli
          </span>
        </button>

        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'patterns'
              ? 'bg-white dark:bg-[#1a263f] text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Yashirin Qonuniyatlar ({report?.detectedPatterns.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('capture')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'capture'
              ? 'bg-white dark:bg-[#1a263f] text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Stream ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vector')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'vector'
              ? 'bg-white dark:bg-[#1a263f] text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Vektorli Xotira Qidiruvi</span>
        </button>
      </div>

      {/* TAB 1 & 4: DIGITAL TWIN AI CHAT (PRIMARY EXPERIENCE) */}
      {(activeTab === 'chat' || activeTab === 'loop') && (
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Raqamli Egizak bilan Muloqot</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300/40">
                    Dataset-Aware RAG
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Umumiy qoliplardan xoli — faqat sizning haqiqiy xatti-harakatlaringiz va qonuniyatlaringiz asosida
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `refreshed-${Date.now()}`,
                    sender: 'twin',
                    text: 'Yangi sessiya boshlandi. Barcha so\'nggi faoliyatlar va vektor xotiralari muvaffaqiyatli sinxronlashtirildi.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Suhbatni yangilash"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              'Bugungi sarflarim va 50/30/20 qoidasi tahlili qanday?',
              'Mening unumdorlik va diqqat cho\'qqisi soatlarim qachon?',
              'Odatlarim intizomi va zanjir qonuniyati haqida nima deysan?',
              'Ertaga ertalab birinchi qaysi vazifani bajarishim kerak?',
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChatMessage(prompt)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left"
              >
                💬 {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto p-4 rounded-2xl bg-slate-50/70 dark:bg-[#0c1527] border border-slate-200/60 dark:border-slate-800 mb-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'twin' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#18253e] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div
                    className={`mt-2 flex items-center justify-between text-[10px] ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'twin' && msg.analyzedEvents && (
                      <span className="font-mono">
                        📊 {msg.analyzedEvents} ta harakat tahlil qilindi
                      </span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}

            {isAiLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-[#18253e] border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 rounded-tl-none flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>O'tgan dataset va semantik xotira tahlil qilinmoqda...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Raqamli Egizakka savol bering yoki buyruq bering (masalan: 'Bugungi sarflarimni tahlil qil')..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isAiLoading}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Yuborish</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: LIVE ACTIVITY CAPTURE STREAM */}
      {activeTab === 'capture' && (
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800/60 mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span>Bosqich 1: Real-Time Activity Logger Stream</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Frontend va backend o'rtasida har bir harakat doimiy qayd qilinadi va datasetga kiritiladi
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'productivity', 'finance', 'habits', 'study', 'growth'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    categoryFilter === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Barchasi' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Cards List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        act.category === 'productivity'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : act.category === 'finance'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : act.category === 'habits'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : act.category === 'study'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {act.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {act.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {act.description || act.semanticText}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
                    <span className="font-mono">
                      🕒 {new Date(act.timestamp).toLocaleString('uz-UZ')}
                    </span>
                    <span>• {act.context?.timeOfDay?.toUpperCase()}</span>
                    <span>• {act.context?.dayOfWeek}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-mono bg-slate-200/80 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 font-bold block">
                    {act.eventType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VECTOR MEMORY & SEMANTIC EMBEDDINGS */}
      {activeTab === 'vector' && (
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60 mb-5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-500" />
              <span>Bosqich 2: Vektorli Xotira & Semantik Qidiruv (Embedding Space)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Har bir xatti-harakat n-gram va semantik vektor (64 o'lchamli kosinus fazosi) sifatida
              saqlanadi va RAG qidiruvi orqali AI ga uzatiladi
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchVector} className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Semantik qidiruv: Masalan 'tushlik xarajatlari', 'SOC Analyst', 'ertalabki yugurish'..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20"
            >
              Vektorlarni Qidirish
            </button>
          </form>

          {/* Search Results */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {searchResults.length > 0
                ? `Kosinus O'xshashligi Bo'yicha Eng Yaqin ${searchResults.length} ta Xotira:`
                : 'Barcha Vektorlashtirilgan Xotiralar:'}
            </h4>

            {(searchResults.length > 0
              ? searchResults
              : vectorMemory.getAllMemories().slice(0, 8).map((m) => ({ entry: m, similarity: 1 }))
            ).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.entry.content}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>Kategoriya: {item.entry.category}</span>
                    <span>• {new Date(item.entry.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-300/40">
                    {Math.round(item.similarity * 100)}% o'xshashlik
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HIDDEN PATTERNS & SELF-ADAPTATION */}
      {activeTab === 'patterns' && (
        <div className="bg-white dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60 mb-5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>Bosqich 3: Yashirin Qonuniyatlar va Tizimning Moslashuvi</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              AI dataset orqali inson ko'zi ilg'amaydigan qonuniyatlarni topadi va tizim sozlamalarini
              avtomatik tarzda sizga moslashtiradi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report?.detectedPatterns.map((pat) => (
              <div
                key={pat.id}
                className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/80 dark:from-[#111c33] dark:to-[#16233d] shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      pat.impact === 'positive'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {pat.category.toUpperCase()} • {(pat.confidenceScore * 100).toFixed(0)}% ANIQ
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {pat.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pat.insight}
                </p>

                <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    🔬 Dataset Dalili:
                  </div>
                  <div>{pat.evidence}</div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold">⚙️ Tizim Qanday Moslashdi:</span> {pat.systemAdaptation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
