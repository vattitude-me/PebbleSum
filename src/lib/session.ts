import { Stage, getNextStage } from "./stages";
import { UserProgress, SessionRecord, calculateXpGain, getToday, isStreakActive } from "./progress-store";
import { GameState } from "./user-store";

export type SessionMode = "practice" | "levelClear";

/**
 * Estimates how comfortable the learner is with a stage (0 = struggling,
 * 1 = fluent) from their most recent practice sessions on it. Used to centre
 * the practice difficulty ramp so each session is challenging but winnable.
 */
export function getStageSkill(progress: Pick<UserProgress, "completedSessions">, stageId: string): number {
  const recent = progress.completedSessions.filter((s) => s.stageId === stageId).slice(-4);
  let skill = 0.35;
  for (const session of recent) {
    const accuracy = session.total > 0 ? session.correct / session.total : 0;
    if (accuracy >= 0.95 && session.withinSCT) skill += 0.15;
    else if (accuracy >= 0.8) skill += 0.05;
    else if (accuracy < 0.6) skill -= 0.15;
  }
  return Math.min(0.85, Math.max(0.1, skill));
}

/**
 * Practice adapts to the learner; the level-clear test uses a fixed range so
 * every learner is measured against the same bar.
 */
export function getDifficultyRange(mode: SessionMode, skill: number): { from: number; to: number } {
  if (mode === "levelClear") return { from: 0.4, to: 1 };
  return { from: Math.max(0, skill - 0.3), to: Math.min(1, skill + 0.25) };
}

export interface SessionInput {
  stage: Stage;
  mode: SessionMode;
  progress: UserProgress;
  gameState: GameState;
  dailyGoalMinutes: number;
  /** Questions answered right on the first try. */
  correct: number;
  total: number;
  mistakes: number;
  timeSeconds: number;
  /** Set when the learner ran out of hearts before finishing a test. */
  abandoned?: boolean;
  /** Advance to the next stage regardless of mode (e.g. 6A auto-clear). */
  forceAdvance?: boolean;
  today?: string;
}

export interface SessionOutcome {
  updatedProgress: UserProgress;
  updatedGameState: GameState;
  xpGain: number;
  coinsGained: number;
  perfect: boolean;
  withinTime: boolean;
  levelCleared: boolean;
  advancedTo: Stage | undefined;
}

export function passedLevelClear(stage: Stage, mistakes: number, timeSeconds: number, abandoned = false): boolean {
  return !abandoned && mistakes <= stage.mistakesAllowed && timeSeconds <= stage.levelClearSeconds;
}

/** Pure: computes the new progress and game state after a session. */
export function applySessionResult(input: SessionInput): SessionOutcome {
  const { stage, mode, progress, gameState, correct, total, mistakes, timeSeconds, abandoned = false, forceAdvance = false } = input;
  const today = input.today ?? getToday();
  const isLevelClear = mode === "levelClear";
  const timeLimit = isLevelClear ? stage.levelClearSeconds : stage.sctSeconds;
  const perfect = !abandoned && correct === total;
  const withinTime = timeSeconds <= timeLimit;

  const levelCleared = forceAdvance || (isLevelClear && passedLevelClear(stage, mistakes, timeSeconds, abandoned));
  const nextStage = getNextStage(stage.id);
  const advancedTo = levelCleared && stage.id === progress.currentStageId ? nextStage : undefined;

  // A failed test earns nothing so it can't be farmed; practice always pays.
  const earns = !isLevelClear || levelCleared;
  const xpGain = earns ? calculateXpGain(correct, total, withinTime) : 0;
  const coinsGained = earns ? Math.floor(xpGain / 5) + (perfect ? 10 : 0) : 0;

  const streakActive = isStreakActive(progress.lastPracticeDate);
  const lastDay = progress.lastPracticeDate?.split("T")[0];
  const newStreak = streakActive ? progress.streak + (lastDay === today ? 0 : 1) : 1;

  const currentPracticeCount = progress.stagePracticeCounts[stage.id] || 0;
  const session: SessionRecord = { date: today, stageId: stage.id, correct, total, timeSeconds, perfect, withinSCT: withinTime };

  const updatedProgress: UserProgress = {
    ...progress,
    xp: progress.xp + xpGain,
    streak: newStreak,
    lastPracticeDate: today,
    consecutivePerfectDays: perfect && withinTime ? progress.consecutivePerfectDays + 1 : 0,
    currentStageId: advancedTo ? advancedTo.id : progress.currentStageId,
    completedSessions: [...progress.completedSessions, session],
    stagePracticeCounts: {
      ...progress.stagePracticeCounts,
      [stage.id]: isLevelClear ? currentPracticeCount : currentPracticeCount + 1,
    },
  };

  const isSameDay = gameState.practiceDate === today;
  const todayPracticeSeconds = (isSameDay ? gameState.todayPracticeSeconds : 0) + timeSeconds;

  const updatedGameState: GameState = {
    ...gameState,
    coins: gameState.coins + coinsGained,
    dailyGoalCompleted: todayPracticeSeconds >= input.dailyGoalMinutes * 60,
    todayPracticeSeconds,
    practiceDate: today,
    todaySessionCount: (isSameDay ? gameState.todaySessionCount : 0) + 1,
    longestStreak: Math.max(gameState.longestStreak, newStreak),
    totalSessionsCompleted: gameState.totalSessionsCompleted + 1,
    totalCorrectAnswers: gameState.totalCorrectAnswers + correct,
    totalQuestionsAnswered: gameState.totalQuestionsAnswered + total,
  };

  return { updatedProgress, updatedGameState, xpGain, coinsGained, perfect, withinTime, levelCleared, advancedTo };
}
