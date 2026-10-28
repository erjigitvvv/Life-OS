'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Hash,
  Tag,
  Activity,
  Droplets,
  Dumbbell,
  Wallet,
  Flame,
  Zap,
  Heart,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useLifeOS } from '@/lib/store';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'Activity', icon: Activity },
  { name: 'Target', icon: Target },
  { name: 'CheckCircle2', icon: CheckCircle2 },
  { name: 'Clock', icon: Clock },
  { name: 'Droplets', icon: Droplets },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Wallet', icon: Wallet },
  { name: 'Flame', icon: Flame },
  { name: 'Zap', icon: Zap },
  { name: 'Heart', icon: Heart },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Layers', icon: Layers },
];

const CATEGORIES = [
  'Productivity',
  'Health & Sport',
  'Finance',
  'Personal',
  'Work & Coding',
  'Habits',
];

const PRESET_UNITS = [
  'marta',
  'soat',
  'daqiqa',
  'stakan',
  'sahifa',
  'so‘m',
  'km',
  'boolean',
];

export function AddTrackModal({ isOpen, onClose }: AddTrackModalProps) {
  const { addTracker } = useLifeOS();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [unit, setUnit] = useState('marta');
  const [customUnit, setCustomUnit] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'hourly' | 'weekly'>('daily');
  const [targetType, setTargetType] = useState<'daily' | 'goal_indicator'>('daily');
  const [goal, setGoal] = useState<number>(1);
  const [isBoolean, setIsBoolean] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('Activity');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalUnit = isBoolean ? 'boolean' : (customUnit.trim() || unit);

    addTracker({
      name: name.trim(),
      category,
      unit: finalUnit,
      frequency,
      targetType,
      goal: isBoolean ? 1 : Number(goal) || 1,
      icon: selectedIcon,
      isBoolean,
    });

    // Reset and close
    setName('');
    setGoal(1);
    setIsBoolean(false);
    setCustomUnit('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground leading-tight">Yangi Track / Treker qo‘shish</h2>
              <p className="text-xs text-muted-foreground">Kategoriya, o‘lchov birligi va maqsad indikatorini sozlang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Track Nomi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              Track Nomi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Ertalabki yugurish, Kitob o‘qish, Kod yozish..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium placeholder:text-muted-foreground/60 transition-all"
            />
          </div>

          {/* Kategoriya */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Kategoriya
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                    category === cat
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Boolean Bajarildi / Bajarilmadi Switcher */}
          <div className="p-3.5 rounded-xl border border-border bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                {isBoolean ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
                Boolean Treker (Bajarildi / Bajarilmadi)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Raqamli qiymat emas, bir klikda ha/yo‘q holatini belgilash
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !isBoolean;
                setIsBoolean(next);
                if (next) {
                  setUnit('boolean');
                  setGoal(1);
                } else {
                  setUnit('marta');
                }
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                isBoolean ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  isBoolean ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* O'lchov birligi (agar boolean bo'lmasa) */}
          {!isBoolean && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-primary" />
                O‘lchov birligi
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_UNITS.filter((u) => u !== 'boolean').map((u) => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => {
                      setUnit(u);
                      setCustomUnit('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      unit === u && !customUnit
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customUnit}
                onChange={(e) => {
                  setCustomUnit(e.target.value);
                  setUnit(e.target.value);
                }}
                placeholder="Yoki o‘zingiz yozing (masalan: qadam, bet, pomodoro...)"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white dark:bg-card text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Davriylik & Maqsad Turi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Davriylik (Kun / Soat / Hafta) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Davriylik
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-border">
                {(['daily', 'hourly', 'weekly'] as const).map((freq) => (
                  <button
                    type="button"
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                      frequency === freq
                        ? 'bg-white dark:bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {freq === 'daily' ? 'Kun' : freq === 'hourly' ? 'Soat' : 'Hafta'}
                  </button>
                ))}
              </div>
            </div>

            {/* Maqsad Turi (Daily yoki Goal Target) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Maqsad Turi
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setTargetType('daily')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    targetType === 'daily'
                      ? 'bg-white dark:bg-card text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Kunlik (Daily)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('goal_indicator')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    targetType === 'goal_indicator'
                      ? 'bg-white dark:bg-card text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Goal Target
                </button>
              </div>
            </div>
          </div>

          {/* Maqsad Miqdori (agar boolean bo'lmasa) */}
          {!isBoolean && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Maqsad Miqdori ({customUnit || unit} hisobida)
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                placeholder="Masalan: 8, 45, 1000..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-card text-foreground font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Icon Tanlash */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Vektor Icon tanlang
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setSelectedIcon(item.name)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm scale-105'
                        : 'border-border text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    title={item.name}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-border/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Treker Yaratish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
