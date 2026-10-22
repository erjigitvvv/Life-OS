'use client';

import React from 'react';
import { Card, Badge, Button, ProgressRing } from '@/components/ui';

export default function StudyPage() {
  const modules = [
    {
      name: 'SOC Analyst 56-Day',
      progress: 25,
      days: '14/56',
      color: '#06b6d4',
      icon: '🛡️',
      topics: ['SIEM', 'Threat Detection', 'IR Basics'],
    },
    {
      name: 'IELTS 7.5+',
      progress: 35,
      band: '6.0/7.5',
      color: '#f59e0b',
      icon: '📚',
      topics: ['Writing', 'Speaking', 'Vocabulary'],
    },
    {
      name: 'Flashcards',
      progress: 42,
      reviewed: '210/500',
      color: '#10b981',
      icon: '🗂️',
      topics: ['IELTS Vocab', 'SOC Terms', 'Programming'],
    },
  ];

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">📚 Study</h1>
        <p className="mt-2 text-muted-foreground">Track your learning journey</p>
      </div>

      {/* Study Modules */}
      <div className="grid gap-6 lg:grid-cols-2">
        {modules.map((module, i) => (
          <Card key={i}>
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{module.icon}</span>
                <div>
                  <h3 className="font-semibold">{module.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {module.days || module.band || module.reviewed}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="mb-6 flex justify-center">
              <ProgressRing
                value={module.progress}
                size={150}
                thickness={6}
                color={module.color}
              />
            </div>

            {/* Topics */}
            <div className="mb-6 flex flex-wrap gap-2">
              {module.topics.map((topic, j) => (
                <Badge key={j} variant="primary">{topic}</Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">Continue</Button>
              <Button size="sm" variant="secondary" className="flex-1">View Details</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Study Sessions */}
      <div className="mt-8">
        <Card>
          <h3 className="mb-4 text-xl font-semibold">📝 Recent Sessions</h3>
          <div className="space-y-3">
            {[
              { date: 'Today', subject: 'IELTS Writing', duration: '45 min', type: 'writing' },
              { date: 'Yesterday', subject: 'SOC Day 13', duration: '120 min', type: 'cybersecurity' },
              { date: '2 days ago', subject: 'Flashcard Review', duration: '30 min', type: 'vocab' },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition">
                <div>
                  <p className="font-medium">{session.subject}</p>
                  <p className="text-sm text-muted-foreground">{session.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">⏱️ {session.duration}</p>
                  <Badge variant="default" className="text-xs">{session.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}