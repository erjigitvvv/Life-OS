/**
 * Level System
 *
 * XP → Level conversion
 * Formula: XP = 100 * level * (level - 1)
 *
 * Level 1: 0-99 XP
 * Level 2: 100-299 XP
 * Level 3: 300-599 XP
 * Level 4: 600-999 XP
 * Level 5: 1000-1499 XP
 * ...
 * Level 10: 9000-10999 XP
 * Level 20: 38000-41999 XP
 * Level 50: 245000-249999 XP
 */

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;

  // Solve: XP = 100 * L * (L - 1)
  // XP = 100L² - 100L
  // 100L² - 100L - XP = 0
  // L = (100 + sqrt(10000 + 400*XP)) / 200
  // Simplified: L = (1 + sqrt(1 + 8*XP/100)) / 2

  const level = Math.floor((1 + Math.sqrt(1 + (8 * xp) / 100)) / 2);
  return Math.max(1, level);
}

/**
 * Calculate XP required for a specific level
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 100 * level * (level - 1);
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
  const xpNeeded = nextLevelXP - currentXP;
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
 * Get level tier name
 */
export function getLevelTier(level: number): string {
  if (level >= 50) return 'Legendary';
  if (level >= 40) return 'Master';
  if (level >= 30) return 'Expert';
  if (level >= 20) return 'Advanced';
  if (level >= 10) return 'Intermediate';
  if (level >= 5) return 'Beginner';
  return 'Novice';
}

/**
 * Get level color
 */
export function getLevelColor(level: number): string {
  if (level >= 50) return '#fbbf24'; // gold
  if (level >= 40) return '#a855f7'; // purple
  if (level >= 30) return '#3b82f6'; // blue
  if (level >= 20) return '#10b981'; // green
  if (level >= 10) return '#06b6d4'; // cyan
  return '#94a3b8'; // gray
}

/**
 * Calculate XP table (for reference)
 */
export function generateXPTable(maxLevel: number = 50) {
  const table = [];
  for (let level = 1; level <= maxLevel; level++) {
    const xpStart = xpForLevel(level);
    const xpEnd = xpForLevel(level + 1) - 1;
    table.push({
      level,
      xpRange: `${xpStart}-${xpEnd}`,
      xpStart,
      xpEnd,
      tier: getLevelTier(level),
      color: getLevelColor(level),
    });
  }
  return table;
}
