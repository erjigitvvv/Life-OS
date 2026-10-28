import { describe, it, expect } from 'vitest';
import {
  calculateTrackerProgress,
  switchSubTrack,
  updateSubTrackerStatus,
  aggregateMultiTypeTracker,
  SubTracker,
  TrackerDefinition,
} from './tracker-rules';

describe('Tracker Rules & Sub-trackers', () => {
  const mockSubTrackers: SubTracker[] = [
    {
      id: '1',
      tracker_id: 't1',
      title: 'Sub 1',
      status: 'success',
      target_track: 'sleep',
      boolean_status: true,
      date: '2026-10-24',
    },
    {
      id: '2',
      tracker_id: 't1',
      title: 'Sub 2',
      status: 'failed',
      target_track: 'ielts',
      boolean_status: false,
      date: '2026-10-24',
    },
    {
      id: '3',
      tracker_id: 't1',
      title: 'Sub 3',
      status: 'pending',
      target_track: 'work',
      boolean_status: false,
      date: '2026-10-24',
    },
  ];

  it('calculates dynamic tracker progress correctly', () => {
    const progress = calculateTrackerProgress(mockSubTrackers);
    // 1 success out of 3 = 33%
    expect(progress).toBe(33);
  });

  it('switches sub-track target track dynamically', () => {
    const updated = switchSubTrack(mockSubTrackers[1], 'sleep');
    expect(updated.target_track).toBe('sleep');
  });

  it('updates sub-tracker status with dual symbols and boolean status', () => {
    const updated = updateSubTrackerStatus(mockSubTrackers[2], 'success');
    expect(updated.status).toBe('success');
    expect(updated.boolean_status).toBe(true);
  });

  it('aggregates multi-type excel-like matrix correctly', () => {
    const trackers: TrackerDefinition[] = [
      {
        id: 't1',
        name: 'Daily Productivity',
        category: 'Work',
        unit: 'hours',
        goalType: 'daily',
        isBoolean: false,
        subTrackers: mockSubTrackers,
        createdAt: '2026-10-24',
      },
    ];

    const matrix = aggregateMultiTypeTracker(trackers);
    expect(matrix).toHaveLength(1);
    expect(matrix[0].trackerName).toBe('Daily Productivity');
    expect(matrix[0].statusSummary.success).toBe(1);
    expect(matrix[0].statusSummary.failed).toBe(1);
    expect(matrix[0].statusSummary.pending).toBe(1);
  });
});
