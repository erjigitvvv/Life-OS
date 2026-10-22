/**
 * Life Score Calculation (0-100)
 *
 * Kunlik umumiy hayot balli — foydalanuvchi faolligi asosida.
 *
 * Breakdown:
 * - Tasks: 25 ball (5 ta task = 100%)
 * - Study: 20 ball (4 soat = 100%)
 * - Habits: 20 ball (3 ta habit = 100%)
 * - Time: 20 ball (4 soat logged = 100%)
 * - Health: 10 ball (sleep + exercise + energy)
 * - Finance: 5 ball (budget discipline)
 */

export interface DailyData {
  // Tasks
  tasksCompleted: number;
  tasksTotal?: number;

  // Study
  studyMinutes: number;

  // Habits
  habitsCompleted: number;
  habitsTotal: number;

  // Time
  timeLoggedMinutes: number;

  // Health
  sleepHours?: number;
  exerciseMinutes?: number;
  energyLevel?: number; // 1-10

  // Finance
  budgetSpent?: number;
  budgetAllocated?: number;
}

/**
 * Calculate Life Score (0-100)
 */
export function calculateLifeScore(data: DailyData): number {
  let score = 0;

  // 1. Tasks (max 25)
  const tasksPct = Math.min(1, data.tasksCompleted / 5);
  score += tasksPct * 25;

  // 2. Study (max 20)
  const studyPct = Math.min(1, data.studyMinutes / 240); // 4 hours = 100%
  score += studyPct * 20;

  // 3. Habits (max 20)
  const habitsPct = data.habitsTotal > 0
    ? data.habitsCompleted / data.habitsTotal
    : 0;
  score += habitsPct * 20;

  // 4. Time (max 20)
  const timePct = Math.min(1, data.timeLoggedMinutes / 240); // 4 hours = 100%
  score += timePct * 20;

  // 5. Health (max 10)
  const healthScore = calculateHealthScore(
    data.sleepHours,
    data.exerciseMinutes,
    data.energyLevel
  );
  score += healthScore;

  // 6. Finance (max 5)
  const financeScore = calculateFinanceScore(
    data.budgetSpent,
    data.budgetAllocated
  );
  score += financeScore;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Health score component (0-10)
 */
function calculateHealthScore(
  sleepHours?: number,
  exerciseMinutes?: number,
  energyLevel?: number
): number {
  let score = 0;

  // Sleep (0-4 points)
  if (sleepHours !== undefined) {
    if (sleepHours >= 8) score += 4;
    else if (sleepHours >= 7) score += 3;
    else if (sleepHours >= 6) score += 2;
    else if (sleepHours >= 5) score += 1;
  }

  // Exercise (0-3 points)
  if (exerciseMinutes !== undefined) {
    if (exerciseMinutes >= 30) score += 3;
    else if (exerciseMinutes >= 15) score += 2;
    else if (exerciseMinutes >= 5) score += 1;
  }

  // Energy (0-3 points)
  if (energyLevel !== undefined) {
    if (energyLevel >= 8) score += 3;
    else if (energyLevel >= 6) score += 2;
    else if (energyLevel >= 4) score += 1;
  }

  return Math.round(score);
}

/**
 * Finance score component (0-5)
 */
function calculateFinanceScore(
  budgetSpent?: number,
  budgetAllocated?: number
): number {
  if (budgetSpent === undefined || budgetAllocated === undefined || budgetAllocated === 0) {
    return 0;
  }

  const spentPct = budgetSpent / budgetAllocated;

  if (spentPct <= 0.9) return 5; // Under budget
  if (spentPct <= 1.0) return 4; // Within budget
  if (spentPct <= 1.1) return 2; // Slightly over
  return 0; // Over budget
}

/**
 * Life Score color
 */
export function getLifeScoreColor(score: number): string {
  if (score >= 90) return '#10b981'; // emerald
  if (score >= 75) return '#fbbf24'; // amber
  if (score >= 50) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Life Score status
 */
export function getLifeScoreStatus(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
}

/**
 * Life Score breakdown
 */
export function getLifeScoreBreakdown(data: DailyData) {
  const tasksPct = Math.min(1, data.tasksCompleted / 5);
  const tasksScore = tasksPct * 25;

  const studyPct = Math.min(1, data.studyMinutes / 240);
  const studyScore = studyPct * 20;

  const habitsPct = data.habitsTotal > 0
    ? data.habitsCompleted / data.habitsTotal
    : 0;
  const habitsScore = habitsPct * 20;

  const timePct = Math.min(1, data.timeLoggedMinutes / 240);
  const timeScore = timePct * 20;

  const healthScore = calculateHealthScore(
    data.sleepHours,
    data.exerciseMinutes,
    data.energyLevel
  );

  const financeScore = calculateFinanceScore(
    data.budgetSpent,
    data.budgetAllocated
  );

  return {
    tasks: { score: Math.round(tasksScore), max: 25, percentage: tasksPct * 100 },
    study: { score: Math.round(studyScore), max: 20, percentage: studyPct * 100 },
    habits: { score: Math.round(habitsScore), max: 20, percentage: habitsPct * 100 },
    time: { score: Math.round(timeScore), max: 20, percentage: timePct * 100 },
    health: { score: Math.round(healthScore), max: 10, percentage: (healthScore / 10) * 100 },
    finance: { score: Math.round(financeScore), max: 5, percentage: (financeScore / 5) * 100 },
    total: calculateLifeScore(data),
  };
}

/**
 * Life Score recommendations
 */
export function getLifeScoreRecommendations(data: DailyData): string[] {
  const recommendations: string[] = [];

  // Tasks
  if (data.tasksCompleted < 3) {
    recommendations.push('Complete at least 3 tasks today to improve your score.');
  }

  // Study
  if (data.studyMinutes < 120) {
    recommendations.push('Add 2 hours of study time to maximize your study score.');
  }

  // Habits
  if (data.habitsTotal > 0 && data.habitsCompleted < data.habitsTotal) {
    recommendations.push(`You have ${data.habitsTotal - data.habitsCompleted} habits left today.`);
  }

  // Time
  if (data.timeLoggedMinutes < 180) {
    recommendations.push('Log at least 3 hours of focused work time.');
  }

  // Health
  if (data.sleepHours && data.sleepHours < 7) {
    recommendations.push('Aim for 7-8 hours of sleep for better health score.');
  }
  if (!data.exerciseMinutes || data.exerciseMinutes < 30) {
    recommendations.push('30 minutes of exercise can boost your health score.');
  }

  // Finance
  if (data.budgetSpent && data.budgetAllocated && data.budgetSpent > data.budgetAllocated) {
    recommendations.push('Your budget is overspent. Review your expenses.');
  }

  return recommendations;
}
