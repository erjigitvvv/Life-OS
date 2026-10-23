import React from 'react';
import Link from 'next/link';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const features = [
    { icon: '✅', title: 'Tasks & Kanban', description: 'Backlog, kanban board, and priority tracking in one place.' },
    { icon: '⏱️', title: 'Time Management', description: 'Pomodoro timer, time blocks, and detailed time logging.' },
    { icon: '💰', title: 'Finance Tracking', description: 'Budget, savings goals, debt management, and subscriptions.' },
    { icon: '🔥', title: 'Habit Streaks', description: 'Build daily habits with streak tracking and AI coaching.' },
    { icon: '📚', title: 'Study System', description: 'SOC Analyst plan, IELTS prep, flashcards with spaced repetition.' },
    { icon: '🎮', title: 'Gamification', description: 'XP, levels, achievements, and Life Score to stay motivated.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">⚡ LifeOS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">v1.0.0</span>
            <Link href={`/${locale}/today`} className="py-2 px-4 neo-button text-xs font-bold text-primary">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="space-y-8 text-center">
          <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            Life Management
            <br />
            <span className="text-primary">Reimagined with AI</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Manage your tasks, habits, time, finance, study, and health in one unified system.
            <br />
            AI-powered insights help you optimize every aspect of your life.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href={`/${locale}/today`} className="py-3 px-6 neo-button text-sm font-bold text-primary">
              Get Started
            </Link>
            <Link href={`/${locale}/board`} className="py-3 px-6 neo-raised text-sm font-medium text-muted-foreground">
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="neo-raised p-6 hover:shadow-lg transition-smooth">
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>© 2026 LifeOS. All rights reserved. | Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}
