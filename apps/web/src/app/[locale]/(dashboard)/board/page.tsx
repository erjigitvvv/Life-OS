'use client';

import React, { useState } from 'react';
import { useLifeOS } from '@/lib/store';
import { TaskStatus, TaskPriority, Task } from '@lifeos/shared';
import { useTranslations } from 'next-intl';
import {
  Kanban,
  Plus,
  Clock,
  Tag,
  Trash2,
  X,
  GripVertical,
  CheckCircle2,
  Layers,
  Sparkles,
  Palette,
  Check,
} from 'lucide-react';

const COLORS = [
  '#2563eb', // sapphire
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#64748b', // slate
];

const ICONS = ['Target', 'Cpu', 'Kanban', 'BookOpen', 'Wallet', 'Table', 'CheckSquare'];

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
  const [icon, setIcon] = useState(ICONS[0]);
  const [tagsInput, setTagsInput] = useState('');

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
    setTagsInput('');
    setIsModalOpen(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status: defaultColumnForNewTask,
      priority,
      color,
      icon,
      tags: tags.length > 0 ? tags : ['General'],
      dueDate: new Date().toISOString().split('T')[0],
    });

    setIsModalOpen(false);
  };

  const getPriorityBadgeClass = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-50 text-red-600 dark:bg-red-950/40 border-red-200';
      case 'high':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 border-blue-200';
      case 'low':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Board Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-white shadow-sm">
              <Kanban className="w-5 h-5" />
            </div>
            {t('title')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t('subtitle')} • {t('dragTip')}
          </p>
        </div>

        <button
          onClick={() => openAddTaskModal('todo')}
          className="px-4 py-2.5 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addTask')}</span>
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((task) => task.status === col.id);
          const isDropActive = activeDropColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-slate-50/60 dark:bg-slate-900/40 border rounded-2xl p-4 transition-all duration-200 ${
                isDropActive
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]'
                  : 'border-border/80'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    col.id === 'done' ? 'bg-emerald-500' :
                    col.id === 'in_progress' ? 'bg-amber-500' :
                    col.id === 'todo' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />
                  <h2 className="font-bold text-xs uppercase tracking-wider text-foreground">
                    {col.title}
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground bg-white dark:bg-card px-2 py-0.5 rounded-md border border-border shadow-xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="space-y-3 min-h-[300px]">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center p-4 text-center">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t('noTasksInColumn')}
                    </p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isDragging = draggedTaskId === task.id;
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`group bg-white dark:bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing relative ${
                          isDragging ? 'opacity-40 scale-95 border-primary border-dashed' : ''
                        }`}
                        style={{ borderLeftColor: task.color || '#2563eb', borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {task.title}
                          </h3>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 rounded transition-all shrink-0"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded font-bold uppercase border ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.tags.slice(0, 2).map((tag, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 dark:bg-slate-800 text-muted-foreground px-1.5 py-0.5 rounded font-medium truncate max-w-[80px]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Add Task Button at Column Footer */}
                <button
                  onClick={() => openAddTaskModal(col.id)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-border/80 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-white dark:hover:bg-card transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addTask')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Kanban className="w-4 h-4 text-primary" />
                {t('addTask')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Vazifa nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('taskTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Batafsil izoh
                </label>
                <textarea
                  rows={3}
                  placeholder={t('taskDescPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t('priority')}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="low">{t('priorityLow')}</option>
                    <option value="medium">{t('priorityMedium')}</option>
                    <option value="high">{t('priorityHigh')}</option>
                    <option value="urgent">{t('priorityUrgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Ustun (Status)
                  </label>
                  <select
                    value={defaultColumnForNewTask}
                    onChange={(e) => setDefaultColumnForNewTask(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="backlog">{t('backlog')}</option>
                    <option value="todo">{t('todo')}</option>
                    <option value="in_progress">{t('in_progress')}</option>
                    <option value="done">{t('done')}</option>
                  </select>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('color')}
                </label>
                <div className="flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t('tags')}
                </label>
                <input
                  type="text"
                  placeholder={t('tagsPlaceholder')}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
