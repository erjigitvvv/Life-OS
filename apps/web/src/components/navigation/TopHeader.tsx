'use client';

import React from 'react';
import { NotificationPanel } from '../NotificationPanel';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import { useLifeOS } from '@/lib/store';
import { Sparkles, Calendar } from 'lucide-react';

export function TopHeader() {
  const { user } = useLifeOS();

  const todayFormatted = new Intl.DateTimeFormat('uz-UZ', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-border/50">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="capitalize">{todayFormatted}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Salom,</span>
          <span className="font-semibold text-foreground">{user.name}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 inline-block animate-pulse" />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <NotificationPanel />
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="h-4 w-[1px] bg-border mx-1" />
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
