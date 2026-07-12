export type ClearingType = "practice-then-pass" | "timed-pass";
export type ProblemStyle = "numpad" | "multiple-choice";

export interface Stage {
  id: string;
  name: string;
  description: string;
  category: string;
  clearingType: ClearingType;
  problemStyle: ProblemStyle;
  sctSeconds: number;
  levelClearSeconds: number;
  questionsPerDay: number;
  levelClearQuestions: number;
  practiceSessionsRequired: number;
}

export const STAGES: Stage[] = [
  // --- Practice-then-pass stages (foundation skills) ---
  {
    id: "6A",
    name: "Know Your Numbers",
    description: "Recognise written numerals 1–10",
    category: "Number Recognition",
    clearingType: "practice-then-pass",
    problemStyle: "multiple-choice",
    sctSeconds: 180,
    levelClearSeconds: 30,
    questionsPerDay: 10,
    levelClearQuestions: 10,
    practiceSessionsRequired: 5,
  },
  {
    id: "5A",
    name: "Count to 10",
    description: "Count objects and pick the right number",
    category: "Counting",
    clearingType: "practice-then-pass",
    problemStyle: "multiple-choice",
    sctSeconds: 180,
    levelClearSeconds: 30,
    questionsPerDay: 10,
    levelClearQuestions: 10,
    practiceSessionsRequired: 5,
  },
  {
    id: "4A",
    name: "Count to 30",
    description: "Count larger groups of objects",
    category: "Counting",
    clearingType: "practice-then-pass",
    problemStyle: "multiple-choice",
    sctSeconds: 240,
    levelClearSeconds: 30,
    questionsPerDay: 10,
    levelClearQuestions: 10,
    practiceSessionsRequired: 5,
  },
  {
    id: "3A",
    name: "Number Sequence",
    description: "Fill in the missing number in a sequence",
    category: "Sequencing",
    clearingType: "practice-then-pass",
    problemStyle: "multiple-choice",
    sctSeconds: 240,
    levelClearSeconds: 30,
    questionsPerDay: 10,
    levelClearQuestions: 10,
    practiceSessionsRequired: 5,
  },
  // --- Timed-pass stages (computation) ---
  {
    id: "2A",
    name: "Add Small",
    description: "Addition with +1 to +3",
    category: "Addition",
    clearingType: "timed-pass",
    problemStyle: "numpad",
    sctSeconds: 180,
    levelClearSeconds: 45,
    questionsPerDay: 15,
    levelClearQuestions: 15,
    practiceSessionsRequired: 3,
  },
  {
    id: "A",
    name: "Add to 10",
    description: "Addition with numbers up to 10",
    category: "Addition",
    clearingType: "timed-pass",
    problemStyle: "numpad",
    sctSeconds: 180,
    levelClearSeconds: 45,
    questionsPerDay: 15,
    levelClearQuestions: 15,
    practiceSessionsRequired: 3,
  },
  {
    id: "B",
    name: "Add to 20",
    description: "Two-digit + single-digit, sums up to 20",
    category: "Addition",
    clearingType: "timed-pass",
    problemStyle: "numpad",
    sctSeconds: 180,
    levelClearSeconds: 45,
    questionsPerDay: 15,
    levelClearQuestions: 15,
    practiceSessionsRequired: 3,
  },
  {
    id: "C",
    name: "Subtract Small",
    description: "Subtraction within 10",
    category: "Subtraction",
    clearingType: "timed-pass",
    problemStyle: "numpad",
    sctSeconds: 180,
    levelClearSeconds: 45,
    questionsPerDay: 15,
    levelClearQuestions: 15,
    practiceSessionsRequired: 3,
  },
  {
    id: "D",
    name: "Subtract to 20",
    description: "Subtraction within 20",
    category: "Subtraction",
    clearingType: "timed-pass",
    problemStyle: "numpad",
    sctSeconds: 200,
    levelClearSeconds: 45,
    questionsPerDay: 15,
    levelClearQuestions: 15,
    practiceSessionsRequired: 3,
  },
  {
    id: "E",
    name: "Multiply",
    description: "Times tables: 2, 5, 10",
    category: "Multiplication",
    clearingType: "timed-pass",
    problemStyle: "numpad",
    sctSeconds: 240,
    levelClearSeconds: 45,
    questionsPerDay: 15,
    levelClearQuestions: 15,
    practiceSessionsRequired: 3,
  },
  {
    id: "F",
    name: "Divide",
    description: "Simple division (2, 5, 10)",
    category: "Division",
    clearingType: "timed-pass",
    problemStyle: "numpad",
    sctSeconds: 240,
    levelClearSeconds: 45,
    questionsPerDay: 15,
    levelClearQuestions: 15,
    practiceSessionsRequired: 3,
  },
];

export function getStageById(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}

export function getNextStage(currentId: string): Stage | undefined {
  const idx = STAGES.findIndex((s) => s.id === currentId);
  return idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : undefined;
}

export function getStartingStageForAge(age: number): string {
  if (age <= 4) return "6A";
  if (age <= 6) return "5A";
  if (age <= 8) return "3A";
  if (age <= 10) return "2A";
  return "A";
}
