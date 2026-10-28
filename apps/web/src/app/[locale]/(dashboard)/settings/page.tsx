'use client';

import React, { useState, useRef } from 'react';
import { useLifeOS, storeEngine } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  Settings,
  Send,
  Bot,
  Zap,
  ExternalLink,
  Palette,
  Moon,
  Sun,
  Shield,
  User,
  Bell,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  MousePointer,
  Sparkles,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const { tasks, habits, transactions, studyCards } = useLifeOS();

  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [telegramTestStatus, setTelegramTestStatus] = useState<string | null>(null);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramTestStatus(null);
    try {
      const res = await fetch('/api/telegram/cron');
      const data = await res.json();
      if (data.success) {
        setTelegramTestStatus(`Smart Notification dvigateli faol! ${data.decisionsCount} ta qoida muvaffaqiyatli baholandi.`);
      } else {
        setTelegramTestStatus(`Xatolik: ${data.error || 'Nomaʼlum xatolik'}`);
      }
    } catch (e: any) {
      setTelegramTestStatus(`Ulanish xatosi: ${e.message}`);
    } finally {
      setIsTestingTelegram(false);
      setTimeout(() => setTelegramTestStatus(null), 5000);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export JSON backup
  const handleExport = () => {
    const dataStr = storeEngine.exportJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = storeEngine.importJSON(content);
        if (success) {
          setResetStatus("Ma'lumotlar muvaffaqiyatli tiklandi!");
          setTimeout(() => setResetStatus(null), 3000);
        } else {
          alert('Fayl formati yaroqsiz!');
        }
      } catch (err) {
        alert('Xatolik yuz berdi!');
      }
    };
    reader.readAsText(file);
  };

  // Reset to initial seeds
  const handleReset = () => {
    if (confirm("Haqiqatan ham barcha ma'lumotlarni dastlabki holatga qaytarmoqchimisiz?")) {
      storeEngine.resetToDefaults();
      setResetStatus("Baza dastlabki holatga qaytarildi!");
      setTimeout(() => setResetStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t('title')}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Tizim ko'rinishi, til, bildirishnomalar va xotira boshqaruvi
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-muted-foreground">
          <MousePointer className="w-4 h-4 text-primary" />
          <span>macOS native kursor faol</span>
        </div>
      </div>

      {resetStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{resetStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Theme & Appearance */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            {t('appearance')}
          </h2>

          <div className="space-y-2.5">
            <button
              onClick={() => setTheme('light')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground">
                    {t('pureWhite')}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Toza oq, 1px nozik chegaralar, yumshoq soyalar
                  </p>
                </div>
              </div>
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground">
                    {t('darkTheme')}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Chuqur slate quyuq ranglar palitrasi
                  </p>
                </div>
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                theme === 'system'
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-500/10 text-slate-500">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground">
                    {t('systemTheme')}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Operatsion tizim sozlamasiga avtomatik moslashish
                  </p>
                </div>
              </div>
              {theme === 'system' && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </div>

        {/* 2. Language & Localization */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {t('language')}
            </h2>
            <LanguageSwitcher />
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            LifeOS to'liq uch tilda xizmat ko'rsatadi: O'zbekcha (lotin), Inglizcha (English) va Ruscha (Русский). Tanlangan til barcha modullarga bir zumda tatbiq etiladi.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 text-center">
              <span className="text-lg block">🇺🇿</span>
              <span className="text-xs font-bold text-foreground mt-1 block">O‘zbekcha</span>
              <span className="text-[10px] text-muted-foreground">Asosiy</span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 text-center">
              <span className="text-lg block">🇬🇧</span>
              <span className="text-xs font-bold text-foreground mt-1 block">English</span>
              <span className="text-[10px] text-muted-foreground">International</span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 text-center">
              <span className="text-lg block">🇷🇺</span>
              <span className="text-xs font-bold text-foreground mt-1 block">Русский</span>
              <span className="text-[10px] text-muted-foreground">Региональный</span>
            </div>
          </div>
        </div>

        {/* 3. Notifications Configuration */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            {t('notificationsConfig')}
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/30 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Kunlik ertalabki sarhisob
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Har kuni 08:00 da kunlik vazifalar ro'yxati
                </span>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary cursor-pointer" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/30 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Streak va Yutuqlar eslatmasi
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Odatlar streakini yo'qotmaslik uchun kechki ogohlantirish
                </span>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary cursor-pointer" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/30 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Byudjet 80% limiti xabari
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Oylik xarajatlar limitiga yaqinlashganda ogohlantirish
                </span>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary cursor-pointer" />
            </label>
          </div>
        </div>

        {/* 4. Telegram Bot & Smart Notifications Hub */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between md:col-span-2">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                  <Bot className="w-4 h-4" />
                </div>
                Telegram Bot & Smart Notification Tizimi
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Webhook & Smart Engine Faol
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Telegram boti orqali mobil qurilmangizdan turib vazifalarni bajarish, odatlarni bitta tugma bilan tasdiqlash, vaqt va xarajatlarni tabiiy tilda kiritish hamda soatlik o‘zbekcha motivatsion kotirovkalar olishingiz mumkin.
            </p>

            {telegramTestStatus && (
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                <span>{telegramTestStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                  <span>💡</span> Soatlik Motivatsiya
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Vaqtga qarab (tong, diqqat, oqshom) hikmatlar va intizom quoteslari
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                  <span>⚠️</span> Kirish Eslatmasi
                </div>
                <p className="text-[11px] text-muted-foreground">
                  4+ soat platformaga kirmaganda bot orqali faollik ogohlantirishi
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                  <span>🔘</span> Inline Keyboard
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Xabar tagidagi [✅ Bajarildi] tugmasi bilan odat va vazifani yopish
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                  <span>🏆</span> Taqdirlovchi Eslatma
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Kanbanda vazifa bajarilganda avtomatik tabriknoma va XP berish
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/70">
            <div className="text-[11px] text-muted-foreground">
              Webhook: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-primary">/api/telegram/webhook</code> • Scheduler: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-primary">/api/telegram/cron</code>
            </div>

            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingTelegram ? 'Tekshirilmoqda...' : 'Smart Notification Tizimini Sinash'}</span>
            </button>
          </div>
        </div>

        {/* 5. Client-first Reactive DB Storage */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              {t('database')}
            </h2>
            <p className="text-xs text-muted-foreground">
              Barcha ma'lumotlar brauzeringizning mahalliy xotirasida (localStorage) saqlanadi va to'liq reaktiv ishlaydi.
            </p>

            {/* DB Stats Badges */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border text-center">
                <span className="text-xs font-extrabold text-foreground block">{tasks.length}</span>
                <span className="text-[9px] text-muted-foreground">Vazifalar</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border text-center">
                <span className="text-xs font-extrabold text-foreground block">{habits.length}</span>
                <span className="text-[9px] text-muted-foreground">Odatlar</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border text-center">
                <span className="text-xs font-extrabold text-foreground block">{transactions.length}</span>
                <span className="text-[9px] text-muted-foreground">Tranzaksiyalar</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border text-center">
                <span className="text-xs font-extrabold text-foreground block">{studyCards.length}</span>
                <span className="text-[9px] text-muted-foreground">Kartochkalar</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-border/70">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Eksport (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tiklash (Import)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Dastlabki holatga qaytarish (Reset)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
