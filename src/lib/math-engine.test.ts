import { describe, expect, it } from "vitest";
import { GENERATORS, buildChoices, createRng, generateProblem, generateProblems, isCorrectAnswer, MathProblem } from "./math-engine";
import { STAGES } from "./stages";

const DIFFICULTIES = [0, 0.25, 0.5, 0.75, 1];
const SAMPLES_PER_DIFFICULTY = 150;

/** Evaluates a rendered expression by substituting the answer, to prove problems are self-consistent. */
function evaluate(expr: string): number {
  const js = expr
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/(\d+)²/g, "($1**2)")
    .replace(/(\d+)³/g, "($1**3)")
    .replace(/√(\d+)/g, "Math.sqrt($1)")
    .replace(/(\d+)\/(\d+) of (\d+)/g, "($1/$2*$3)")
    .replace(/(\d+)% of (\d+)/g, "($1/100*$2)");
  return Function(`"use strict"; return (${js});`)() as number;
}

function checkEquation(p: MathProblem) {
  if (p.answerPrefix) {
    // "3x + 4 = 19" style: substitute x and check both sides agree.
    const [lhs, rhs] = p.expression.split("=");
    const substituted = lhs.replace(/(\d)x/g, "$1*x").replace(/x/g, `(${p.answer})`);
    expect(evaluate(substituted)).toBeCloseTo(evaluate(rhs), 6);
    return;
  }
  const [lhs, rhs] = p.expression.split("=");
  if (rhs.includes("/")) {
    // Fractions with a shared denominator: "2/7 + 3/7 = □/7"
    const filled = rhs.replace("□", String(p.answer));
    expect(evaluate(lhs)).toBeCloseTo(evaluate(filled), 6);
    return;
  }
  if (lhs.includes("□")) {
    expect(evaluate(lhs.replace("□", String(p.answer)))).toBeCloseTo(evaluate(rhs), 6);
  } else {
    expect(evaluate(lhs)).toBeCloseTo(p.answer, 6);
  }
}

describe("math engine", () => {
  it("should_have_a_generator_for_every_stage", () => {
    for (const stage of STAGES) {
      expect(GENERATORS[stage.id], stage.id).toBeTypeOf("function");
    }
  });

  it("should_produce_mathematically_correct_problems_when_generating_every_stage_at_every_difficulty", () => {
    const rng = createRng(42);
    for (const stage of STAGES) {
      for (const d of DIFFICULTIES) {
        for (let i = 0; i < SAMPLES_PER_DIFFICULTY; i++) {
          const p = generateProblem(stage.id, d, rng);
          expect(Number.isFinite(p.answer), `${stage.id} ${p.expression}`).toBe(true);
          expect(p.hint.length, `${stage.id} missing hint`).toBeGreaterThan(0);
          if (p.problemType === "equation") {
            try {
              checkEquation(p);
            } catch (e) {
              throw new Error(`${stage.id} @${d}: "${p.expression}" answer ${p.answer} — ${(e as Error).message}`);
            }
          }
        }
      }
    }
  });

  it("should_only_ask_for_whole_number_answers_when_stage_keypad_is_whole", () => {
    const rng = createRng(7);
    for (const stage of STAGES.filter((s) => s.keypad === "whole")) {
      for (const d of DIFFICULTIES) {
        for (let i = 0; i < SAMPLES_PER_DIFFICULTY; i++) {
          const p = generateProblem(stage.id, d, rng);
          expect(Number.isInteger(p.answer) && p.answer >= 0, `${stage.id}: ${p.expression} = ${p.answer}`).toBe(true);
        }
      }
    }
  });

  it("should_include_the_answer_exactly_once_when_offering_choices", () => {
    const rng = createRng(3);
    for (const stage of STAGES.filter((s) => s.problemStyle === "multiple-choice")) {
      for (const d of DIFFICULTIES) {
        for (let i = 0; i < 50; i++) {
          const p = generateProblem(stage.id, d, rng);
          const values = p.choices ?? p.visualChoices?.map((c) => c.value) ?? [];
          expect(values.filter((v) => v === p.answer)).toHaveLength(1);
          expect(new Set(values).size).toBe(values.length);
        }
      }
    }
  });

  it("should_produce_identical_sessions_when_given_the_same_seed", () => {
    const a = generateProblems("M3", 15, { seed: 99 }).map((p) => p.question);
    const b = generateProblems("M3", 15, { seed: 99 }).map((p) => p.question);
    expect(a).toEqual(b);
  });

  it("should_not_repeat_questions_within_a_session", () => {
    for (const stageId of ["A3", "M3", "OOP", "X2"]) {
      const questions = generateProblems(stageId, 15, { seed: 5 }).map((p) => p.question);
      expect(new Set(questions).size).toBe(questions.length);
    }
  });

  it("should_ramp_difficulty_from_easy_to_hard_across_a_session", () => {
    const problems = generateProblems("A3", 10, { from: 0.1, to: 0.9, seed: 1 });
    expect(problems[0].difficulty).toBeCloseTo(0.1);
    expect(problems[9].difficulty).toBeCloseTo(0.9);
    for (let i = 1; i < problems.length; i++) {
      expect(problems[i].difficulty).toBeGreaterThanOrEqual(problems[i - 1].difficulty);
    }
  });

  it("should_use_bigger_numbers_when_difficulty_is_higher", () => {
    const rng = createRng(11);
    const avg = (d: number) => {
      let sum = 0;
      for (let i = 0; i < 300; i++) sum += generateProblem("M3", d, rng).answer;
      return sum / 300;
    };
    expect(avg(1)).toBeGreaterThan(avg(0) * 1.3);
  });

  it("should_avoid_times_one_when_past_the_warm_up", () => {
    const rng = createRng(21);
    for (let i = 0; i < 300; i++) {
      const p = generateProblem("E", 0.6, rng);
      expect(p.expression).not.toMatch(/× 1 =|^1 ×/);
    }
  });

  it("should_accept_decimal_and_signed_input_when_checking_answers", () => {
    const decimal = { answer: 6.3 } as MathProblem;
    expect(isCorrectAnswer(decimal, "6.3")).toBe(true);
    expect(isCorrectAnswer(decimal, "6.30")).toBe(true);
    expect(isCorrectAnswer(decimal, "63")).toBe(false);
    const negative = { answer: -4 } as MathProblem;
    expect(isCorrectAnswer(negative, "-4")).toBe(true);
    expect(isCorrectAnswer(negative, "−4")).toBe(true);
    expect(isCorrectAnswer(negative, "")).toBe(false);
  });

  it("should_build_distinct_in_range_choices_when_range_is_tight", () => {
    const rng = createRng(8);
    for (let i = 0; i < 200; i++) {
      const choices = buildChoices(rng, 2, 1, 4, 4);
      expect(new Set(choices).size).toBe(4);
      expect(choices.every((c) => c >= 1 && c <= 4)).toBe(true);
    }
  });
});
