import { describe, it, expect } from 'vitest';
import {
  calculateXP,
  calculateTaskXP,
  calculateStudyXP,
  calculateStreakXP,
  sumXP,
  categorizeXP,
  XP_REWARDS,
} from './xp';

describe('XP Rules', () => {
  it('calculates base XP correctly', () => {
    expect(calculateXP('task_complete_medium')).toBe(10);
    expect(calculateXP('habit_done')).toBe(5);
    expect(calculateXP('pomodoro_complete')).toBe(5);
  });

  it('applies multiplier when provided', () => {
    expect(calculateXP('task_complete_high', 1.5)).toBe(30);
    expect(calculateXP('habit_streak_7', 2)).toBe(100);
  });

  it('calculates task XP by priority', () => {
    expect(calculateTaskXP('low')).toBe(XP_REWARDS.task_complete_low);
    expect(calculateTaskXP('medium')).toBe(XP_REWARDS.task_complete_medium);
    expect(calculateTaskXP('high')).toBe(XP_REWARDS.task_complete_high);
    expect(calculateTaskXP('urgent')).toBe(XP_REWARDS.task_complete_urgent);
  });

  it('calculates study XP by duration in minutes', () => {
    expect(calculateStudyXP(15)).toBe(5);
    expect(calculateStudyXP(30)).toBe(10);
    expect(calculateStudyXP(60)).toBe(20);
    expect(calculateStudyXP(120)).toBe(40);
    expect(calculateStudyXP(10)).toBe(0);
  });

  it('calculates streak XP correctly', () => {
    expect(calculateStreakXP(7)).toBe(50);
    expect(calculateStreakXP(14)).toBe(100);
    expect(calculateStreakXP(30)).toBe(200);
    expect(calculateStreakXP(60)).toBe(400);
    expect(calculateStreakXP(90)).toBe(600);
    expect(calculateStreakXP(5)).toBe(0);
  });

  it('sums multiple XP actions', () => {
    const total = sumXP([
      { action: 'task_complete_medium' },
      { action: 'habit_done' },
      { action: 'pomodoro_complete', multiplier: 2 },
    ]);
    expect(total).toBe(10 + 5 + 10);
  });

  it('categorizes XP events correctly', () => {
    const categories = categorizeXP([
      { action: 'task_complete_high', xp: 20 },
      { action: 'habit_done', xp: 5 },
      { action: 'study_session_60min', xp: 20 },
      { action: 'pomodoro_complete', xp: 5 },
      { action: 'budget_under', xp: 10 },
      { action: 'goal_complete', xp: 500 },
    ]);

    expect(categories.tasks).toBe(20);
    expect(categories.habits).toBe(5);
    expect(categories.study).toBe(20);
    expect(categories.time).toBe(5);
    expect(categories.finance).toBe(10);
    expect(categories.goals).toBe(500);
  });
});
