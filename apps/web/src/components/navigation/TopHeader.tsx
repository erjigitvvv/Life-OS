'use client';

import React, { useState } from 'react';
import { NotificationPanel } from '../NotificationPanel';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import { useLifeOS } from '@/lib/store';
import { Sparkles, Calendar, Edit2, Check, X } from 'lucide-react';

export function TopHeader() {
  const { user, updateUser } = useLifeOS();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [liveTime, setLiveTime] = useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('uz-UZ', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nameInput.trim()) {
      updateUser({ name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  // Get initials (e.g. "Mirhamid Erjigitov" -> "ME")
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || user.name.charAt(0);

  return (
    <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border shrink-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{liveTime || '00:00:00'}</span>
          <span className="text-[10px] uppercase font-sans font-extrabold tracking-wider hidden sm:inline ml-1 opacity-80">Live Real-Time</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-border/50">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="capitalize">{todayFormatted}</span>
        </div>

        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="To'liq ismingiz..."
              className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-primary rounded-lg focus:outline-none ring-1 ring-primary"
            />
            <button
              type="submit"
              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs"
              title="Saqlash"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setNameInput(user.name);
                setIsEditingName(false);
              }}
              className="p-1 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Bekor qilish"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div
            onClick={() => {
              setNameInput(user.name);
              setIsEditingName(true);
            }}
            className="group flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title="Ismni o'zgartirish uchun bosing"
          >
            <span>Salom,</span>
            <span className="font-bold text-foreground text-sm tracking-tight">{user.name}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 inline-block animate-pulse" />
            <Edit2 className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <NotificationPanel />
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="h-4 w-[1px] bg-border mx-1" />
        <div
          onClick={() => {
            setNameInput(user.name);
            setIsEditingName(true);
          }}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          title="Foydalanuvchi profilini tahrirlash"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:ring-2 ring-primary/40 transition-all">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
