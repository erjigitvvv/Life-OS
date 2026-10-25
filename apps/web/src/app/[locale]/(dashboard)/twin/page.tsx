'use client';

import React, { useState } from 'react';
import { useLifeOS } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  Bot,
  Sparkles,
  Cpu,
  Brain,
  Zap,
  Flame,
  Activity,
  ShieldCheck,
  Send,
  MessageSquare,
  TrendingUp,
  Clock,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  BatteryCharging,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface TwinMessage {
  id: string;
  sender: 'user' | 'twin';
  text: string;
  timestamp: string;
}

export default function DigitalTwinPage() {
  const tNav = useTranslations('nav');
  const { user, tasks, habits, trackers, transactions, kaizenEntries, goals } = useLifeOS();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<TwinMessage[]>([
    {
      id: 'm-1',
      sender: 'twin',
      text: `Salom! Men sizning Raqamli Egizagingizman (Digital Twin). Sizning ${tasks.length} ta vazifangiz, ${habits.length} ta odatingiz, uyqu va diqqat maromlaringizni to'liq tahlil qildim. Bugungi kunlik quvvatingiz 84% darajasida. Menga xohlagan savolingizni bering!`,
      timestamp: 'Hozir',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    const userMsg: TwinMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const q = userText.toLowerCase();

      if (q.includes('vazifa') || q.includes('task') || q.includes('ish')) {
        reply = `Sizda hozir ${pendingTasks} ta faol vazifa bor. Eng muhimi: "${tasks[0]?.title || 'Tizimni optimallashtirish'}". Ushbu vazifani diqqat cho'qqisida (11:00 gacha) yakunlashni tavsiya qilaman.`;
      } else if (q.includes('uyqu') || q.includes('charchoq') || q.includes('dam')) {
        reply = `Oxirgi ko'rsatkichlarga ko'ra, siz o'rtacha 7.5 - 8 soat uxlayapsiz. Sifat: A'lo. Uyquga har kuni 23:00 da yotish ritmini saqlasangiz, ertangi samaradorlik 92% dan oshadi.`;
      } else if (q.includes('maqsad') || q.includes('goal') || q.includes('kelajak')) {
        reply = `Sizning joriy sur'atingiz bilan 30 kundan so'ng: Lvl ${user.level + 2} ga yetasiz, ${goals[0]?.title || 'Asosiy maqsad'} bo'yicha progress 90%+ ga chiqadi. Muntazamlikni saqlang!`;
      } else if (q.includes('moliya') || q.includes('pul') || q.includes('byudjet')) {
        reply = `Oylik balansingiz ijobiy. Jamg'armalarni ko'paytirish uchun ko'ngilochar xarajatlar limitiga e'tibor qarating.`;
      } else {
        reply = `Tushundim. Shaxsiy xulq-atvor modelingizni o'rganib chiqdim: bugungi ${user.streak} kunlik streak va ${user.xp} XP sizning o'sish dinamikangiz barqaror ekanligini ko'rsatmoqda. Kichik 1% doimiy yaxshilanishga e'tibor qarating!`;
      }

      const twinMsg: TwinMessage = {
        id: `tw-${Date.now()}`,
        sender: 'twin',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, twinMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>Avtonom AI Shaxsiy Ko'chirma</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-indigo-400" />
              Raqamli Egizak (Digital Twin)
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl leading-relaxed">
              Sizning fe'l-atvoringiz, uyqu fazalaringiz, vazifalar tezligi va kun tartibingiz asosida shakllangan sun'iy intellekt modeli. Siz bilan birga fikrlaydi va qaror qabul qilishda yordam beradi.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0 flex items-center gap-4 text-left">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg font-black text-lg">
                AI
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>99.2% Sinxron</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">FAOL</span>
              </div>
              <div className="text-[11px] text-indigo-200 mt-0.5">Xotirada: {tasks.length + habits.length * 30 + 120} parametr</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Digital Twin Dimension Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cognitive Load */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Kognitiv Yuklama</span>
            <Brain className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">O'rtacha (42%)</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">Optimal</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '42%' }} />
          </div>
          <p className="text-[11px] text-muted-foreground">Diqqatni jamlash uchun qulay fursat</p>
        </div>

        {/* Energy Rhythm */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Kunlik Energiya Cho'qqisi</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">09:30 — 12:00</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">Deep Work</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Eng og'ir vazifalarni shu vaqtga rejalashtiring</p>
        </div>

        {/* Prediction Accuracy */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Bashorat Aniqligi</span>
            <Compass className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">94.8%</span>
            <span className="text-xs font-bold text-emerald-600">Yuqori</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.8%' }} />
          </div>
          <p className="text-[11px] text-muted-foreground">Haftalik rejalar aniq amalga oshmoqda</p>
        </div>

        {/* Life Score Harmony */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Tizim Uyg'unligi</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">{user.lifeScore} / 100</span>
            <span className="text-xs font-bold text-primary">Senior Rank</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${user.lifeScore}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground">Barcha modullar sinxron holatda</p>
        </div>
      </div>

      {/* Main Interactive Section: AI Live Chat & Behavioral Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Chat with Digital Twin */}
        <div className="lg:col-span-2 bg-white dark:bg-card border border-border rounded-2xl shadow-sm flex flex-col h-[520px] overflow-hidden">
          <div className="p-4 border-b border-border bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Raqamli Egizak bilan Muloqot</h3>
                <p className="text-[11px] text-muted-foreground">Real ma'lumotlar bilan qurollangan AI suhbati</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-semibold">
              ● Online
            </span>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {m.sender === 'user' ? 'Siz' : 'Twin'}
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-xs shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-foreground rounded-tl-xs border border-border/60'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 opacity-70 ${
                      m.sender === 'user' ? 'text-white' : 'text-muted-foreground'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-10">
                <Bot className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Egizak o'ylamoqda...</span>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-white dark:bg-card flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Egizagingizdan so'rang (masalan: Bugun eng muhim vazifam nima?)..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-foreground"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yuborish</span>
            </button>
          </form>
        </div>

        {/* Right: Behavioral Insights & Directives */}
        <div className="space-y-6">
          {/* Directives Card */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Egizakning Bugungi Ko'rsatmalari
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Diqqat Bloki (90 min)</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hozir eng sermahsul vaqtingiz. Telefonni "Do Not Disturb" rejimiga qo'ying.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Gidratsiya & Tanaffus</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Kunlik suv me'yorining 60% qismi bajarilgan. 1 stakan toza suv ichish vaqti keldi.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Active Recall</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Bugun 4 ta SM-2 kartasi takrorlashga navbatda turibdi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Simulation Forecast */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50/40 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-200/70 dark:border-indigo-900/40 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-200">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> 30 Kunlik Simulyatsiya
              </span>
              <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full font-bold">
                Monte-Karlo
              </span>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
              Agar joriy odatlar va kunlik vazifalar maromini yana 30 kun davom ettirsangiz, sizning shaxsiy Life Score 96+ (Top 1%) darajaga yetadi.
            </p>

            <Link
              href="/uz/progress"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
            >
              Barcha metrikalarni ko'rish <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

