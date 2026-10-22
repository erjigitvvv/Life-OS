/**
 * Achievements System
 *
 * Foydalanuvchi erishishi mumkin bo'lgan barcha yutuqlar.
 * Har bir yutuq XP va badge beradi.
 */

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  xpReward: number;
  category: 'tasks' | 'habits' | 'study' | 'finance' | 'health' | 'goals';
  requirement: {
    type: string;
    target: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // ============================================
  // TASKS
  // ============================================
  {
    id: 'first_task',
    code: 'first_task',
    name: 'Boshlanish',
    description: 'Birinchi vazifangizni bajaring',
    icon: '🎉',
    color: '#3b82f6',
    xpReward: 10,
    category: 'tasks',
    requirement: { type: 'tasks_completed', target: 1 },
  },
  {
    id: 'tasks_10',
    code: 'tasks_10',
    name: 'Faol Boshlovchi',
    description: '10 ta vazifani bajaring',
    icon: '⚡',
    color: '#3b82f6',
    xpReward: 50,
    category: 'tasks',
    requirement: { type: 'tasks_completed', target: 10 },
  },
  {
    id: 'tasks_50',
    code: 'tasks_50',
    name: 'Samaradorlik Ustasi',
    description: '50 ta vazifani bajaring',
    icon: '🔥',
    color: '#8b5cf6',
    xpReward: 150,
    category: 'tasks',
    requirement: { type: 'tasks_completed', target: 50 },
  },
  {
    id: 'tasks_100',
    code: 'tasks_100',
    name: 'Asr',
    description: '100 ta vazifani bajaring',
    icon: '💯',
    color: '#ec4899',
    xpReward: 300,
    category: 'tasks',
    requirement: { type: 'tasks_completed', target: 100 },
  },
  {
    id: 'tasks_500',
    code: 'tasks_500',
    name: 'Vazifalar Qiroli',
    description: '500 ta vazifani bajaring',
    icon: '👑',
    color: '#fbbf24',
    xpReward: 1000,
    category: 'tasks',
    requirement: { type: 'tasks_completed', target: 500 },
  },

  // ============================================
  // HABITS & STREAKS
  // ============================================
  {
    id: 'first_habit',
    code: 'first_habit',
    name: 'Odat Boshlandi',
    description: 'Birinchi odatingizni bajaring',
    icon: '🌱',
    color: '#10b981',
    xpReward: 10,
    category: 'habits',
    requirement: { type: 'habits_completed', target: 1 },
  },
  {
    id: 'streak_7',
    code: 'streak_7',
    name: '1 Haftalik Jangchi',
    description: '7 kunlik ketma-ketlik (streak)',
    icon: '🔥',
    color: '#f59e0b',
    xpReward: 50,
    category: 'habits',
    requirement: { type: 'streak_days', target: 7 },
  },
  {
    id: 'streak_21',
    code: 'streak_21',
    name: 'Odat Shakllandi',
    description: '21 kunlik ketma-ketlik — odat o\'rnatildi!',
    icon: '🏆',
    color: '#10b981',
    xpReward: 150,
    category: 'habits',
    requirement: { type: 'streak_days', target: 21 },
  },
  {
    id: 'streak_30',
    code: 'streak_30',
    name: '1 Oylik Qahramon',
    description: '30 kunlik ketma-ketlik',
    icon: '🌟',
    color: '#8b5cf6',
    xpReward: 250,
    category: 'habits',
    requirement: { type: 'streak_days', target: 30 },
  },
  {
    id: 'streak_66',
    code: 'streak_66',
    name: 'Avtomatlashgan',
    description: '66 kun — odat avtomatik bo\'ldi (ilm-fan bo\'yicha)',
    icon: '🤖',
    color: '#06b6d4',
    xpReward: 500,
    category: 'habits',
    requirement: { type: 'streak_days', target: 66 },
  },
  {
    id: 'streak_90',
    code: 'streak_90',
    name: 'Hayot Tarzi',
    description: '90 kun — endi bu sizning yangi shaxsingiz!',
    icon: '💎',
    color: '#fbbf24',
    xpReward: 1000,
    category: 'habits',
    requirement: { type: 'streak_days', target: 90 },
  },

  // ============================================
  // STUDY
  // ============================================
  {
    id: 'study_10h',
    code: 'study_10h',
    name: 'Izlanuvchi',
    description: '10 soat o\'qish vaqtini qayd eting',
    icon: '📖',
    color: '#3b82f6',
    xpReward: 50,
    category: 'study',
    requirement: { type: 'study_minutes', target: 600 },
  },
  {
    id: 'study_50h',
    code: 'study_50h',
    name: 'Kitobxon',
    description: '50 soat o\'qish vaqti',
    icon: '📚',
    color: '#8b5cf6',
    xpReward: 200,
    category: 'study',
    requirement: { type: 'study_minutes', target: 3000 },
  },
  {
    id: 'study_100h',
    code: 'study_100h',
    name: 'Olim',
    description: '100 soat o\'qish vaqti',
    icon: '🎓',
    color: '#fbbf24',
    xpReward: 500,
    category: 'study',
    requirement: { type: 'study_minutes', target: 6000 },
  },
  {
    id: 'soc_day_14',
    code: 'soc_day_14',
    name: 'SOC: Asoslar Tayyor',
    description: 'SOC 56 kunlik rejasining 1-bosqichini (14 kun) tugating',
    icon: '🛡️',
    color: '#06b6d4',
    xpReward: 100,
    category: 'study',
    requirement: { type: 'soc_days', target: 14 },
  },
  {
    id: 'soc_day_28',
    code: 'soc_day_28',
    name: 'SOC: Threat Hunter',
    description: 'SOC rejasining 2-bosqichini (28 kun) tugating',
    icon: '🔍',
    color: '#06b6d4',
    xpReward: 200,
    category: 'study',
    requirement: { type: 'soc_days', target: 28 },
  },
  {
    id: 'soc_day_56',
    code: 'soc_day_56',
    name: 'SOC Analyst Tayyor!',
    description: 'SOC 56 kunlik rejani to\'liq tugating!',
    icon: '🚀',
    color: '#10b981',
    xpReward: 600,
    category: 'study',
    requirement: { type: 'soc_days', target: 56 },
  },
  {
    id: 'flashcards_100',
    code: 'flashcards_100',
    name: 'So\'z Boyligi',
    description: '100 ta flashcard takrorlang',
    icon: '🗂️',
    color: '#f59e0b',
    xpReward: 100,
    category: 'study',
    requirement: { type: 'flashcards_reviewed', target: 100 },
  },
  {
    id: 'flashcards_500',
    code: 'flashcards_500',
    name: 'Lug\'at Ustasi',
    description: '500 ta flashcard takrorlang',
    icon: '🧠',
    color: '#ec4899',
    xpReward: 400,
    category: 'study',
    requirement: { type: 'flashcards_reviewed', target: 500 },
  },

  // ============================================
  // TIME & FOCUS
  // ============================================
  {
    id: 'pomodoro_10',
    code: 'pomodoro_10',
    name: 'Fokus Boshlandi',
    description: '10 ta Pomodoro sessiyasini bajaring',
    icon: '🍅',
    color: '#ef4444',
    xpReward: 30,
    category: 'tasks',
    requirement: { type: 'pomodoros_completed', target: 10 },
  },
  {
    id: 'pomodoro_50',
    code: 'pomodoro_50',
    name: 'Chuqur Mehnat',
    description: '50 ta Pomodoro — Deep Work ustasi',
    icon: '🧘',
    color: '#8b5cf6',
    xpReward: 150,
    category: 'tasks',
    requirement: { type: 'pomodoros_completed', target: 50 },
  },

  // ============================================
  // FINANCE
  // ============================================
  {
    id: 'budget_first_month',
    code: 'budget_first_month',
    name: 'Moliyaviy Tartib',
    description: '1 oyni byudjet doirasida o\'tkazing',
    icon: '💰',
    color: '#10b981',
    xpReward: 100,
    category: 'finance',
    requirement: { type: 'budget_months_kept', target: 1 },
  },
  {
    id: 'savings_first_goal',
    code: 'savings_first_goal',
    name: 'Jamg\'aruvchi',
    description: 'Birinchi jamg\'arma maqsadingizga erishing',
    icon: '🏦',
    color: '#fbbf24',
    xpReward: 200,
    category: 'finance',
    requirement: { type: 'savings_goals_completed', target: 1 },
  },

  // ============================================
  // LIFE SCORE
  // ============================================
  {
    id: 'life_score_90',
    code: 'life_score_90',
    name: 'Mukammal Kun',
    description: 'Life Score 90+ ballga erishing',
    icon: '🌟',
    color: '#10b981',
    xpReward: 50,
    category: 'goals',
    requirement: { type: 'life_score_reached', target: 90 },
  },
  {
    id: 'life_score_100',
    code: 'life_score_100',
    name: '100% Hayot',
    description: 'Life Score 100 ball — to\'liq muvozanat!',
    icon: '👑',
    color: '#fbbf24',
    xpReward: 200,
    category: 'goals',
    requirement: { type: 'life_score_reached', target: 100 },
  },
  {
    id: 'first_weekly_review',
    code: 'first_weekly_review',
    name: 'Kaizen Falsafasi',
    description: 'Birinchi haftalik AI reviewni bajaring',
    icon: '📈',
    color: '#8b5cf6',
    xpReward: 100,
    category: 'goals',
    requirement: { type: 'weekly_reviews_completed', target: 1 },
  },
];

/**
 * Check which achievements user has earned
 */
export function checkAchievements(
  userStats: Record<string, number>,
  alreadyEarnedIds: string[]
): Achievement[] {
  const earnedSet = new Set(alreadyEarnedIds);
  const newlyEarned: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (earnedSet.has(achievement.id)) continue;

    const userValue = userStats[achievement.requirement.type] || 0;
    if (userValue >= achievement.requirement.target) {
      newlyEarned.push(achievement);
    }
  }

  return newlyEarned;
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']) {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Get total possible XP from all achievements
 */
export function getTotalAchievementXP(): number {
  return ACHIEVEMENTS.reduce((sum, a) => sum + a.xpReward, 0);
}
