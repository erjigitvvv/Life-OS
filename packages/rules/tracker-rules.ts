/**
 * LifeOS Sub-Tracker & Multi-Type Excel-like Rules
 *
 * Sub-trackers, dual status marks (green check / red cross), dynamic track switching,
 * dynamic percentage calculation, boolean status, and multi-type Excel-like matrix support.
 */

export type DualStatus = 'success' | 'failed' | 'pending';

export type GoalType = 'daily' | 'weekly' | 'monthly' | 'multi';

export interface SubTracker {
  id: string;
  tracker_id: string;
  title: string;
  status: DualStatus; // 'success' (green check) | 'failed' (red cross) | 'pending'
  target_track: string; // e.g., 'sleep', 'ielts', 'work', 'health'
  boolean_status: boolean;
  value?: number;
  unit?: string;
  date: string;
}

export interface TrackerDefinition {
  id: string;
  name: string;
  category: string;
  unit: string;
  goalType: GoalType;
  isBoolean: boolean;
  subTrackers: SubTracker[];
  createdAt: string;
}

/**
 * Symbol mapping for dual status marks
 */
export const DUAL_STATUS_SYMBOLS: Record<DualStatus, string> = {
  success: '✅',
  failed: '❌',
  pending: '⏳',
};

/**
 * Dynamically calculate completion percentage based on sub-trackers success vs total
 */
export function calculateTrackerProgress(subTrackers: SubTracker[]): number {
  if (!subTrackers || subTrackers.length === 0) return 0;

  const completedCount = subTrackers.filter(st => st.status === 'success' || st.boolean_status === true).length;
  return Math.round((completedCount / subTrackers.length) * 100);
}

/**
 * Switch a sub-track to a different track (e.g. from 'work' to 'sleep' or 'ielts')
 */
export function switchSubTrack(subTracker: SubTracker, newTrack: string): SubTracker {
  return {
    ...subTracker,
    target_track: newTrack,
  };
}

/**
 * Update sub-tracker status with dual symbols (success / failed) and boolean status
 */
export function updateSubTrackerStatus(subTracker: SubTracker, status: DualStatus): SubTracker {
  return {
    ...subTracker,
    status,
    boolean_status: status === 'success',
  };
}

/**
 * Excel-like multi-type aggregation (Daily, Weekly, Monthly matrix)
 */
export interface MultiTypeMatrixRow {
  trackerId: string;
  trackerName: string;
  category: string;
  unit: string;
  goalType: GoalType;
  dailyProgress: number;   // %
  weeklyProgress: number;  // %
  monthlyProgress: number; // %
  overallProgress: number; // %
  statusSummary: {
    success: number;
    failed: number;
    pending: number;
  };
}

export function aggregateMultiTypeTracker(trackers: TrackerDefinition[]): MultiTypeMatrixRow[] {
  return trackers.map(tracker => {
    const subs = tracker.subTrackers || [];
    const successCount = subs.filter(s => s.status === 'success').length;
    const failedCount = subs.filter(s => s.status === 'failed').length;
    const pendingCount = subs.filter(s => s.status === 'pending').length;

    const progress = calculateTrackerProgress(subs);

    return {
      trackerId: tracker.id,
      trackerName: tracker.name,
      category: tracker.category,
      unit: tracker.unit,
      goalType: tracker.goalType,
      dailyProgress: progress,
      weeklyProgress: progress, // aggregated or period specific
      monthlyProgress: progress,
      overallProgress: progress,
      statusSummary: {
        success: successCount,
        failed: failedCount,
        pending: pendingCount,
      },
    };
  });
}
