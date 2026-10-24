/**
 * Level System
 *
 * XP → Level conversion
 * Formula: XP = (100 * level * (level - 1)) / 2
 *
 * Level 1: 0-99 XP
 * Level 2: 100-299 XP
 * Level 3: 300-599 XP
 * Level 4: 600-999 XP
 * Level 5: 1000-1499 XP
 * ...
 * Level 10: 4500-5499 XP
 * Level 20: 19000-20999 XP
 * Level 50: 122500-127499 XP
 */

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;

  // Solve: XP = (100 * L * (L - 1)) / 2
  // 2 * XP = 100L² - 100L
  // L² - L - (2 * XP / 100) = 0
  // L = (1 + sqrt(1 + 8 * XP / 100)) / 2

  const level = Math.floor((1 + Math.sqrt(1 + (8 * xp) / 100)) / 2);
  return Math.max(1, level);
}

/**
 * Calculate XP required for a specific level
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (100 * level * (level - 1)) / 2;
}

/**
 * Calculate XP needed to reach next level
 */
export function xpForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
}

/**
 * Calculate progress percentage to next level
 */
export function levelProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);

  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;

  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Get level info (current, next, progress)
 */
export function getLevelInfo(currentXP: number) {
  const level = calculateLevel(currentXP);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const xpNeeded = xpForNextLevel(currentXP);
  const progress = levelProgress(currentXP);

  return {
    level,
    currentXP,
    currentLevelXP,
    nextLevelXP,
    xpNeeded,
    progress,
  };
}

/**
 * Level tiers and badges
 */
export const LEVEL_TIERS = [
  { minLevel: 1, maxLevel: 4, name: 'Novice', badge: '🌱', color: '#94a3b8' },
  { minLevel: 5, maxLevel: 9, name: 'Beginner', badge: '🌿', color: '#10b981' },
  { minLevel: 10, maxLevel: 19, name: 'Intermediate', badge: '🌳', color: '#06b6d4' },
  { minLevel: 20, maxLevel: 29, name: 'Advanced', badge: '⚡', color: '#8b5cf6' },
  { minLevel: 30, maxLevel: 39, name: 'Expert', badge: '🔥', color: '#f59e0b' },
  { minLevel: 40, maxLevel: 49, name: 'Master', badge: '💎', color: '#ec4899' },
  { minLevel: 50, maxLevel: Infinity, name: 'Legendary', badge: '👑', color: '#fbbf24' },
] as const;

/**
 * Get level tier info
 */
export function getLevelTier(level: number) {
  const tier = LEVEL_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel);
  return tier ? tier.name : LEVEL_TIERS[0].name;
}

/**
 * Get level color
 */
export function getLevelColor(level: number): string {
  const tier = LEVEL_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel);
  return tier ? tier.color : LEVEL_TIERS[0].color;
}
