export type ClearingType = "practice-then-pass" | "timed-pass";
export type ProblemStyle = "numpad" | "multiple-choice";
/** Which extra keys the numpad needs: whole numbers, decimals ("."), or signed ("−"). */
export type KeypadMode = "whole" | "decimal" | "signed";

export interface Stage {
  id: string;
  name: string;
  description: string;
  category: string;
  /** Typical learner age for this stage — shown to parents, never used to gate. */
  ages: string;
  clearingType: ClearingType;
  problemStyle: ProblemStyle;
  keypad: KeypadMode;
  /** Standard Clear Time for a daily practice session. */
  sctSeconds: number;
  levelClearSeconds: number;
  questionsPerDay: number;
  levelClearQuestions: number;
  practiceSessionsRequired: number;
  /** Mistakes tolerated in a level-clear run. Hearts shown = mistakesAllowed + 1. */
  mistakesAllowed: number;
}

type StageSeed = Pick<Stage, "id" | "name" | "description" | "category" | "ages"> & Partial<Stage> & {
  /** Seconds a fluent learner needs per question; drives both time limits. */
  secondsPerQuestion?: number;
};

// Foundation stages: tap-to-answer, cleared by steady practice rather than the clock.
function foundation(seed: StageSeed): Stage {
  return {
    clearingType: "practice-then-pass",
    problemStyle: "multiple-choice",
    keypad: "whole",
    sctSeconds: 240,
    levelClearSeconds: 60,
    questionsPerDay: 10,
    levelClearQuestions: 10,
    practiceSessionsRequired: 3,
    mistakesAllowed: 1,
    ...seed,
  };
}

// Computation stages: numpad answers, cleared by a timed test.
// Practice gets a relaxed 3x time target; the test gets ~1.4x fluent pace + a small buffer.
function computation(seed: StageSeed): Stage {
  const perQuestion = seed.secondsPerQuestion ?? 4;
  const questions = seed.levelClearQuestions ?? 15;
  return {
    clearingType: "timed-pass",
    problemStyle: "numpad",
    keypad: "whole",
    sctSeconds: Math.round(perQuestion * questions * 3),
    levelClearSeconds: Math.round(perQuestion * questions * 1.4 + 10),
    questionsPerDay: 15,
    levelClearQuestions: questions,
    practiceSessionsRequired: 3,
    mistakesAllowed: 1,
    ...seed,
  };
}

