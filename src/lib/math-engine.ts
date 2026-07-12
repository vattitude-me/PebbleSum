export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  displayParts: { left: string; operator: string; right: string };
  problemType: "equation" | "identify" | "count" | "sequence";
  choices?: number[];
  visualChoices?: { value: number; display: string }[];
  visual?: string;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateChoices(answer: number, min: number, max: number, count: number): number[] {
  const choices = new Set<number>([answer]);
  let attempts = 0;
  while (choices.size < count && attempts < 50) {
    const nearby = answer + rand(-3, 3);
    if (nearby >= min && nearby <= max && nearby !== answer) {
      choices.add(nearby);
    } else {
      choices.add(rand(min, max));
    }
    attempts++;
  }
  return shuffle([...choices]);
}

const ICONS = ["🍎", "⭐", "🌸", "🐟", "🦋", "🎈", "🌙", "🍀", "🐚"];

function pickIcon(): string {
  return ICONS[rand(0, ICONS.length - 1)];
}

// 6A: Number recognition — show a numeral, pick the matching group of objects
function generateIdentify6A(): MathProblem {
  const answer = rand(1, 10);
  const icon = pickIcon();
  const choiceValues = generateChoices(answer, 1, 10, 4);
  const visualChoices = choiceValues.map((v) => ({
    value: v,
    display: Array(v).fill(icon).join(" "),
  }));
  return {
    id: generateId(),
    question: `Pick ${answer}`,
    answer,
    displayParts: { left: String(answer), operator: "", right: "" },
    problemType: "identify",
    visualChoices,
    visual: String(answer),
  };
}

// 5A: Count objects 1-10 (similar to 6A but emphasis on counting)
function generateCount5A(): MathProblem {
  const answer = rand(1, 10);
  const icon = pickIcon();
  const visual = Array(answer).fill(icon).join(" ");
  const choices = generateChoices(answer, 1, 10, 4);
  return {
    id: generateId(),
    question: `Count the ${icon}`,
    answer,
    displayParts: { left: visual, operator: "", right: "" },
    problemType: "count",
    choices,
    visual,
  };
}

// 4A: Count objects up to 30
function generateCount4A(): MathProblem {
  const answer = rand(5, 30);
  const icon = pickIcon();
  const visual = Array(answer).fill(icon).join(" ");
  const choices = generateChoices(answer, 1, 30, 4);
  return {
    id: generateId(),
    question: `Count the ${icon}`,
    answer,
    displayParts: { left: visual, operator: "", right: "" },
    problemType: "count",
    choices,
    visual,
  };
}

// 3A: Number sequence — find the missing number
function generateSequence3A(): MathProblem {
  const start = rand(1, 15);
  const step = rand(1, 2);
  const length = 5;
  const missingIndex = rand(1, length - 2);
  const sequence: (number | string)[] = [];
  let answer = 0;
  for (let i = 0; i < length; i++) {
    const val = start + i * step;
    if (i === missingIndex) {
      sequence.push("?");
      answer = val;
    } else {
      sequence.push(val);
    }
  }
  const choices = generateChoices(answer, Math.max(1, answer - 5), answer + 5, 4);
  return {
    id: generateId(),
    question: "What number is missing?",
    answer,
    displayParts: { left: sequence.join(", "), operator: "", right: "" },
    problemType: "sequence",
    choices,
  };
}

// 2A: Add +1 to +3
function generateAdd2A(): MathProblem {
  const a = rand(1, 7);
  const b = rand(1, 3);
  return {
    id: generateId(),
    question: `${a} + ${b} = ?`,
    answer: a + b,
    displayParts: { left: String(a), operator: "+", right: String(b) },
    problemType: "equation",
  };
}

// A: Add to 10
function generateAddA(): MathProblem {
  const a = rand(1, 9);
  const b = rand(1, 10 - a);
  return {
    id: generateId(),
    question: `${a} + ${b} = ?`,
    answer: a + b,
    displayParts: { left: String(a), operator: "+", right: String(b) },
    problemType: "equation",
  };
}

// B: Add to 20
function generateAddB(): MathProblem {
  const a = rand(5, 15);
  const b = rand(1, 20 - a);
  return {
    id: generateId(),
    question: `${a} + ${b} = ?`,
    answer: a + b,
    displayParts: { left: String(a), operator: "+", right: String(b) },
    problemType: "equation",
  };
}

// C: Subtract within 10
function generateSubC(): MathProblem {
  const a = rand(2, 10);
  const b = rand(1, a - 1);
  return {
    id: generateId(),
    question: `${a} - ${b} = ?`,
    answer: a - b,
    displayParts: { left: String(a), operator: "-", right: String(b) },
    problemType: "equation",
  };
}

// D: Subtract within 20
function generateSubD(): MathProblem {
  const a = rand(5, 20);
  const b = rand(1, a - 1);
  return {
    id: generateId(),
    question: `${a} - ${b} = ?`,
    answer: a - b,
    displayParts: { left: String(a), operator: "-", right: String(b) },
    problemType: "equation",
  };
}

// E: Multiply (2, 5, 10 tables)
function generateMultE(): MathProblem {
  const tables = [2, 5, 10];
  const a = tables[rand(0, tables.length - 1)];
  const b = rand(1, 10);
  return {
    id: generateId(),
    question: `${a} × ${b} = ?`,
    answer: a * b,
    displayParts: { left: String(a), operator: "×", right: String(b) },
    problemType: "equation",
  };
}

// F: Divide (2, 5, 10)
function generateDivF(): MathProblem {
  const divisors = [2, 5, 10];
  const b = divisors[rand(0, divisors.length - 1)];
  const answer = rand(1, 10);
  const a = b * answer;
  return {
    id: generateId(),
    question: `${a} ÷ ${b} = ?`,
    answer,
    displayParts: { left: String(a), operator: "÷", right: String(b) },
    problemType: "equation",
  };
}

export function generateProblems(stageId: string, count: number): MathProblem[] {
  const problems: MathProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    let problem: MathProblem;
    let attempts = 0;
    do {
      switch (stageId) {
        case "6A":
          problem = generateIdentify6A();
          break;
        case "5A":
          problem = generateCount5A();
          break;
        case "4A":
          problem = generateCount4A();
          break;
        case "3A":
          problem = generateSequence3A();
          break;
        case "2A":
          problem = generateAdd2A();
          break;
        case "A":
          problem = generateAddA();
          break;
        case "B":
          problem = generateAddB();
          break;
        case "C":
          problem = generateSubC();
          break;
        case "D":
          problem = generateSubD();
          break;
        case "E":
          problem = generateMultE();
          break;
        case "F":
          problem = generateDivF();
          break;
        default:
          problem = generateAdd2A();
      }
      attempts++;
    } while (seen.has(problem.question) && attempts < 20);

    seen.add(problem.question);
    problems.push(problem);
  }
  return shuffle(problems);
}
