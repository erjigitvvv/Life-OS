'use client';

import React from 'react';
import { Card, Badge, ProgressRing, Button } from '@/components/ui';
import { formatDate, getDayOfWeek } from '@/lib/utils';

export default function TodayPage() {
  const today = new Date();
  const lifeScore = 78;
  const streak = 12;
  const xp = 1240;

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Today's Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          {formatDate(today)} • {getDayOfWeek(today)}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Life Score</p>
            <p className="text-2xl font-bold">{lifeScore}/100</p>
          </div>
          <ProgressRing value={lifeScore} size={60} thickness={3} color="#10b981" />
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold">🔥 {streak}</p>
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">XP</p>
            <p className="text-2xl font-bold">⚡ {xp}</p>
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold">👑 5</p>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top-3 Tasks */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">🎯 Top-3 Tasks</h2>
              <Badge>Today</Badge>
            </div>
            <div className="space-y-3">
              {[
                { title: 'SOC: SIEM log analysis', duration: '2h', priority: 'high' },
                { title: 'IELTS Writing Task 2', duration: '1h', priority: 'medium' },
                { title: 'Review fraud detection algo', duration: '1.5h', priority: 'high' },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                  <input type="checkbox" className="h-5 w-5 rounded border-border" />
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">⏱️ {task.duration}</p>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'danger' : 'warning'}>{task.priority}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Habits Status */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">✅ Habits (3/5)</h2>
              <span className="text-sm text-muted-foreground">60%</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {[
                { name: 'Morning routine', done: true },
                { name: 'Deep work', done: true },
                { name: 'Exercise', done: false },
                { name: 'Study IELTS', done: true },
                { name: 'Meditation', done: false },
              ].map((habit, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                  <input type="checkbox" checked={habit.done} className="h-4 w-4 rounded" />
                  <span className={habit.done ? 'line-through text-muted-foreground' : ''}>{habit.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Time Today */}
          <Card>
            <h3 className="mb-4 font-semibold">⏱️ Time Today</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tech</span>
                  <span className="font-medium">2h 30m / 4h</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[62.5%] bg-primary" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>IELTS</span>
                  <span className="font-medium">0h / 1h</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-0 bg-secondary" />
                </div>
              </div>
            </div>
          </Card>

          {/* Finance Status */}
          <Card>
            <h3 className="mb-4 font-semibold">💰 Finance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[65%] bg-amber-500" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  1,950,000 / 3,000,000 so'm
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Savings</p>
                <p className="text-lg font-bold">12,000,000</p>
                <p className="text-xs text-muted-foreground">Goal: 50,000,000</p>
              </div>
            </div>
          </Card>

          {/* AI Insight */}
          <Card variant="elevated" className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <h3 className="mb-3 font-semibold">🤖 AI Insight</h3>
            <p className="text-sm leading-relaxed">
              "Sizning IELTS vaqtingiz past. Bugun 1 soat qo'shing — haftaning o'rtasi eng samarali!"
            </p>
            <Button size="sm" className="mt-4 w-full" variant="secondary">
              Get AI Coaching
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}