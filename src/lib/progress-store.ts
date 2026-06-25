export interface UserProgress {
  currentStageId: string;
  xp: number;
  streak: number;
  lastPracticeDate: string | null;
  consecutivePerfectDays: number;
  completedSessions: SessionRecord[];
}

export interface SessionRecord {
  date: string;
  stageId: string;
  correct: number;
  total: number;
  timeSeconds: number;
  perfect: boolean;
  withinSCT: boolean;
}

const STORAGE_KEY = "pebblesum_progress";

const DEFAULT_PROGRESS: UserProgress = {
  currentStageId: "6A",
  xp: 0,
  streak: 0,
  lastPracticeDate: null,
  consecutivePerfectDays: 0,
  completedSessions: [],
};

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_PROGRESS;
  try {
    return JSON.parse(stored) as UserProgress;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function calculateXpGain(correct: number, total: number, withinSCT: boolean): number {
  const baseXp = correct * 10;
  const perfectBonus = correct === total ? 50 : 0;
  const speedBonus = withinSCT ? 25 : 0;
  return baseXp + perfectBonus + speedBonus;
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function isStreakActive(lastDate: string | null): boolean {
  if (!lastDate) return false;
  const last = new Date(lastDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 1.5;
}
