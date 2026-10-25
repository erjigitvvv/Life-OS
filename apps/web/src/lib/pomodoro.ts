/**
 * LifeOS Pomodoro Timer Logic
 * Pure functions for timer state management
 */

export interface PomodoroState {
  mode: 'focus' | 'short_break' | 'long_break';
  secondsRemaining: number;
  totalSeconds: number;
  cyclesCompleted: number;
  running: boolean;
}

export const POMODORO_MODES = {
  focus: { duration: 25 * 60, label: 'Focus' },
  short_break: { duration: 5 * 60, label: 'Short Break' },
  long_break: { duration: 15 * 60, label: 'Long Break' },
} as const;

export function createPomodoroState(mode: 'focus' | 'short_break' | 'long_break' = 'focus'): PomodoroState {
  const duration = POMODORO_MODES[mode].duration;
  return {
    mode,
    secondsRemaining: duration,
    totalSeconds: duration,
    cyclesCompleted: 0,
    running: false,
  };
}

export function startPomodoro(state: PomodoroState, mode?: 'focus' | 'short_break' | 'long_break'): PomodoroState {
  const newMode = mode || state.mode;
  const duration = POMODORO_MODES[newMode].duration;
  return {
    ...state,
    mode: newMode,
    secondsRemaining: duration,
    totalSeconds: duration,
    running: true,
  };
}

export function pausePomodoro(state: PomodoroState): PomodoroState {
  return { ...state, running: false };
}

export function resumePomodoro(state: PomodoroState): PomodoroState {
  return { ...state, running: true };
}

export function completePomodoro(state: PomodoroState, taskId?: string): PomodoroState {
  const nextMode = state.mode === 'focus' ? 'short_break' : 'focus';
  const nextState: PomodoroState = {
    ...state,
    mode: nextMode,
    secondsRemaining: POMODORO_MODES[nextMode].duration,
    totalSeconds: POMODORO_MODES[nextMode].duration,
    running: false,
    cyclesCompleted: state.mode === 'focus' ? state.cyclesCompleted + 1 : state.cyclesCompleted,
  };

  if (taskId) {
    void logPomodoroEvent(taskId);
  }

  return nextState;
}

export function getPomodoroDisplay(state: PomodoroState): { minutes: number; seconds: number } {
  const totalSeconds = state.secondsRemaining;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
}

async function logPomodoroEvent(taskId: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'default_user',
        event_type: 'pomodoro_complete',
        event_category: 'focus',
        title: `Pomodoro completed for task ${taskId}`,
        context: { task_id: taskId },
        source: 'web',
      }),
    });
  } catch {
    // Silent fail
  }
}
