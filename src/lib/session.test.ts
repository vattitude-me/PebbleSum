import { describe, expect, it } from "vitest";
import { applySessionResult, getDifficultyRange, getStageSkill } from "./session";
import { getStageById, STAGES, PLACEMENTS } from "./stages";
import { WORLDS } from "./worlds";
import { UserProgress, SessionRecord } from "./progress-store";
import { GameState } from "./user-store";

const TODAY = new Date().toISOString().split("T")[0];

function progressAt(stageId: string, sessions: SessionRecord[] = []): UserProgress {
  return {
    currentStageId: stageId,
    xp: 0,
    streak: 0,
    lastPracticeDate: null,
    consecutivePerfectDays: 0,
    completedSessions: sessions,
    stagePracticeCounts: {},
  };
}

const GAME: GameState = {
  coins: 0, hearts: 5, maxHearts: 5, dailyGoalCompleted: false, todayPracticeSeconds: 0, practiceDate: "",
  todaySessionCount: 0, longestStreak: 0, totalSessionsCompleted: 0, totalCorrectAnswers: 0, totalQuestionsAnswered: 0,
  unlockedAvatars: [], unlockedThemes: [],
};

function session(stageId: string, correct: number, total: number, withinSCT: boolean): SessionRecord {
  return { date: TODAY, stageId, correct, total, timeSeconds: 60, perfect: correct === total, withinSCT };
}

describe("curriculum", () => {
  it("should_place_every_stage_in_exactly_one_world_in_curriculum_order", () => {
    const worldOrder = WORLDS.flatMap((w) => w.stageIds);
    expect(worldOrder).toEqual(STAGES.map((s) => s.id));
  });

  it("should_keep_original_stage_ids_when_curriculum_expands", () => {
    for (const id of ["6A", "5A", "4A", "3A", "2A", "A", "B", "C", "D", "E", "F"]) {
      expect(getStageById(id), id).toBeDefined();
    }
  });

  it("should_map_every_placement_to_a_real_stage", () => {
    for (const p of PLACEMENTS) expect(getStageById(p.startStageId), p.id).toBeDefined();
  });
});

describe("adaptive skill", () => {
  it("should_start_mid_low_when_learner_has_no_history", () => {
    expect(getStageSkill(progressAt("A"), "A")).toBeCloseTo(0.35);
  });

  it("should_rise_when_recent_sessions_are_perfect_and_fast", () => {
    const p = progressAt("A", [session("A", 15, 15, true), session("A", 15, 15, true)]);
    expect(getStageSkill(p, "A")).toBeCloseTo(0.65);
  });

  it("should_fall_when_recent_sessions_are_weak", () => {
    const p = progressAt("A", [session("A", 5, 15, false), session("A", 6, 15, false)]);
    expect(getStageSkill(p, "A")).toBeCloseTo(0.1);
  });

  it("should_ignore_sessions_from_other_stages", () => {
    const p = progressAt("A", [session("B", 15, 15, true), session("B", 15, 15, true)]);
    expect(getStageSkill(p, "A")).toBeCloseTo(0.35);
  });

  it("should_use_a_fixed_range_when_taking_the_level_clear_test", () => {
    expect(getDifficultyRange("levelClear", 0.1)).toEqual(getDifficultyRange("levelClear", 0.85));
  });
});

describe("applySessionResult", () => {
  const stageA = getStageById("A")!;

  it("should_advance_to_next_stage_when_level_clear_passes_within_allowed_mistakes", () => {
    const out = applySessionResult({
      stage: stageA, mode: "levelClear", progress: progressAt("A"), gameState: GAME, dailyGoalMinutes: 10,
      correct: 14, total: 15, mistakes: 1, timeSeconds: 40, today: TODAY,
    });
    expect(out.levelCleared).toBe(true);
    expect(out.updatedProgress.currentStageId).toBe("BND");
  });

  it("should_not_advance_or_pay_when_level_clear_is_too_slow", () => {
    const out = applySessionResult({
      stage: stageA, mode: "levelClear", progress: progressAt("A"), gameState: GAME, dailyGoalMinutes: 10,
      correct: 15, total: 15, mistakes: 0, timeSeconds: stageA.levelClearSeconds + 1, today: TODAY,
    });
    expect(out.levelCleared).toBe(false);
    expect(out.xpGain).toBe(0);
    expect(out.updatedProgress.currentStageId).toBe("A");
  });

  it("should_not_advance_when_learner_runs_out_of_hearts", () => {
    const out = applySessionResult({
      stage: stageA, mode: "levelClear", progress: progressAt("A"), gameState: GAME, dailyGoalMinutes: 10,
      correct: 5, total: 15, mistakes: 2, timeSeconds: 20, abandoned: true, today: TODAY,
    });
    expect(out.levelCleared).toBe(false);
  });

  it("should_count_practice_and_pay_xp_when_mode_is_practice", () => {
    const out = applySessionResult({
      stage: stageA, mode: "practice", progress: progressAt("A"), gameState: GAME, dailyGoalMinutes: 10,
      correct: 12, total: 15, mistakes: 3, timeSeconds: 100, today: TODAY,
    });
    expect(out.updatedProgress.stagePracticeCounts.A).toBe(1);
    expect(out.xpGain).toBeGreaterThan(0);
    expect(out.updatedProgress.streak).toBe(1);
  });

  it("should_not_move_current_stage_when_replaying_a_mastered_stage", () => {
    const out = applySessionResult({
      stage: stageA, mode: "levelClear", progress: progressAt("M3"), gameState: GAME, dailyGoalMinutes: 10,
      correct: 15, total: 15, mistakes: 0, timeSeconds: 30, today: TODAY,
    });
    expect(out.updatedProgress.currentStageId).toBe("M3");
  });
});
