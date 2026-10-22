'use client';

import React from 'react';
import { Card, Badge, Button } from '@/components/ui';

export default function BoardPage() {
  const tasks = {
    backlog: [
      { id: 1, title: 'Fix authentication bug', priority: 'high' },
      { id: 2, title: 'Refactor database queries', priority: 'medium' },
      { id: 3, title: 'Write API documentation', priority: 'low' },
    ],
    todo: [
      { id: 4, title: 'Design dashboard layout', priority: 'high' },
      { id: 5, title: 'Create UI components', priority: 'high' },
    ],
    in_progress: [
      { id: 6, title: 'Implement user profile', priority: 'medium' },
      { id: 7, title: 'Set up database', priority: 'high' },
    ],
    done: [
      { id: 8, title: 'Project setup', priority: 'low' },
      { id: 9, title: 'Git repository initialization', priority: 'low' },
    ],
  };

  const columnTitles = {
    backlog: '📋 Backlog',
    todo: '📝 To Do',
    in_progress: '🚀 In Progress',
    done: '✅ Done',
  };

  const getStatusColor = (status: string) => {
    const colors = {
      backlog: 'bg-muted/10 border-muted/30',
      todo: 'bg-blue-500/10 border-blue-500/30',
      in_progress: 'bg-yellow-500/10 border-yellow-500/30',
      done: 'bg-green-500/10 border-green-500/30',
    };
    return colors[status as keyof typeof colors];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'default',
      medium: 'warning',
      high: 'danger',
    };
    return colors[priority as keyof typeof colors];
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Kanban Board</h1>
        <p className="mt-2 text-muted-foreground">Organize your tasks with drag-and-drop</p>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 lg:grid-cols-4">
        {(Object.entries(tasks) as [string, typeof tasks.backlog][]).map(([status, items]) => (
          <div key={status} className="flex flex-col">
            <h2 className="mb-4 font-semibold text-lg">{columnTitles[status as keyof typeof columnTitles]}</h2>
            <div className={`flex-1 rounded-lg border-2 border-dashed border-border p-4 ${getStatusColor(status)}`}>
              <div className="space-y-3">
                {items.map((task) => (
                  <Card key={task.id} className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                    <p className="font-medium">{task.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant={getPriorityColor(task.priority) as any}>
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{task.id}</span>
                    </div>
                  </Card>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="mt-4 w-full">
                + Add Task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}