'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskItem {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string; // ISO date string
  estimatedTime: string; // e.g. "2h 30m"
  subtasks: SubTask[];
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
}

export default function BoardPage() {
  const [tasks, setTasks] = useState<Record<string, TaskItem[]>>({
    backlog: [
      {
        id: 1,
        title: 'Fix authentication bug in Supabase auth',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 0.5).toISOString(), // 12 hours from now (urgent)
        estimatedTime: '2h',
        subtasks: [
          { id: 's1', title: 'Check JWT token expiry', completed: true },
          { id: 's2', title: 'Update RLS policies', completed: false },
        ],
        status: 'backlog',
      },
      {
        id: 2,
        title: 'Refactor database queries with Drizzle ORM',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days
        estimatedTime: '4h 15m',
        subtasks: [
          { id: 's3', title: 'Optimize indexes', completed: false },
          { id: 's4', title: 'Review N+1 queries', completed: false },
        ],
        status: 'backlog',
      },
      {
        id: 3,
        title: 'Write comprehensive API documentation',
        priority: 'low',
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days
        estimatedTime: '1h 30m',
        subtasks: [{ id: 's5', title: 'Endpoint listing', completed: true }],
        status: 'backlog',
      },
    ],
    todo: [
      {
        id: 4,
        title: 'Design sleek dashboard layout with Neumorphism',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
        estimatedTime: '3h',
        subtasks: [
          { id: 's6', title: 'Color palette tuning', completed: true },
          { id: 's7', title: 'Shadow utilities setup', completed: true },
        ],
        status: 'todo',
      },
      {
        id: 5,
        title: 'Create reusable UI components',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        estimatedTime: '5h',
        subtasks: [{ id: 's8', title: 'Buttons & Badges', completed: false }],
        status: 'todo',
      },
    ],
    in_progress: [
      {
        id: 6,
        title: 'Implement macOS-style cursor and micro-interactions',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000 * 0.8).toISOString(),
        estimatedTime: '2h',
        subtasks: [
          { id: 's9', title: 'Custom cursor dot', completed: true },
          { id: 's10', title: 'Active press animations', completed: true },
        ],
        status: 'in_progress',
      },
    ],
    done: [
      {
        id: 8,
        title: 'Project monorepo setup with Turborepo',
        priority: 'low',
        dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        estimatedTime: '1h',
        subtasks: [{ id: 's11', title: 'Workspace init', completed: true }],
        status: 'done',
      },
    ],
  });

  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const columnTitles = {
    backlog: '📋 Backlog',
    todo: '📝 To Do',
    in_progress: '🚀 In Progress',
    done: '✅ Done',
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'default',
      medium: 'warning',
      high: 'danger',
    };
    return colors[priority as keyof typeof colors];
  };

  // Calculate time remaining / urgency
  const getDeadlineInfo = (dueDateStr: string) => {
    const now = new Date().getTime();
    const due = new Date(dueDateStr).getTime();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { label: 'Overdue!', color: 'text-red-500 bg-red-500/10 border-red-500/30 animate-pulse' };
    } else if (diffHours <= 24) {
      const hoursLeft = Math.round(diffHours);
      return { label: `⏳ ${hoursLeft}h left`, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    } else {
      const daysLeft = Math.round(diffHours / 24);
      return { label: `📅 ${daysLeft}d left`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedTaskId === null) return;

    let movedTask: TaskItem | null = null;
    const updatedTasks = { ...tasks };

    // Find and remove dragged task from its source column
    for (const status of Object.keys(updatedTasks)) {
      const index = updatedTasks[status].findIndex((t) => t.id === draggedTaskId);
      if (index !== -1) {
        [movedTask] = updatedTasks[status].splice(index, 1);
        break;
      }
    }

    if (movedTask) {
      movedTask.status = targetStatus as any;
      updatedTasks[targetStatus].push(movedTask);
      setTasks(updatedTasks);
    }
    setDraggedTaskId(null);
  };

  const toggleSubtask = (taskId: number, subtaskId: string) => {
    const updated = { ...tasks };
    for (const status of Object.keys(updated)) {
      updated[status] = updated[status].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return task;
      });
    }
    setTasks(updated);
  };

  return (
    <main className="min-h-screen bg-[#e4ebf5] dark:bg-[#0f172a] p-6 transition-colors duration-300 font-sans select-none" style={{ cursor: 'default' }}>
      {/* macOS custom cursor / style container */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            LifeOS Neumorphic Kanban
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mac-inspired smooth interactions, subtasks, due date countdowns, and drag-and-drop.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('New Task modal opened')}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-[#e4ebf5] dark:bg-[#1e293b] rounded-xl shadow-[5px_5px_10px_#b8bec9,-5px_-5px_10px_#ffffff] dark:shadow-[4px_4px_10px_#090e1a,-4px_-4px_10px_#27375a] active:shadow-[inset_3px_3px_6px_#b8bec9,inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#090e1a,inset_-3px_-3px_6px_#27375a] transition-all duration-150 cursor-pointer"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid gap-6 lg:grid-cols-4">
        {(Object.entries(tasks) as [string, TaskItem[]][]).map(([status, items]) => {
          const deadlineInfo = getDeadlineInfo; // scope ref
          return (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="flex flex-col bg-[#e4ebf5] dark:bg-[#131d31] p-4 rounded-2xl shadow-[inset_6px_6px_12px_#b8bec9,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_5px_5px_10px_#0a0f1d,inset_-5px_-5px_10px_#1c2b45] min-h-[650px] transition-all"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-bold text-gray-700 dark:text-gray-200 text-base">
                  {columnTitles[status as keyof typeof columnTitles]}
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#e4ebf5] dark:bg-[#1a263d] text-gray-600 dark:text-gray-300 shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff] dark:shadow-[2px_2px_5px_#0a0f1d,-2px_-2px_5px_#1c2b45]">
                  {items.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-4">
                {items.map((task) => {
                  const deadline = getDeadlineInfo(task.dueDate);
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
                  const progressPercent = task.subtasks.length > 0
                    ? Math.round((completedSubtasks / task.subtasks.length) * 100)
                    : 0;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={`group relative p-4 rounded-xl bg-[#e4ebf5] dark:bg-[#18243b] shadow-[6px_6px_12px_#b8bec9,-6px_-6px_12px_#ffffff] dark:shadow-[5px_5px_10px_#0a0f1d,-5px_-5px_10px_#223555] hover:shadow-[8px_8px_16px_#b8bec9,-8px_-8px_16px_#ffffff] dark:hover:shadow-[6px_6px_14px_#0a0f1d,-6px_-6px_14px_#263c61] transition-all duration-200 cursor-grab active:cursor-grabbing active:scale-[0.98] ${
                        draggedTaskId === task.id ? 'opacity-50 scale-95 border-2 border-emerald-500' : ''
                      }`}
                    >
                      {/* Top Row: Priority & Due Date Countdown */}
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getPriorityColor(task.priority) as any}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-md border ${deadline.color}`}>
                          {deadline.label}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-snug mb-3">
                        {task.title}
                      </p>

                      {/* Smart Time Estimation */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>⏱️ Est: {task.estimatedTime}</span>
                        <span>•</span>
                        <span>{completedSubtasks}/{task.subtasks.length} subtasks</span>
                      </div>

                      {/* Subtasks Section */}
                      {task.subtasks.length > 0 && (
                        <div className="space-y-1.5 mb-3 bg-[#d9e2ef] dark:bg-[#10192b] p-2.5 rounded-lg shadow-[inset_3px_3px_6px_#b8bec9,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#070c17,inset_-3px_-3px_6px_#19263f]">
                          {task.subtasks.map((st) => (
                            <label
                              key={st.id}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => toggleSubtask(task.id, st.id)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className={st.completed ? 'line-through opacity-60' : ''}>
                                {st.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="w-full bg-[#d9e2ef] dark:bg-[#10192b] h-1.5 rounded-full overflow-hidden shadow-[inset_1px_1px_3px_#b8bec9,inset_-1px_-1px_3px_#ffffff] dark:shadow-[inset_1px_1px_3px_#070c17,inset_-1px_-1px_3px_#19263f]">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#10b981]"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Task Button per column */}
              <button
                onClick={() => alert(`Add task in ${status}`)}
                className="mt-4 w-full py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-[#e4ebf5] dark:bg-[#18243b] rounded-xl shadow-[4px_4px_8px_#b8bec9,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0a0f1d,-4px_-4px_8px_#223555] active:shadow-[inset_2px_2px_5px_#b8bec9,inset_-2px_-2px_5px_#ffffff] dark:active:shadow-[inset_2px_2px_5px_#0a0f1d,inset_-2px_-2px_5px_#223555] transition-all duration-150 cursor-pointer"
              >
                + Add Card
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
