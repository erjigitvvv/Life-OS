import { describe, it, expect } from 'vitest';
import {
  calculateLifeScore,
  getLifeScoreColor,
  getLifeScoreStatus,
  getLifeScoreBreakdown,
  getLifeScoreRecommendations,
  DailyData,
} from './life-score';

describe('Life Score Rules', () => {
  it('calculates perfect life score for max activity', () => {
    const perfectDay: DailyData = {
      tasksCompleted: 5,
      studyMinutes: 240,
      habitsCompleted: 3,
      habitsTotal: 3,
      timeLoggedMinutes: 240,
      sleepHours: 8,
      exerciseMinutes: 30,
      energyLevel: 9,
      budgetSpent: 80,
      budgetAllocated: 100,
    };

    const score = calculateLifeScore(perfectDay);
    expect(score).toBe(100);
    expect(getLifeScoreStatus(score)).toBe('Excellent');
    expect(getLifeScoreColor(score)).toBe('#10b981');
  });

  it('calculates zero score for no activity', () => {
    const emptyDay: DailyData = {
      tasksCompleted: 0,
      studyMinutes: 0,
      habitsCompleted: 0,
      habitsTotal: 0,
      timeLoggedMinutes: 0,
    };

    const score = calculateLifeScore(emptyDay);
    expect(score).toBe(0);
    expect(getLifeScoreStatus(score)).toBe('Critical');
    expect(getLifeScoreColor(score)).toBe('#ef4444');
  });

  it('returns detailed breakdown', () => {
    const data: DailyData = {
      tasksCompleted: 3,
      studyMinutes: 120,
      habitsCompleted: 2,
      habitsTotal: 4,
      timeLoggedMinutes: 120,
      sleepHours: 7,
      exerciseMinutes: 20,
      energyLevel: 6,
      budgetSpent: 90,
      budgetAllocated: 100,
    };

    const breakdown = getLifeScoreBreakdown(data);
    expect(breakdown.tasks.max).toBe(25);
    expect(breakdown.study.max).toBe(20);
    expect(breakdown.habits.max).toBe(20);
    expect(breakdown.time.max).toBe(20);
    expect(breakdown.health.max).toBe(10);
    expect(breakdown.finance.max).toBe(5);
    expect(breakdown.total).toBeGreaterThan(0);
  });

  it('generates helpful recommendations based on low scores', () => {
    const data: DailyData = {
      tasksCompleted: 1,
      studyMinutes: 30,
      habitsCompleted: 1,
      habitsTotal: 3,
      timeLoggedMinutes: 60,
      sleepHours: 5,
      exerciseMinutes: 0,
      budgetSpent: 120,
      budgetAllocated: 100,
    };

    const recs = getLifeScoreRecommendations(data);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some((r) => r.includes('tasks'))).toBe(true);
    expect(recs.some((r) => r.includes('study'))).toBe(true);
    expect(recs.some((r) => r.includes('budget'))).toBe(true);
  });
});
