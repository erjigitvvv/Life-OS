import { describe, it, expect } from 'vitest';
import {
  checkAchievements,
  getAchievementsByCategory,
  getTotalAchievementXP,
  ACHIEVEMENTS,
} from './achievements';

describe('Achievements Rules', () => {
  it('returns all defined achievements', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(15);
  });

  it('filters achievements by category', () => {
    const taskAchievements = getAchievementsByCategory('tasks');
    expect(taskAchievements.length).toBeGreaterThan(0);
    expect(taskAchievements.every((a) => a.category === 'tasks')).toBe(true);

    const habitAchievements = getAchievementsByCategory('habits');
    expect(habitAchievements.length).toBeGreaterThan(0);
    expect(habitAchievements.every((a) => a.category === 'habits')).toBe(true);
  });

  it('calculates total possible achievement XP', () => {
    const totalXP = getTotalAchievementXP();
    expect(totalXP).toBeGreaterThan(1000);
  });

  it('identifies newly earned achievements', () => {
    const userStats = {
      tasks_completed: 10,
      streak_days: 7,
    };

    const alreadyEarned = ['first_task'];
    const newlyEarned = checkAchievements(userStats, alreadyEarned);

    // Should include 'tasks_10' and 'streak_7', but not 'first_task'
    const newCodes = newlyEarned.map((a) => a.code);
    expect(newCodes).toContain('tasks_10');
    expect(newCodes).toContain('streak_7');
    expect(newCodes).not.toContain('first_task');
  });

  it('does not award achievements if targets are not met', () => {
    const userStats = {
      tasks_completed: 5,
    };

    const newlyEarned = checkAchievements(userStats, ['first_task']);
    const newCodes = newlyEarned.map((a) => a.code);
    expect(newCodes).not.toContain('tasks_10');
    expect(newCodes).not.toContain('tasks_50');
  });
});
