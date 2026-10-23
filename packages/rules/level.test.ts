import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  xpForLevel,
  xpForNextLevel,
  levelProgress,
  getLevelInfo,
  getLevelTier,
  getLevelColor,
} from './level';

describe('Level Rules', () => {
  it('calculates correct level from XP', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(300)).toBe(3);
    expect(calculateLevel(600)).toBe(4);
    expect(calculateLevel(1000)).toBe(5);
  });

  it('calculates XP required for level', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(200); // 100 * 2 * 1 = 200
    expect(xpForLevel(3)).toBe(600); // 100 * 3 * 2 = 600
  });

  it('calculates XP needed for next level', () => {
    const currentXP = 50;
    const needed = xpForNextLevel(currentXP);
    expect(needed).toBe(200 - 50);
  });

  it('calculates level progress percentage', () => {
    expect(levelProgress(0)).toBe(0);
    expect(levelProgress(100)).toBe(0); // at start of level 2 (which spans 200 to 600)
    expect(levelProgress(50)).toBe(25); // 50 / 200 = 25%
  });

  it('provides complete level info', () => {
    const info = getLevelInfo(150);
    expect(info.level).toBe(2);
    expect(info.currentXP).toBe(150);
    expect(info.currentLevelXP).toBe(200);
    expect(info.nextLevelXP).toBe(600);
  });

  it('assigns correct level tiers', () => {
    expect(getLevelTier(1)).toBe('Novice');
    expect(getLevelTier(5)).toBe('Beginner');
    expect(getLevelTier(10)).toBe('Intermediate');
    expect(getLevelTier(20)).toBe('Advanced');
    expect(getLevelTier(30)).toBe('Expert');
    expect(getLevelTier(40)).toBe('Master');
    expect(getLevelTier(50)).toBe('Legendary');
  });

  it('returns valid color hex codes for levels', () => {
    expect(getLevelColor(50)).toBe('#fbbf24');
    expect(getLevelColor(1)).toBe('#94a3b8');
  });
});
