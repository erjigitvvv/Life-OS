import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Kanban,
  Clock,
  Wallet,
  CheckSquare,
  Activity,
  Trophy,
} from 'lucide-react';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const features = [
    { icon: Kanban, title: 'Tasks & Kanban', description: 'Backlog, kanban board, and priority tracking in one place.' },
    { icon: Clock, title: 'Time Management', description: 'Interactive time table, timer, and detailed activity logging.' },
    { icon: Wallet, title: 'Finance Tracking', description: 'Budget, savings goals, transaction history, and balances.' },
    { icon: CheckSquare, title: 'Habit Streaks', description: 'Build daily habits with 30-day visual matrix and reminders.' },
    { icon: Activity, title: 'Trackers & Subtracks', description: 'Customizable metrics with daily and goal target indicators.' },
    { icon: Trophy, title: 'Gamification', description: 'XP, levels, achievements, and Life Score to stay motivated.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">LifeOS</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/today`}
              className="py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary/90 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold md:text-5xl lg:text-6xl tracking-tight leading-tight">
            Hayotni Boshqarish
            <br />
            <span className="text-primary">Mukammal Tizim</span>
          </h2>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground font-medium">
            Vazifalar, odatlar, vaqt, moliya va sog‘liq ko‘rsatkichlarini yagona, zamonaviy va reaktiv tizimda boshqaring.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
            <Link
              href={`/${locale}/today`}
              className="py-3 px-6 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
            >
              Dashboardga o‘tish
            </Link>
            <Link
              href={`/${locale}/board`}
              className="py-3 px-6 rounded-xl border border-border bg-white dark:bg-card text-sm font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Vazifalar taxtasi
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border bg-white dark:bg-card hover:shadow-lg hover:-translate-y-1 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl text-center text-xs text-muted-foreground font-medium">
          <p>© 2026 LifeOS. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
