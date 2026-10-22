'use client';

import React, { useState } from 'react';
import { Card, Badge, Button, ProgressRing } from '@/components/ui';
import { formatDuration } from '@/lib/utils';

export default function TimePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds

  const totalTime = 25 * 60;
  const elapsedTime = totalTime - timeLeft;
  const progress = (elapsedTime / totalTime) * 100;

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">⏱️ Time Management</h1>
        <p className="mt-2 text-muted-foreground">Pomodoro Timer • Time Blocks • Time Logs</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pomodoro Timer */}
        <div className="lg:col-span-2">
          <Card className="text-center">
            <h2 className="mb-8 text-2xl font-semibold">Pomodoro Timer</h2>

            {/* Timer Display */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <ProgressRing
                  value={progress}
                  size={200}
                  thickness={8}
                  color={isRunning ? '#7c3aed' : '#06b6d4'}
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-5xl font-bold">
                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                    {String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {isRunning ? '🟢 Running' : '⏸️ Paused'}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center mb-6">
              <Button onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? '⏸️ Pause' : '▶️ Start'}
              </Button>
              <Button variant="secondary" onClick={() => setTimeLeft(25 * 60)}>
                🔄 Reset
              </Button>
              <Button variant="ghost" onClick={() => setTimeLeft(5 * 60)}>
                ☕ Break
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">5h 20m</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">22h</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Time Blocks & Logs */}
        <div className="space-y-6">
          {/* Today's Blocks */}
          <Card>
            <h3 className="mb-4 font-semibold">📅 Today's Blocks</h3>
            <div className="space-y-2">
              {[
                { time: '09:00 - 11:00', task: 'Deep Work', color: 'primary' },
                { time: '11:00 - 11:30', task: 'Break', color: 'muted' },
                { time: '11:30 - 13:00', task: 'SOC Study', color: 'success' },
                { time: '13:00 - 14:00', task: 'Lunch', color: 'warning' },
              ].map((block, i) => (
                <div key={i} className="rounded-lg p-2 bg-muted/50 hover:bg-muted cursor-pointer transition">
                  <p className="text-xs font-medium text-muted-foreground">{block.time}</p>
                  <p className="text-sm font-semibold">{block.task}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Logs */}
          <Card>
            <h3 className="mb-4 font-semibold">📝 Recent Logs</h3>
            <div className="space-y-2">
              {[
                { task: 'IELTS Writing', minutes: 45 },
                { task: 'SOC Analysis', minutes: 90 },
                { task: 'Code Review', minutes: 30 },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg p-2 bg-muted/50">
                  <span className="text-sm">{log.task}</span>
                  <Badge variant="default">{log.minutes}m</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}