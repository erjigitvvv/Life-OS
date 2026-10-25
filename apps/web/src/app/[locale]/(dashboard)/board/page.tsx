'use client';

import React, { useState } from 'react';
import { useLifeOS, TaskStatus, TaskPriority } from '@/lib/store';
import { useTranslations } from 'next-intl';
import {
  Kanban,
  Plus,
  Trash2,
  X,
  GripVertical,
  Palette,
  Check,
  Clock,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

const COLORS = [
  '#2563eb', // sapphire
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
];

export default function BoardPage() {
  const t = useTranslations('board');
  const { tasks, moveTask, addTask, deleteTask } = useLifeOS();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultColumnForNewTask, setDefaultColumnForNewTask] = useState<TaskStatus>('todo');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [color, setColor] = useState(COLORS[0]);
  const [estimatedTime, setEstimatedTime] = useState('2h');
  const [dueDateInput, setDueDateInput] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [subtasksInput, setSubtasksInput] = useState('Subtask 1, Subtask 2');

  const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'backlog', title: t('backlog'), color: 'border-t-slate-400' },
    { id: 'todo', title: t('todo'), color: 'border-t-blue-500' },
    { id: 'in_progress', title: t('in_progress'), color: 'border-t-amber-500' },
    { id: 'done', title: t('done'), color: 'border-t-emerald-500' },
  ];

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    if (activeDropColumn !== colId) {
      setActiveDropColumn(colId);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTask(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setActiveDropColumn(null);
  };

  const openAddTaskModal = (colId: TaskStatus = 'todo') => {
    setDefaultColumnForNewTask(colId);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setIsModalOpen(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const subtasks: SubTask[] = subtasksInput
      .split(',')
      .map((st, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title: st.trim(),
        completed: false,
      }))
      .filter((st) => st.title.length > 0);

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status: defaultColumnForNewTask,
      priority,
      color,
      icon: 'Target',
      tags: ['LifeOS', priority],
      dueDate: dueDateInput,
      estimatedTime: estimatedTime || '2h',
      subtasks,
    } as any);

    setIsModalOpen(false);
  };

  // Due date deadline badge info
  const getDeadlineInfo = (dueDateStr?: string) => {
    if (!dueDateStr) return { label: 'No deadline', color: 'text-slate-500 bg-slate-500/10' };
    const now = new Date().getTime();
    const due = new Date(dueDateStr).getTime();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { label: '⚠️ Overdue', color: 'text-red-500 bg-red-500/10 border-red-500/30 animate-pulse' };
    } else if (diffHours <= 24) {
      return { label: `⏳ ${Math.round(diffHours)}h left`, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    } else {
      return { label: `📅 ${Math.round(diffHours / 24)}d left`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  const getPriorityBadgeClass = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'high':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'low':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
    }
  };

  return (
    <main
      className="min-h-screen bg-[#e4ebf5] dark:bg-[#0b1329] p-6 transition-colors duration-300 font-sans select-none"
      style={{ cursor: 'default' }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#e4ebf5] dark:bg-[#111c33] p-6 rounded-2xl shadow-[8px_8px_16px_#b8bec9,-8px_-8px_16px_#ffffff] dark:shadow-[6px_6px_14px_#070c18,-6px_-6px_14px_#1b2c4e]">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]"></span>
            LifeOS Neumorphic Kanban Board
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mac-inspired cursor interactions, subtasks, due date timers, and smart time estimation.
          </p>
        </div>

        <button
          onClick={() => openAddTaskModal('todo')}
          className="px-5 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-[#e4ebf5] dark:bg-[#1a263d] rounded-xl shadow-[5px_5px_10px_#b8bec9,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#070c18,-5px_-5px_10px_#1b2c4e] active:shadow-[inset_3px_3px_6px_#b8bec9,inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#070c18,inset_-3px_-3px_6px_#1b2c4e] transition-all duration-150 cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-500" />
          <span>{t('addTask')}</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid gap-6 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((task) => task.status === col.id);
          const isDropActive = activeDropColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col bg-[#e4ebf5] dark:bg-[#10192e] p-4 rounded-2xl shadow-[inset_6px_6px_12px_#b8bec9,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_5px_5px_10px_#070c17,inset_-5px_-5px_10px_#192743] min-h-[680px] transition-all duration-200 ${
                isDropActive ? 'ring-2 ring-emerald-500/50 bg-emerald-500/[0.03]' : ''
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-bold text-gray-700 dark:text-gray-200 text-sm tracking-wide">
                  {col.title}
                </h2>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#e4ebf5] dark:bg-[#17233a] text-gray-600 dark:text-gray-300 shadow-[3px_3px_6px_#b8bec9,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#070c17,-3px_-3px_6px_#192743]">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-4">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center p-4 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                      {t('noTasksInColumn')}
                    </p>
                  </div>
                ) : (
                  colTasks.map((task: any) => {
                    const isDragging = draggedTaskId === task.id;
                    const deadline = getDeadlineInfo(task.dueDate);
                    const subtasks = task.subtasks || [];
                    const completedSub = subtasks.filter((st: any) => st.completed).length;
                    const progress = subtasks.length > 0 ? Math.round((completedSub / subtasks.length) * 100) : 0;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`group relative p-4 rounded-xl bg-[#e4ebf5] dark:bg-[#162138] shadow-[6px_6px_12px_#b8bec9,-6px_-6px_12px_#ffffff] dark:shadow-[5px_5px_10px_#070c17,-5px_-5px_10px_#1f2f4f] hover:shadow-[8px_8px_16px_#b8bec9,-8px_-8px_16px_#ffffff] dark:hover:shadow-[7px_7px_14px_#070c17,-7px_-7px_14px_#233559] transition-all duration-200 cursor-grab active:cursor-grabbing active:scale-[0.98] ${
                          isDragging ? 'opacity-40 scale-95 border-2 border-dashed border-emerald-500' : ''
                        }`}
                        style={{ borderLeftColor: task.color || '#2563eb', borderLeftWidth: '5px' }}
                      >
                        {/* Top: Priority & Due Date Countdown */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority?.toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${deadline.color}`}>
                            {deadline.label}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-xs leading-snug mb-2">
                          {task.title}
                        </h3>

                        {/* Smart Time Estimation */}
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-3 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-500" />
                            Est: {task.estimatedTime || '2h'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-blue-500" />
                            {completedSub}/{subtasks.length}
                          </span>
                        </div>

                        {/* Subtasks box */}
                        {subtasks.length > 0 && (
                          <div className="space-y-1.5 mb-3 bg-[#d9e2ef] dark:bg-[#0e1628] p-2.5 rounded-lg shadow-[inset_3px_3px_6px_#b8bec9,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#050812,inset_-3px_-3px_6px_#17243e]">
                            {subtasks.map((st: any) => (
                              <div
                                key={st.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  st.completed = !st.completed;
                                }}
                                className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 cursor-pointer hover:text-emerald-500 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={st.completed}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className={st.completed ? 'line-through opacity-60' : ''}>
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="w-full bg-[#d9e2ef] dark:bg-[#0e1628] h-1.5 rounded-full overflow-hidden shadow-[inset_1px_1px_3px_#b8bec9,inset_-1px_-1px_3px_#ffffff] dark:shadow-[inset_1px_1px_3px_#050812,inset_-1px_-1px_3px_#17243e]">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#10b981]"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Add Card Button */}
                <button
                  onClick={() => openAddTaskModal(col.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-[#e4ebf5] dark:bg-[#162138] shadow-[4px_4px_8px_#b8bec9,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#070c17,-4px_-4px_8px_#1f2f4f] active:shadow-[inset_2px_2px_5px_#b8bec9,inset_-2px_-2px_5px_#ffffff] dark:active:shadow-[inset_2px_2px_5px_#070c17,inset_-2px_-2px_5px_#1f2f4f] transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('addTask')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#e4ebf5] dark:bg-[#131d33] p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-gray-300 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Kanban className="w-4 h-4 text-emerald-500" />
                {t('addTask')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Vazifa nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Telegram bot integratsiyasi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#050812,inset_-2px_-2px_4px_#17243e]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t('priority')}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Muddati (Due Date)
                  </label>
                  <input
                    type="date"
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Smart Time Est.
                  </label>
                  <input
                    type="text"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="2h 30m"
                    className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Subtasks (vergul bilan)
                  </label>
                  <input
                    type="text"
                    value={subtasksInput}
                    onChange={(e) => setSubtasksInput(e.target.value)}
                    placeholder="Subtask 1, Subtask 2"
                    className="w-full px-3 py-2 text-xs bg-[#d9e2ef] dark:bg-[#0b1329] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('color')}
                </label>
                <div className="flex items-center gap-3">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-300 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500 active:scale-95 transition-all"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
