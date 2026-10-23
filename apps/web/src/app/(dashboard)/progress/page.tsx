'use client';

import React, { useState } from 'react';
import { Card, Badge, ProgressRing, Button } from '@/components/ui';
import { ACHIEVEMENTS, getAchievementsByCategory } from '@lifeos/rules';
import { Trophy, Star, Zap, Award, Flame, CheckCircle, Lock } from 'lucide-react';

export default function ProgressPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentXP = 1240;
  const currentLevel = 5;
  const nextLevelXP = 2000;
  const levelProgressPct = 62; // progress towards level 6

  // Mock list of unlocked achievement IDs
  const unlockedAchievementIds = new Set([
    'first_task',
    'tasks_10',
    'first_habit',
    'streak_7',
    'streak_21',
    'study_10h',
    'soc_day_14',
    'pomodoro_10',
    'first_weekly_review',
  ]);

  const categories = [
    { id: 'all', label: 'Barchasi' },
    { id: 'tasks', label: 'Vazifalar' },
    { id: 'habits', label: 'Odatlar' },
    { id: 'study', label: 'O\'qish' },
    { id: 'finance', label: 'Moliya' },
    { id: 'goals', label: 'Maqsadlar' },
  ];

  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : getAchievementsByCategory(selectedCategory as any);

  const totalPossibleXP = ACHIEVEMENTS.reduce((sum, a) => sum + a.xpReward, 0);
  const unlockedXP = ACHIEVEMENTS.filter((a) => unlockedAchievementIds.has(a.id)).reduce(
    (sum, a) => sum + a.xpReward,
    0
  );

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <span>🏆</span> Progress & Achievements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sizning shaxsiy darajangiz, tajriba ballaringiz (XP) va erishilgan yutuqlaringiz
        </p>
      </div>

      {/* Level & XP Hero Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center font-black shadow-lg">
              <span className="text-xs uppercase tracking-wider opacity-80">Level</span>
              <span className="text-3xl leading-none">5</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Beginner II</h2>
                <Badge variant="primary" className="text-xs">
                  ⚡ {currentXP} XP
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Navbatdagi 6-darajaga yetish uchun yana <b>{nextLevelXP - currentXP} XP</b> kerak
              </p>

              {/* Progress bar */}
              <div className="w-full md:w-80 mt-3">
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span>Joriy daraja (Lvl 5)</span>
                  <span>{levelProgressPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${levelProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Tiles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground">Ochilgan yutuqlar</p>
              <p className="text-xl font-bold mt-1 text-primary">
                {unlockedAchievementIds.size} / {ACHIEVEMENTS.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground">Yutuqlardan XP</p>
              <p className="text-xl font-bold mt-1 text-emerald-500">
                {unlockedXP} / {totalPossibleXP}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
            onClick={() => setSelectedCategory(cat.id)}
            className="text-xs rounded-full"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAchievements.map((ach) => {
          const isUnlocked = unlockedAchievementIds.has(ach.id);

          return (
            <Card
              key={ach.id}
              className={`transition-all duration-200 relative overflow-hidden ${
                isUnlocked
                  ? 'border-green-500/30 bg-green-500/5 shadow-sm'
                  : 'opacity-70 border-dashed border-border bg-muted/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    isUnlocked ? 'bg-card border border-green-500/30 shadow-sm' : 'bg-muted/50 grayscale'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-semibold text-sm truncate">{ach.name}</h3>
                    <Badge variant={isUnlocked ? 'success' : 'default'} className="text-[10px] py-0 px-1.5">
                      +{ach.xpReward} XP
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {ach.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground uppercase font-mono tracking-wider text-[9px]">
                      {ach.category}
                    </span>

                    {isUnlocked ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Ochilgan
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Qulflangan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
