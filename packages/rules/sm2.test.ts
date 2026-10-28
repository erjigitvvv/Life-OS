import { describe, it, expect } from 'vitest';
import { calculateSM2, isDueForReview, calculateRetentionRate, SM2Input } from './sm2';

describe('SM-2 Spaced Repetition Algorithm', () => {
  const baseDate = new Date('2026-10-22T00:00:00Z');

  it('calculates first review with high quality rating', () => {
    const input: SM2Input = {
      quality: 5,
      easinessFactor: 2.5,
      interval: 0,
      repetitions: 0,
    };

    const result = calculateSM2(input, baseDate);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1); // 1 day for first review
    expect(result.easinessFactor).toBeGreaterThanOrEqual(2.5);
  });

  it('calculates second review with high quality rating', () => {
    const input: SM2Input = {
      quality: 5,
      easinessFactor: 2.6,
      interval: 1,
      repetitions: 1,
    };

    const result = calculateSM2(input, baseDate);
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6); // 6 days for second review
  });

  it('resets repetitions on failure (quality < 3)', () => {
    const input: SM2Input = {
      quality: 2,
      easinessFactor: 2.5,
      interval: 15,
      repetitions: 4,
    };

    const result = calculateSM2(input, baseDate);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1); // reset to tomorrow
  });

  it('never lets easiness factor drop below 1.3', () => {
    let ef = 1.35;
    for (let i = 0; i < 5; i++) {
      const res = calculateSM2(
        { quality: 0, easinessFactor: ef, interval: 1, repetitions: 0 },
        baseDate
      );
      ef = res.easinessFactor;
    }
    expect(ef).toBe(1.3);
  });

  it('correctly detects if review is due', () => {
    const pastDate = new Date('2026-10-20T00:00:00Z');
    const futureDate = new Date('2026-10-25T00:00:00Z');
    const today = new Date('2026-10-22T00:00:00Z');

    expect(isDueForReview(pastDate, today)).toBe(true);
    expect(isDueForReview(today, today)).toBe(true);
    expect(isDueForReview(futureDate, today)).toBe(false);
  });

  it('calculates retention rate from review history', () => {
    const reviews = [
      { quality: 5 },
      { quality: 4 },
      { quality: 3 },
      { quality: 2 }, // failed
    ];

    expect(calculateRetentionRate(reviews)).toBe(75);
    expect(calculateRetentionRate([])).toBe(0);
  });
});
