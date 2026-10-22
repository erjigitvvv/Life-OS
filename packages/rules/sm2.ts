/**
 * SM-2 (SuperMemo-2) Spaced Repetition Algorithm
 *
 * Flashcard takrorlash oralig'ini hisoblash uchun.
 * Anki va SuperMemo tomonidan ishlatiladi.
 *
 * Quality (0-5):
 * 5: Mukammal xotira (hesitation yo'q)
 * 4: To'g'ri javob, ozgina ikkilanish
 * 3: To'g'ri javob, qiyinchilik bilan eslandi
 * 2: Noto'g'ri javob, lekin to'g'ri javob tanish tuyuldi
 * 1: Noto'g'ri javob, to'g'ri javob eslandi
 * 0: To'liq esdan chiqdi
 */

export interface SM2Input {
  quality: number; // 0-5
  easinessFactor: number; // default: 2.5
  interval: number; // kunlarda, default: 1
  repetitions: number; // muvaffaqiyatli takrorlashlar soni
}

export interface SM2Output {
  easinessFactor: number;
  interval: number; // kunlarda
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * Calculate next review date using SM-2 algorithm
 */
export function calculateSM2(input: SM2Input, currentDate: Date = new Date()): SM2Output {
  const { quality, repetitions } = input;
  let { easinessFactor, interval } = input;

  // Validate quality (0-5)
  const q = Math.max(0, Math.min(5, quality));

  let nextRepetitions = repetitions;
  let nextInterval = interval;

  // If quality >= 3, recall was successful
  if (q >= 3) {
    if (repetitions === 0) {
      nextInterval = 1; // 1 kun
    } else if (repetitions === 1) {
      nextInterval = 6; // 6 kun
    } else {
      nextInterval = Math.round(interval * easinessFactor);
    }
    nextRepetitions = repetitions + 1;
  } else {
    // Recall failed, reset repetitions
    nextRepetitions = 0;
    nextInterval = 1; // Ertaga qayta takrorlash
  }

  // Update Easiness Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEF = easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  // EF must not fall below 1.3
  const nextEasinessFactor = Math.max(1.3, Math.round(newEF * 100) / 100);

  // Calculate next review date
  const nextReviewDate = new Date(currentDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    easinessFactor: nextEasinessFactor,
    interval: nextInterval,
    repetitions: nextRepetitions,
    nextReviewDate,
  };
}

/**
 * Quality rating descriptions
 */
export const SM2_RATINGS = [
  { value: 5, label: 'Mukammal', description: 'Hech ikkilanmasdan esladim', color: '#10b981' },
  { value: 4, label: 'Yaxshi', description: 'Ozgina o\'ylab esladim', color: '#06b6d4' },
  { value: 3, label: 'Qiyin', description: 'Katta qiyinchilik bilan esladim', color: '#f59e0b' },
  { value: 2, label: 'Noto\'g\'ri', description: 'Javob tanish tuyuldi', color: '#f97316' },
  { value: 1, label: 'Esdan chiqdi', description: 'Javobni ko\'rib esladim', color: '#ef4444' },
  { value: 0, label: 'To\'liq unutdim', description: 'Umuman eslay olmadim', color: '#dc2626' },
] as const;

/**
 * Check if a flashcard is due for review
 */
export function isDueForReview(nextReviewDate: Date, currentDate: Date = new Date()): boolean {
  const review = new Date(nextReviewDate);
  review.setHours(0, 0, 0, 0);

  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  return review <= current;
}

/**
 * Calculate retention rate based on review history
 */
export function calculateRetentionRate(reviews: Array<{ quality: number }>): number {
  if (reviews.length === 0) return 0;
  const successful = reviews.filter(r => r.quality >= 3).length;
  return Math.round((successful / reviews.length) * 100);
}
