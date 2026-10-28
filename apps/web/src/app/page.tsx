'use client';

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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container-main flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">LifeOS</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/uz/today"
              className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 transition-all"
            >
              Ilovaga kirish
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container-main py-16 md:py-24">
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
              href="/uz/today"
              className="px-6 py-3 text-sm font-bold bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              Dashboardga o‘tish
            </Link>
            <Link
              href="/uz/board"
              className="px-6 py-3 text-sm font-bold border border-border bg-white dark:bg-card text-foreground rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
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
        <div className="container-main text-center text-xs text-muted-foreground font-medium">
          <p>© 2026 LifeOS. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Kanban,
    title: 'Tasks & Kanban',
    description: 'Backlog, kanban doskasi va prioritetlar bo‘yicha vazifalarni rejalashtiring.',
  },
  {
    icon: Clock,
    title: 'Vaqt Boshqaruvi',
    description: 'Interaktiv jadval va Pomodoro taymeri orqali vaqtingizni tahlil qiling.',
  },
  {
    icon: Wallet,
    title: 'Moliya Nazorati',
    description: 'Daromad, xarajat, oylik byudjet va jamg‘arma maqsadlarini kuzatib boring.',
  },
  {
    icon: CheckSquare,
    title: 'Odatlar va Ketma-ketlik',
    description: '30-kunlik vizual matritsa va eslatmalar bilan kunlik odatlarni shakllantiring.',
  },
  {
    icon: Activity,
    title: 'Trekerlar va Subtracklar',
    description: 'Kategoriya, o‘lchov birligi va kunlik/haftalik maqsadlar bo‘yicha moslashuvchan trekerlar.',
  },
  {
    icon: Trophy,
    title: 'Gamifikatsiya & Life Score',
    description: 'XP, yangi darajalar, yutuqlar va kunlik umumiy Life Score balingiz.',
  },
];
