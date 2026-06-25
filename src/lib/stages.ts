export interface Stage {
  id: string;
  name: string;
  description: string;
  category: string;
  sctSeconds: number;
  questionsPerDay: number;
  unlockRequirement: number;
}

export const STAGES: Stage[] = [
  {
    id: "6A",
    name: "Counting to 10",
    description: "Count objects from 1 to 10",
    category: "Motor Skills & Counting",
    sctSeconds: 300,
    questionsPerDay: 10,
    unlockRequirement: 0,
  },
  {
    id: "5A",
    name: "Counting to 30",
    description: "Count objects from 1 to 30",
    category: "Motor Skills & Counting",
    sctSeconds: 300,
    questionsPerDay: 10,
    unlockRequirement: 3,
  },
  {
    id: "4A",
    name: "Counting to 100",
    description: "Count and write numbers up to 100",
    category: "Motor Skills & Counting",
    sctSeconds: 360,
    questionsPerDay: 15,
    unlockRequirement: 3,
  },
  {
    id: "3A",
    name: "Addition +1 to +3",
    description: "Simple addition with small numbers",
    category: "Basic Addition",
    sctSeconds: 300,
    questionsPerDay: 20,
    unlockRequirement: 3,
  },
  {
    id: "2A",
    name: "Addition +4 to +10",
    description: "Addition with numbers up to 10",
    category: "Basic Addition",
    sctSeconds: 360,
    questionsPerDay: 20,
    unlockRequirement: 3,
  },
  {
    id: "A",
    name: "2-Digit Addition",
    description: "Addition with two-digit numbers",
    category: "Advanced Addition & Subtraction",
    sctSeconds: 420,
    questionsPerDay: 20,
    unlockRequirement: 3,
  },
  {
    id: "B",
    name: "Subtraction",
    description: "Basic and 2-digit subtraction",
    category: "Advanced Addition & Subtraction",
    sctSeconds: 420,
    questionsPerDay: 20,
    unlockRequirement: 3,
  },
  {
    id: "C",
    name: "Multiplication",
    description: "Multiplication tables and multi-digit",
    category: "Multiplication & Division",
    sctSeconds: 480,
    questionsPerDay: 20,
    unlockRequirement: 3,
  },
  {
    id: "D",
    name: "Division",
    description: "Division with and without remainders",
    category: "Multiplication & Division",
    sctSeconds: 480,
    questionsPerDay: 20,
    unlockRequirement: 3,
  },
  {
    id: "E",
    name: "Fractions & Decimals",
    description: "Operations with fractions and decimals",
    category: "Fractions & Order of Operations",
    sctSeconds: 600,
    questionsPerDay: 15,
    unlockRequirement: 3,
  },
  {
    id: "F",
    name: "Order of Operations",
    description: "BODMAS and mixed operations",
    category: "Fractions & Order of Operations",
    sctSeconds: 600,
    questionsPerDay: 15,
    unlockRequirement: 3,
  },
];

export function getStageById(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}

export function getNextStage(currentId: string): Stage | undefined {
  const idx = STAGES.findIndex((s) => s.id === currentId);
  return idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : undefined;
}
