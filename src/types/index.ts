export type CategoryType = 'deep_work' | 'meeting' | 'review' | 'urgent' | 'buffer';
export type PriorityType = 'high' | 'medium' | 'low';
export type TimelineViewMode = '1-day' | '3-day' | '7-day' | 'chamber' | 'analytics';
export type SoundscapeType = 'off' | 'rain' | 'binaural' | 'drone' | 'whitenoise';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TimeBlock {
  id: string;
  title: string;
  category: CategoryType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  completed: boolean;
  priority: PriorityType;
  notes: string;
  subtasks: Subtask[];
  colorTag?: string;
}

export interface BacklogTask {
  id: string;
  title: string;
  category: CategoryType;
  estimatedMinutes: number;
  priority: PriorityType;
  notes?: string;
  subtasks?: Subtask[];
  createdAt: string;
}

export interface FocusSessionState {
  activeBlockId: string | null;
  mode: 'pomodoro' | 'stopwatch' | 'custom';
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  soundscape: SoundscapeType;
  soundVolume: number; // 0.0 - 1.0
  elapsedSeconds: number;
}

export interface CategoryConfig {
  id: CategoryType;
  label: string;
  color: string;
  borderAccent: string;
  bgTint: string;
  textBadge: string;
  iconName: string;
}
