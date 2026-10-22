'use client';

import React from 'react';
import { Card, Badge, Button, ProgressRing } from '@/components/ui';

export default function GoalsPage() {
  const goals = [
    {
      title: 'IELTS 7.5+ Band',
      progress: 60,
      category: 'Learning',
      deadline: '2027-03-01',
      keyResults: [
        { title: 'Writing 7.0+', current: 6.5, target: 7.0 },
        { title: 'Speaking 7.0+', current: 6.0, target: 7.0 },
        { title: 'Vocabulary 5000+', current: 3500, target: 5000 },
      ],
    },
    {
      title: 'Bank SOC Analyst Job',
      progress: 45,
      category: 'Career',
      deadline: '2027-06-01',
      keyResults: [
        { title: 'SOC 56-day Complete', current: 25, target: 56 },
        { title: 'Portfolio Projects', current: 2, target: 3 },
        { title: 'Certifications', current: 1, target: 2 },
      ],
    },
    {
      title: 'Financial Independence',
      progress: 25,
      category: 'Finance',
      deadline: '2028-01-01',
      keyResults: [
        { title: 'Emergency Fund', current: 3, target: 10 },
        { title: 'Monthly Savings 30%', current: 20, target: 30 },
        { title: 'Debt Free', current: 50, target: 100 },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">🎯 Goals & OKR</h1>
        <p className="mt-2 text-muted-foreground">Track your objectives and key results</p>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {goals.map((goal, i) => (
          <Card key={i}>
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{goal.title}</h3>
                <div className="mt-2 flex gap-2">
                  <Badge variant="primary">{goal.category}</Badge>
                  <Badge variant="default">📅 {goal.deadline}</Badge>
                </div>
              </div>
              <ProgressRing value={goal.progress} size={80} thickness={6} color="#7c3aed" />
            </div>

            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold">{goal.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[45%] bg-primary" style={{ width: `${goal.progress}%` }} />
              </div>
            </div>

            {/* Key Results */}
            <h4 className="mb-3 font-medium text-muted-foreground">Key Results</h4>
            <div className="space-y-3">
              {goal.keyResults.map((kr, j) => (
                <div key={j} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{kr.title}</span>
                    <span className="text-sm">
                      {kr.current} / {kr.target}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-secondary"
                      style={{ width: `${Math.min((kr.current / kr.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-border flex gap-2">
              <Button size="sm" className="flex-1">Update Progress</Button>
              <Button size="sm" variant="ghost" className="flex-1">View Tasks</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Goal */}
      <div className="mt-8">
        <Button className="w-full py-6" variant="secondary">
          + Create New Goal
        </Button>
      </div>
    </main>
  );
}