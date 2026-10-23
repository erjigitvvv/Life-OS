'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  KanbanSquare,
  Clock,
  Wallet,
  CheckSquare,
  GraduationCap,
  TrendingUp,
  Target,
  HeartPulse,
  Trophy,
  Settings,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { cn, formatDate, getDayOfWeek } from '@/lib/utils';

const navigationItems = [
  { name: 'Today', href: '/today', icon: Home, badge: 'Main' },
  { name: 'Board', href: '/board', icon: KanbanSquare },
  { name: 'Time', href: '/time', icon: Clock },
  { name: 'Finance', href: '/finance', icon: Wallet },
  { name: 'Habits', href: '/habits', icon: CheckSquare },
  { name: 'Study', href: '/study', icon: GraduationCap },
  { name: 'Kaizen', href: '/kaizen', icon: TrendingUp },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Health', href: '/health', icon: HeartPulse },
  { name: 'Progress', href: '/progress', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [captureText, setCaptureText] = useState('');
  const [captureStatus, setCaptureStatus] = useState<string | null>(null);

  const today = new Date();

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureText.trim()) return;

    setCaptureStatus('Saqlanmoqda...');
    setTimeout(() => {
      setCaptureStatus('✅ Muvaffaqiyatli saqlandi!');
      setTimeout(() => {
        setCaptureText('');
        setCaptureStatus(null);
        setQuickCaptureOpen(false);
      }, 1000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-bold text-lg">LifeOS</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setQuickCaptureOpen(true)}
            className="flex items-center gap-1 text-xs px-2 py-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Capture
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* App Logo & Brand */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link
            href="/today"
            className="flex items-center gap-2.5 font-bold text-lg text-foreground hover:opacity-80 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
              ⚡
            </div>
            <div>
              <p className="leading-tight">LifeOS</p>
              <p className="text-[10px] text-muted-foreground font-normal">v1.0.0 • AI-Powered</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Gamification Quick Glance */}
        <div className="p-3 mx-3 my-3 rounded-lg bg-muted/40 border border-border/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">Life Score</span>
            <span className="font-bold text-emerald-500">78 / 100</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[78%] bg-emerald-500 rounded-full" />
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/60 text-[11px]">
            <span className="text-muted-foreground">🔥 Streak: <b>12d</b></span>
            <span className="text-muted-foreground">⚡ Level <b>5</b></span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                <span className="flex-1">{item.name}</span>
                {item.badge && !isActive && (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Capture Button & AI Coach Link */}
        <div className="p-3 border-t border-border space-y-2">
          <Button
            className="w-full flex items-center justify-center gap-2 text-xs py-2"
            onClick={() => {
              setMobileMenuOpen(false);
              setQuickCaptureOpen(true);
            }}
          >
            <PlusCircle className="w-4 h-4" />
            Quick Capture (Cmd+K)
          </Button>

          <Link
            href="/kaizen"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI Review & Feedback</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop Bar */}
        <header className="hidden md:flex items-center justify-between border-b border-border bg-card/60 backdrop-blur-sm px-6 py-3 sticky top-0 z-30">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {getDayOfWeek(today)}, {formatDate(today)}
            </p>
            <p className="text-xs text-muted-foreground">
              Bugungi hayot muvozanati va shaxsiy rivojlanish
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Status Badges */}
            <div className="flex items-center gap-2">
              <Badge variant="success" className="cursor-pointer text-xs">
                Score: 78/100
              </Badge>
              <Badge variant="warning" className="cursor-pointer text-xs">
                🔥 12 kun streak
              </Badge>
              <Badge variant="primary" className="cursor-pointer text-xs">
                ⚡ 1,240 XP
              </Badge>
            </div>

            <Button
              size="sm"
              variant="secondary"
              className="flex items-center gap-1.5 text-xs ml-2"
              onClick={() => setQuickCaptureOpen(true)}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Quick Capture
            </Button>
          </div>
        </header>

        {/* Page Children */}
        <div className="flex-1">{children}</div>
      </div>

      {/* Quick Capture Modal Dialog */}
      {quickCaptureOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="font-bold text-lg">Quick Capture</h3>
              </div>
              <button
                onClick={() => setQuickCaptureOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Vazifa, odat, xarajat yoki o'qish vaqtini erkin matn yoki teglar bilan yozing:
              <br />
              <code className="text-primary font-mono text-[11px]">
                Masalan: /task SOC Day 14 #study @soc yoki budget 50000 Tushlik
              </code>
            </p>

            <form onSubmit={handleQuickCapture} className="space-y-4">
              <textarea
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value)}
                placeholder="Yozuv yoki tezkor buyruq kiriting..."
                className="w-full h-28 rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />

              {captureStatus && (
                <p className="text-xs text-center font-medium text-primary">{captureStatus}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickCaptureOpen(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" size="sm">
                  AI orqali saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
