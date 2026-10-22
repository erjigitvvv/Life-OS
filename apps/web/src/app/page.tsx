'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container-main flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-gradient">⚡ LifeOS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">v1.0.0</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container-main py-16 md:py-24">
        <div className="space-y-8 text-center">
          <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            Life Management
            <br />
            <span className="text-gradient">Reimagined with AI</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Manage your tasks, habits, time, finance, study, and health in one unified system.
            <br />
            AI-powered insights help you optimize every aspect of your life.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="card-bordered group hover:shadow-lg transition-smooth">
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 backdrop-blur-sm">
        <div className="container-main text-center text-sm text-muted-foreground">
          <p>© 2026 LifeOS. All rights reserved. | Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '✅',
    title: 'Tasks & Kanban',
    description: 'Organize your work with backlog, kanban board, and priority tracking.',
  },
  {
    icon: '⏱️',
    title: 'Time Management',
    description: 'Pomodoro timer, time blocks, and detailed time logging.',
  },
  {
    icon: '💰',
    title: 'Finance Tracking',
    description: 'Budget, savings goals, debt management, and subscriptions.',
  },
  {
    icon: '✅',
    title: 'Habit Streaks',
    description: 'Build daily habits with streak tracking and AI coaching.',
  },
  {
    icon: '📚',
    title: 'Study System',
    description: 'SOC Analyst plan, IELTS prep, flashcards with spaced repetition.',
  },
  {
    icon: '🎮',
    title: 'Gamification',
    description: 'XP, levels, achievements, and Life Score to stay motivated.',
  },
];