'use client';

import React from 'react';
import { Card, Badge, Button, ProgressRing } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function HabitsPage() {
  const habits = [
    { name: 'Morning Routine', streak: 15, target: 30, color: '#10b981', icon: '🌅' },
    { name: 'Deep Work', streak: 8, target: 21, color: '#3b82f6', icon: '💼' },
    { name: 'Exercise', streak: 5, target: 90, color: '#f59e0b', icon: '🏃' },
    { name: 'IELTS Study', streak: 12, target: 21, color: '#7c3aed', icon: '📚' },
    { name: 'Meditation', streak: 3, target: 21, color: '#06b6d4', icon: '🧘' },
    { name: 'Reading', streak: 7, target: 30, color: '#ec4899', icon: '📖' },
  ];

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">✅ Habits</h1>
        <p className="mt-2 text-muted-foreground">Build consistency with daily habits</p>
      </div>

      {/* Habits Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit, i) => (
          <Card key={i} className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{habit.icon}</span>
                <h3 className="font-semibold">{habit.name}</h3>
              </div>
              <Badge variant="success">🔥 {habit.streak}d</Badge>
            </div>

            {/* Streak Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Target: {habit.target} days</span>
                <span className="font-medium">{Math.round((habit.streak / habit.target) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min((habit.streak / habit.target) * 100, 100)}%`,
                    backgroundColor: habit.color
                  }}
                />
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-4 flex gap-1 text-xs">
              {[7, 21, 30, 66, 90].map((milestone, j) => (
                <div
                  key={j}
                  className={`flex-1 rounded py-1 text-center font-medium ${
                    habit.streak >= milestone
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {milestone}d
                </div>
              ))}
            </div>

            {/* Action */}
            <Button size="sm" className="w-full">
              ✓ Done Today
            </Button>
          </Card>
        ))}
      </div>

      {/* Habit Stats */}
      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Total Habits</p>
          <p className="text-3xl font-bold mt-2">6</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Active Today</p>
          <p className="text-3xl font-bold mt-2">4/6</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Avg Streak</p>
          <p className="text-3xl font-bold mt-2">9d</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="text-3xl font-bold mt-2">87%</p>
        </Card>
      </div>
    </main>
  );
}