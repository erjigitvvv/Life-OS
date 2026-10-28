'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useLifeOS } from '@/lib/store';
import { useTranslations } from 'next-intl';

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } = useLifeOS();
  const t = useTranslations('notifications');

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border border-border bg-white dark:bg-card shadow-sm hover:border-primary/40 active:scale-95 transition-all text-foreground flex items-center justify-center"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-white dark:bg-card shadow-xl py-2 z-50 animate-scale-in">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/70">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">{t('title')}</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} yangi
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  title={t('markAllRead')}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  title={t('clearAll')}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                {t('noNotifications')}
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    !item.read ? 'bg-primary/[0.03]' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs ${!item.read ? 'font-semibold text-foreground' : 'text-foreground/90'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