// Stage IDs from the original curriculum (6A–F) are kept so saved progress stays valid.
export const STAGES: Stage[] = [
  // --- Pebble Meadow (ages 3–5) ---
  foundation({
    id: "6A",
    name: "Know Your Numbers",
    description: "Meet the numbers 0–9",
    category: "Number Recognition",
    ages: "3–4",
    questionsPerDay: 5,
    levelClearQuestions: 5,
    practiceSessionsRequired: 10,
    sctSeconds: 300,
  }),
  foundation({ id: "5A", name: "Count to 10", description: "Count objects and pick the right number", category: "Counting", ages: "3–5" }),

  // --- Number Forest (ages 4–6) ---
  foundation({ id: "4A", name: "Count to 30", description: "Count bigger groups — tens help!", category: "Counting", ages: "4–5" }),
  foundation({ id: "3A", name: "Number Patterns", description: "Find the missing number in a pattern", category: "Sequencing", ages: "5–6" }),
  foundation({ id: "CMP", name: "Bigger or Smaller", description: "Compare numbers up to 100", category: "Comparing", ages: "5–6" }),

  // --- Addition River (ages 5–8) ---
  computation({ id: "2A", name: "Add Small", description: "Add 1, 2 or 3", category: "Addition", ages: "5–6", secondsPerQuestion: 3 }),
  computation({ id: "A", name: "Add to 10", description: "Sums up to 10", category: "Addition", ages: "5–6", secondsPerQuestion: 3 }),
  computation({ id: "BND", name: "Make 10", description: "Number bonds: what's missing?", category: "Addition", ages: "6–7", secondsPerQuestion: 3 }),
  computation({ id: "B", name: "Add to 20", description: "Cross the ten: 8 + 5, 9 + 7", category: "Addition", ages: "6–7", secondsPerQuestion: 3.5 }),
  computation({ id: "A2", name: "Add Big Numbers", description: "Two-digit sums, no carrying", category: "Addition", ages: "7–8", secondsPerQuestion: 5 }),
  computation({ id: "A3", name: "Carry the One", description: "Two-digit sums with carrying", category: "Addition", ages: "7–8", secondsPerQuestion: 7 }),

  // --- Subtraction Cave (ages 6–9) ---
  computation({ id: "C", name: "Subtract Small", description: "Take away within 10", category: "Subtraction", ages: "6–7", secondsPerQuestion: 3 }),
  computation({ id: "D", name: "Subtract to 20", description: "Take away across the ten", category: "Subtraction", ages: "6–7", secondsPerQuestion: 4 }),
  computation({ id: "S2", name: "Subtract Big Numbers", description: "Two-digit subtraction, no borrowing", category: "Subtraction", ages: "7–8", secondsPerQuestion: 5 }),
  computation({ id: "S3", name: "Borrow a Ten", description: "Two-digit subtraction with borrowing", category: "Subtraction", ages: "8–9", secondsPerQuestion: 7 }),
  computation({ id: "MIX", name: "Missing Numbers", description: "Find the hidden number in + and − facts", category: "Subtraction", ages: "8–9", secondsPerQuestion: 7 }),

  // --- Multiply Castle (ages 7–10) ---
  computation({ id: "E", name: "Times 2, 5, 10", description: "The friendly times tables", category: "Multiplication", ages: "7–8", secondsPerQuestion: 3.5 }),
  computation({ id: "M2", name: "Times 3 and 4", description: "Tables of 3 and 4 up to ×12", category: "Multiplication", ages: "8–9", secondsPerQuestion: 4 }),
  computation({ id: "M3", name: "All the Tables", description: "Every times table to 12 × 12", category: "Multiplication", ages: "8–10", secondsPerQuestion: 4 }),
  computation({ id: "M4", name: "Big Multiply", description: "Two-digit × one-digit", category: "Multiplication", ages: "9–10", secondsPerQuestion: 9 }),

  // --- Division Galaxy (ages 8–11) ---
  computation({ id: "F", name: "Share by 2, 5, 10", description: "Divide by the friendly numbers", category: "Division", ages: "8–9", secondsPerQuestion: 4 }),
  computation({ id: "V2", name: "Division Facts", description: "Divide using all the tables to 12", category: "Division", ages: "9–10", secondsPerQuestion: 4.5 }),
  computation({ id: "V3", name: "Big Divide", description: "Two- and three-digit ÷ one-digit", category: "Division", ages: "10–11", secondsPerQuestion: 10 }),

  // --- Fraction Falls (ages 9–12) ---
  computation({ id: "FR1", name: "Fraction Of", description: "Find ½, ¾, ⅔ of a number", category: "Fractions", ages: "9–11", secondsPerQuestion: 7 }),
  computation({ id: "FR2", name: "Add Fractions", description: "Add and subtract with the same denominator", category: "Fractions", ages: "10–11", secondsPerQuestion: 6 }),
  computation({ id: "DEC", name: "Decimals", description: "Add and subtract tenths", category: "Decimals", ages: "10–12", keypad: "decimal", secondsPerQuestion: 7 }),
  computation({ id: "PCT", name: "Percentages", description: "10%, 25%, 75% … of an amount", category: "Percentages", ages: "11–12", secondsPerQuestion: 8 }),

  // --- Algebra Summit (ages 11–15) ---
  computation({ id: "NEG", name: "Negative Numbers", description: "Add, subtract and multiply integers", category: "Integers", ages: "11–13", keypad: "signed", secondsPerQuestion: 6 }),
  computation({ id: "OOP", name: "BEDMAS", description: "Order of operations with brackets", category: "Order of Operations", ages: "11–13", secondsPerQuestion: 10 }),
  computation({ id: "SQR", name: "Powers & Roots", description: "Squares, cubes and square roots", category: "Exponents", ages: "12–14", secondsPerQuestion: 5 }),
  computation({ id: "X1", name: "Solve for x", description: "One-step equations", category: "Algebra", ages: "12–14", keypad: "signed", secondsPerQuestion: 7 }),
  computation({ id: "X2", name: "Two-Step Equations", description: "Undo two operations to find x", category: "Algebra", ages: "13–15", keypad: "signed", secondsPerQuestion: 12 }),
];

export function getStageById(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}

export function getStageIndex(id: string): number {
  return STAGES.findIndex((s) => s.id === id);
}

export function getNextStage(currentId: string): Stage | undefined {
  const idx = getStageIndex(currentId);
  return idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : undefined;
}

export interface Placement {
  id: string;
  icon: string;
  title: string;
  description: string;
  startStageId: string;
  ageGroup: "young" | "middle" | "older";
}

/** Onboarding placement options — "what can you already do?" mapped to a starting stage. */
export const PLACEMENTS: Placement[] = [
  { id: "numbers", icon: "🔢", title: "Learning numbers", description: "Counting and recognising 1, 2, 3…", startStageId: "6A", ageGroup: "young" },
  { id: "adding", icon: "➕", title: "Starting to add", description: "Small sums like 3 + 2", startStageId: "2A", ageGroup: "young" },
  { id: "bigger", icon: "💯", title: "Add & subtract", description: "Comfortable up to 20", startStageId: "A2", ageGroup: "middle" },
  { id: "times", icon: "✖️", title: "Times tables", description: "Ready to multiply and divide", startStageId: "E", ageGroup: "middle" },
  { id: "fractions", icon: "🍕", title: "Fractions & decimals", description: "Know my tables well", startStageId: "FR1", ageGroup: "older" },
  { id: "algebra", icon: "🧮", title: "Pre-algebra", description: "Negatives, BEDMAS, solving for x", startStageId: "NEG", ageGroup: "older" },
];

export function getStartingStageForSkill(skillLevel: "young" | "middle" | "older"): string {
  if (skillLevel === "young") return "6A";
  if (skillLevel === "middle") return "2A";
  return "E";
}
