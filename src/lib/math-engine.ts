export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  displayParts: { left: string; operator: string; right: string };
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateCounting(stageId: string): MathProblem {
  let max = 10;
  if (stageId === "5A") max = 30;
  if (stageId === "4A") max = 100;

  const answer = rand(1, max);
  return {
    id: generateId(),
    question: `What number comes after ${answer - 1}?`,
    answer,
    displayParts: { left: String(answer - 1), operator: "+ 1 =", right: "?" },
  };
}

function generateAddition3A(): MathProblem {
  const addend = rand(1, 3);
  const base = rand(1, 10);
  return {
    id: generateId(),
    question: `${base} + ${addend} = ?`,
    answer: base + addend,
    displayParts: { left: String(base), operator: "+", right: String(addend) },
  };
}

function generateAddition2A(): MathProblem {
  const addend = rand(4, 10);
  const base = rand(1, 10);
  return {
    id: generateId(),
    question: `${base} + ${addend} = ?`,
    answer: base + addend,
    displayParts: { left: String(base), operator: "+", right: String(addend) },
  };
}

function generateAdditionA(): MathProblem {
  const a = rand(10, 50);
  const b = rand(10, 50);
  return {
    id: generateId(),
    question: `${a} + ${b} = ?`,
    answer: a + b,
    displayParts: { left: String(a), operator: "+", right: String(b) },
  };
}

function generateSubtractionB(): MathProblem {
  const b = rand(1, 30);
  const a = rand(b + 1, b + 50);
  return {
    id: generateId(),
    question: `${a} - ${b} = ?`,
    answer: a - b,
    displayParts: { left: String(a), operator: "-", right: String(b) },
  };
}

function generateMultiplicationC(): MathProblem {
  const a = rand(2, 12);
  const b = rand(2, 12);
  return {
    id: generateId(),
    question: `${a} × ${b} = ?`,
    answer: a * b,
    displayParts: { left: String(a), operator: "×", right: String(b) },
  };
}

function generateDivisionD(): MathProblem {
  const b = rand(2, 12);
  const answer = rand(2, 12);
  const a = b * answer;
  return {
    id: generateId(),
    question: `${a} ÷ ${b} = ?`,
    answer,
    displayParts: { left: String(a), operator: "÷", right: String(b) },
  };
}

function generateFractionsE(): MathProblem {
  const denom = rand(2, 10);
  const num1 = rand(1, denom - 1);
  const num2 = rand(1, denom - 1);
  const answer = num1 + num2;
  return {
    id: generateId(),
    question: `${num1}/${denom} + ${num2}/${denom} = ?/${denom}`,
    answer,
    displayParts: {
      left: `${num1}/${denom}`,
      operator: "+",
      right: `${num2}/${denom}`,
    },
  };
}

function generateOrderOfOpsF(): MathProblem {
  const a = rand(2, 10);
  const b = rand(2, 5);
  const c = rand(1, 10);
  const answer = a + b * c;
  return {
    id: generateId(),
    question: `${a} + ${b} × ${c} = ?`,
    answer,
    displayParts: {
      left: `${a} + ${b}`,
      operator: "×",
      right: String(c),
    },
  };
}

export function generateProblems(stageId: string, count: number): MathProblem[] {
  const problems: MathProblem[] = [];
  for (let i = 0; i < count; i++) {
    switch (stageId) {
      case "6A":
      case "5A":
      case "4A":
        problems.push(generateCounting(stageId));
        break;
      case "3A":
        problems.push(generateAddition3A());
        break;
      case "2A":
        problems.push(generateAddition2A());
        break;
      case "A":
        problems.push(generateAdditionA());
        break;
      case "B":
        problems.push(generateSubtractionB());
        break;
      case "C":
        problems.push(generateMultiplicationC());
        break;
      case "D":
        problems.push(generateDivisionD());
        break;
      case "E":
        problems.push(generateFractionsE());
        break;
      case "F":
        problems.push(generateOrderOfOpsF());
        break;
      default:
        problems.push(generateAddition3A());
    }
  }
  return problems;
}
