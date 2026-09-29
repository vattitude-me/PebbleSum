/**
 * Procedural problem generation.
 *
 * Every stage has a generator that takes a difficulty in [0, 1]. A session ramps
 * difficulty from a warm-up to a stretch (see `generateProblems`), so learners
 * start with a win and finish on something that makes them think. Generators
 * avoid trivial facts (×1, +0) once past the warm-up, use distractors built from
 * common mistakes, and attach a short hint that teaches the method when a
 * learner gets a question wrong.
 */

export type ProblemType = "equation" | "identify" | "count" | "sequence" | "compare";

export interface MathProblem {
  id: string;
  /** Stable text identity, used for de-duplication and review lists. */
  question: string;
  answer: number;
  /**
   * Rendered expression. For equations, "□" marks where the typed answer goes
   * (e.g. "7 + □ = 10"). Without "□" the answer is typed after `answerPrefix`.
   */
  expression: string;
  answerPrefix?: string;
  problemType: ProblemType;
  choices?: number[];
  visualChoices?: { value: number; display: string }[];
  /** Emoji layout for counting/identify problems, or the numeral to find. */
  visual?: string;
  /** Teaches the method; shown after a wrong answer. */
  hint: string;
  /** Difficulty this problem was generated at, for analytics and tests. */
  difficulty: number;
}

// ---------------------------------------------------------------------------
// Random helpers — seedable so tests are deterministic.
// ---------------------------------------------------------------------------

export type Rng = () => number;

/** mulberry32: tiny, fast, good-enough PRNG for procedural content. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function int(rng: Rng, min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return Math.floor(rng() * (hi - lo + 1)) + lo;
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function chance(rng: Rng, p: number): boolean {
  return rng() < p;
}

function shuffle<T>(rng: Rng, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Linear interpolation, rounded — maps difficulty to a numeric range bound. */
function lerp(from: number, to: number, d: number): number {
  return Math.round(from + (to - from) * d);
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** Formats a signed number with a true minus sign, bracketing negatives mid-expression. */
function signed(n: number, bracket = false): string {
  if (n >= 0) return String(n);
  return bracket ? `(−${-n})` : `−${-n}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Multiple-choice options: the answer plus plausible wrong answers — off-by-one,
 * off-by-ten and nearby values — so guessing by "which one looks different" fails.
 */
export function buildChoices(rng: Rng, answer: number, min: number, max: number, count = 4): number[] {
  const candidates = [answer - 1, answer + 1, answer - 2, answer + 2, answer - 10, answer + 10, answer + 3, answer - 3];
  const choices = new Set<number>([answer]);
  for (const c of shuffle(rng, candidates)) {
    if (choices.size >= count) break;
    if (c >= min && c <= max) choices.add(c);
  }
  let guard = 0;
  while (choices.size < count && guard++ < 100) {
    choices.add(int(rng, min, max));
  }
  return shuffle(rng, [...choices]);
}

let idCounter = 0;
function nextId(rng: Rng): string {
  idCounter = (idCounter + 1) % 1_000_000;
  return `${Math.floor(rng() * 1e9).toString(36)}-${idCounter}`;
}

type Draft = Omit<MathProblem, "id" | "difficulty" | "question" | "problemType"> & {
  question?: string;
  problemType?: ProblemType;
};

function equation(draft: Draft): Draft {
  return { problemType: "equation", ...draft };
}

type Generator = (rng: Rng, d: number) => Draft;

// ---------------------------------------------------------------------------
// Foundation generators (multiple choice)
// ---------------------------------------------------------------------------

const ICONS = ["🍎", "⭐", "🌸", "🐟", "🦋", "🎈", "🌙", "🍀", "🐚", "🐞", "🍓", "🚗"];

function arrangeInRows(icon: string, count: number, perRow: number): string {
  const rows: string[] = [];
  for (let i = 0; i < count; i += perRow) {
    rows.push(Array(Math.min(perRow, count - i)).fill(icon).join(" "));
  }
  return rows.join("\n");
}

const identify: Generator = (rng, d) => {
  const max = lerp(3, 9, d);
  const answer = int(rng, 1, max);
  const icon = pick(rng, ICONS);
  const values = buildChoices(rng, answer, 1, Math.max(max, 4), 3);
  return {
    problemType: "identify",
    question: pick(rng, [`Find ${answer}!`, `Which one is ${answer}?`, `Tap ${answer}!`, `Show me ${answer}!`]),
    answer,
    expression: String(answer),
    visual: String(answer),
    visualChoices: values.map((v) => ({ value: v, display: Array(v).fill(icon).join(" ") })),
    hint: `Touch each one as you count: 1, 2, 3… stop at ${answer}.`,
  };
};

function counting(minCount: number, maxLo: number, maxHi: number): Generator {
  return (rng, d) => {
    const answer = int(rng, minCount, lerp(maxLo, maxHi, d));
    const icon = pick(rng, ICONS);
    // Rows of 5 (then 10 for big groups) make subitising and counting-by-fives possible.
    const perRow = answer > 20 ? 10 : 5;
    return {
      problemType: "count",
      question: `How many ${icon}?`,
      answer,
      expression: "",
      visual: arrangeInRows(icon, answer, perRow),
      choices: buildChoices(rng, answer, 1, maxHi + 3),
      hint: answer > 10
        ? `Each full row has ${perRow}. Count the rows by ${perRow}s, then count the rest.`
        : "Touch each one as you count, and don't count any twice.",
    };
  };
}

const sequence: Generator = (rng, d) => {
  const steps = d < 0.35 ? [1] : d < 0.7 ? [1, 2, 10] : [2, 5, 10, -1, -2];
  const step = pick(rng, steps);
  const length = 5;
  const span = Math.abs(step) * (length - 1);
  const maxStart = lerp(10, 60, d);
  const start = step > 0 ? int(rng, step >= 5 ? 0 : 1, maxStart) : int(rng, span + 1, maxStart + span);
  const normalisedStart = step === 5 || step === 10 ? start - (start % step) + step : start;
  const missingIndex = int(rng, 1, length - 1);
  const terms = Array.from({ length }, (_, i) => normalisedStart + i * step);
  const answer = terms[missingIndex];
  const shown = terms.map((t, i) => (i === missingIndex ? "?" : String(t)));
  const pattern = step > 0 ? `goes up by ${step}` : `goes down by ${-step}`;
  return {
    problemType: "sequence",
    question: "What number is missing?",
    answer,
    expression: shown.join(", "),
    choices: buildChoices(rng, answer, 0, answer + 20),
    hint: `Look at two numbers next to each other. The pattern ${pattern}.`,
  };
};

const compare: Generator = (rng, d) => {
  const max = lerp(10, 100, d);
  const count = d > 0.6 ? 3 : 2;
  const values = new Set<number>();
  const base = int(rng, 1, max);
  values.add(base);
  let guard = 0;
  while (values.size < count && guard++ < 50) {
    // Harder: numbers close together, or with the same digits (27 vs 72).
    const closeness = lerp(max / 2, 3, d);
    let v = base + int(rng, -closeness, closeness);
    if (d > 0.7 && base >= 10 && base < 100 && chance(rng, 0.4)) v = Number(String(base).split("").reverse().join(""));
    if (v >= 0 && v <= 100) values.add(v);
  }
  while (values.size < count) values.add(int(rng, 0, 100));
  const list = shuffle(rng, [...values]);
  const wantBig = chance(rng, 0.5);
  const answer = wantBig ? Math.max(...list) : Math.min(...list);
  const word = count === 3 ? (wantBig ? "biggest" : "smallest") : wantBig ? "bigger" : "smaller";
  return {
    problemType: "compare",
    question: `Which number is ${word}?`,
    answer,
    expression: "",
    choices: list,
    hint: "Compare the tens first. If the tens are the same, compare the ones.",
  };
};

// ---------------------------------------------------------------------------
// Addition
// ---------------------------------------------------------------------------

const addSmall: Generator = (rng, d) => {
  const b = int(rng, 1, 3);
  const a = int(rng, 1, lerp(4, 9, d));
  const flip = d > 0.5 && chance(rng, 0.4);
  const [x, y] = flip ? [b, a] : [a, b];
  const big = Math.max(x, y);
  const small = Math.min(x, y);
  const countOn = Array.from({ length: small }, (_, i) => big + i + 1).join(", ");
  return equation({ answer: a + b, expression: `${x} + ${y} = □`, hint: `Start at the bigger number, ${big}, and count on ${small}: ${countOn}.` });
};

const addTo10: Generator = (rng, d) => {
  const maxSum = lerp(6, 10, d);
  const a = int(rng, 1, maxSum - 1);
  const b = int(rng, d > 0.3 ? Math.min(2, maxSum - a) : 1, maxSum - a);
  return equation({ answer: a + b, expression: `${a} + ${b} = □`, hint: `Start at ${Math.max(a, b)} and count on ${Math.min(a, b)}.` });
};

const makeTen: Generator = (rng, d) => {
  const target = d > 0.65 && chance(rng, 0.5) ? 20 : 10;
  const a = target === 10 ? int(rng, 1, 9) : int(rng, 11, 19);
  const missing = target - a;
  const missingFirst = d > 0.4 && chance(rng, 0.4);
  return equation({
    answer: missing,
    expression: missingFirst ? `□ + ${a} = ${target}` : `${a} + □ = ${target}`,
    hint: target === 10
      ? `Pairs that make 10: 1+9, 2+8, 3+7, 4+6, 5+5. What goes with ${a}?`
      : `${a} is 10 and ${a - 10}. What goes with ${a - 10} to make 10?`,
  });
};

const addTo20: Generator = (rng, d) => {
  if (d < 0.4) {
    // Teen + single digit without crossing twenty: 13 + 4
    const ones = int(rng, 1, 7);
    const b = int(rng, 1, 9 - ones);
    return equation({ answer: 10 + ones + b, expression: `${10 + ones} + ${b} = □`, hint: `Just add the ones: ${ones} + ${b} = ${ones + b}. Then add the ten.` });
  }
  // Bridge through ten: 8 + 5 → 8 + 2 + 3
  const a = int(rng, lerp(5, 7, d), 9);
  const b = int(rng, 11 - a, 9);
  const toTen = 10 - a;
  return equation({ answer: a + b, expression: `${a} + ${b} = □`, hint: `Make a ten first: ${a} + ${toTen} = 10. Then add the other ${b - toTen}.` });
};

const addTwoDigitNoCarry: Generator = (rng, d) => {
  if (d < 0.3) {
    const a = int(rng, 1, 8) * 10;
    const b = int(rng, 1, 9 - a / 10) * 10;
    return equation({ answer: a + b, expression: `${a} + ${b} = □`, hint: `Think in tens: ${a / 10} tens + ${b / 10} tens = ${(a + b) / 10} tens.` });
  }
  const aTens = int(rng, 1, 8);
  const bTens = d < 0.55 ? 0 : int(rng, 1, 9 - aTens);
  const aOnes = int(rng, 0, 8);
  const bOnes = int(rng, 1, 9 - aOnes);
  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes;
  return equation({ answer: a + b, expression: `${a} + ${b} = □`, hint: `Add the ones (${aOnes} + ${bOnes}), then add the tens (${aTens} + ${bTens}).` });
};

const addWithCarry: Generator = (rng, d) => {
  const aOnes = int(rng, 2, 9);
  const bOnes = int(rng, 10 - aOnes, 9);
  const aTens = int(rng, 1, lerp(5, 8, d));
  const bTens = d < 0.35 ? 0 : int(rng, 1, lerp(3, 9 - aTens, d));
  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes;
  const onesSum = aOnes + bOnes;
  return equation({
    answer: a + b,
    expression: `${a} + ${b} = □`,
    hint: `Ones: ${aOnes} + ${bOnes} = ${onesSum}. Keep ${onesSum - 10} and carry 1 ten. Tens: ${aTens} + ${bTens} + 1 = ${aTens + bTens + 1}.`,
  });
};

// ---------------------------------------------------------------------------
// Subtraction
// ---------------------------------------------------------------------------

const subTo10: Generator = (rng, d) => {
  const a = int(rng, 2, lerp(5, 10, d));
  // Past the warm-up, avoid "take away everything" (a − a).
  const b = int(rng, 1, d > 0.3 ? a - 1 : a);
  return equation({ answer: a - b, expression: `${a} − ${b} = □`, hint: `Start at ${a} and count back ${b}. Or think: ${b} + ? = ${a}.` });
};

const subTo20: Generator = (rng, d) => {
  if (d < 0.4) {
    const ones = int(rng, 2, 9);
    const b = int(rng, 1, ones);
    return equation({ answer: 10 + ones - b, expression: `${10 + ones} − ${b} = □`, hint: `Take ${b} from the ones: ${ones} − ${b} = ${ones - b}. Keep the ten.` });
  }
  // Across ten: 14 − 6
  const ones = int(rng, 1, 8);
  const b = int(rng, ones + 1, 9);
  const a = 10 + ones;
  return equation({ answer: a - b, expression: `${a} − ${b} = □`, hint: `Take ${ones} to get to 10, then ${b - ones} more. Or think: ${b} + ? = ${a}.` });
};

const subTwoDigitNoBorrow: Generator = (rng, d) => {
  const aTens = int(rng, 2, 9);
  const aOnes = int(rng, 1, 9);
  const bTens = d < 0.4 ? 0 : int(rng, 1, aTens - 1);
  const bOnes = int(rng, 0, aOnes);
  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes || 1;
  return equation({ answer: a - b, expression: `${a} − ${b} = □`, hint: `Ones first: ${aOnes} − ${bOnes}. Then tens: ${aTens} − ${bTens}.` });
};

const subWithBorrow: Generator = (rng, d) => {
  const aTens = int(rng, 2, 9);
  const aOnes = int(rng, 0, 8);
  const bOnes = int(rng, aOnes + 1, 9);
  const bTens = d < 0.35 ? 0 : int(rng, 1, Math.max(1, aTens - 1));
  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes;
  return equation({
    answer: a - b,
    expression: `${a} − ${b} = □`,
    hint: `${aOnes} is less than ${bOnes}, so swap a ten for ten ones: ${aOnes + 10} − ${bOnes} = ${aOnes + 10 - bOnes}. Tens: ${aTens - 1} − ${bTens}.`,
  });
};

const missingNumber: Generator = (rng, d) => {
  const max = lerp(20, 100, d);
  const a = int(rng, 5, max);
  const b = int(rng, 2, Math.max(3, a - 2));
  const form = int(rng, 0, d > 0.5 ? 3 : 1);
  switch (form) {
    case 0: // ? + b = a+b
      return equation({ answer: a, expression: `□ + ${b} = ${a + b}`, hint: `Undo the adding: ${a + b} − ${b}.` });
    case 1: // a + ? = a+b
      return equation({ answer: b, expression: `${a} + □ = ${a + b}`, hint: `How far from ${a} to ${a + b}? Count up, or do ${a + b} − ${a}.` });
    case 2: // a − ? = a−b
      return equation({ answer: b, expression: `${a} − □ = ${a - b}`, hint: `How much was taken away? ${a} − ${a - b}.` });
    default: // ? − b = a−b
      return equation({ answer: a, expression: `□ − ${b} = ${a - b}`, hint: `Undo the taking away: ${a - b} + ${b}.` });
  }
};

// ---------------------------------------------------------------------------
// Multiplication & division
// ---------------------------------------------------------------------------

function timesHint(a: number, b: number): string {
  if (b <= 4) return `${a} × ${b} means ${b} groups of ${a}: ${Array(b).fill(a).join(" + ")}.`;
  if (a === 5 || b === 5) return `Fives end in 0 or 5. Count by 5s, or halve ${a === 5 ? b : a} × 10.`;
  if (a === 9 || b === 9) return `For × 9, do × 10 and take one group away: ${(a === 9 ? b : a) * 10} − ${a === 9 ? b : a}.`;
  return `Use a fact you know: ${a} × ${b - 1} = ${a * (b - 1)}, then add one more ${a}.`;
}

/** `tricky` facts are weighted up at higher difficulty — that's where kids stall. */
function timesTable(tables: number[], tricky: number[] = []): Generator {
  return (rng, d) => {
    const pool = d > 0.6 && tricky.length ? [...tables, ...tricky, ...tricky] : tables;
    const a = pick(rng, pool);
    const b = int(rng, d < 0.25 ? 1 : 2, lerp(6, 12, d));
    const [x, y] = chance(rng, 0.35) ? [b, a] : [a, b];
    return equation({ answer: a * b, expression: `${x} × ${y} = □`, hint: timesHint(a, b) });
  };
}

const bigMultiply: Generator = (rng, d) => {
  const b = int(rng, 2, lerp(4, 9, d));
  let a: number;
  if (d < 0.35) {
    // No carrying: each digit × b stays under 10
    const maxDigit = Math.floor(9 / b);
    a = int(rng, 1, Math.max(1, maxDigit)) * 10 + int(rng, 0, maxDigit);
  } else {
    a = int(rng, 12, lerp(40, 99, d));
  }
  const tens = Math.floor(a / 10) * 10;
  const ones = a % 10;
  return equation({ answer: a * b, expression: `${a} × ${b} = □`, hint: `Split it: ${tens} × ${b} = ${tens * b} and ${ones} × ${b} = ${ones * b}. Add them.` });
};

function divisionFacts(divisors: number[]): Generator {
  return (rng, d) => {
    const b = pick(rng, divisors);
    const answer = int(rng, d < 0.25 ? 1 : 2, lerp(6, 12, d));
    const a = b * answer;
    return equation({ answer, expression: `${a} ÷ ${b} = □`, hint: `Think multiplication: ${b} × ? = ${a}.` });
  };
}

const bigDivide: Generator = (rng, d) => {
  const b = int(rng, 2, lerp(5, 9, d));
  const answer = d < 0.5 ? int(rng, 11, Math.floor(99 / b)) : int(rng, Math.ceil(100 / b), lerp(30, 150, d));
  const a = b * answer;
  const tensPart = Math.floor(answer / 10) * 10;
  return equation({
    answer,
    expression: `${a} ÷ ${b} = □`,
    hint: `Chunk it: ${b} × ${tensPart} = ${b * tensPart}. That leaves ${a - b * tensPart}, and ${a - b * tensPart} ÷ ${b} = ${answer - tensPart}.`,
  });
};

// ---------------------------------------------------------------------------
// Fractions, decimals, percentages
// ---------------------------------------------------------------------------

const fractionOf: Generator = (rng, d) => {
  const options: [number, number][] = d < 0.35
    ? [[1, 2], [1, 4], [1, 10]]
    : d < 0.7
      ? [[1, 3], [1, 5], [3, 4], [2, 3], [1, 8]]
      : [[3, 4], [2, 3], [3, 5], [5, 8], [7, 10], [4, 5]];
  const [num, den] = pick(rng, options);
  const unit = int(rng, 2, lerp(6, 12, d));
  const whole = unit * den;
  return equation({
    answer: unit * num,
    expression: `${num}/${den} of ${whole} = □`,
    hint: num === 1
      ? `Split ${whole} into ${den} equal parts: ${whole} ÷ ${den}.`
      : `First find 1/${den}: ${whole} ÷ ${den} = ${unit}. Then take ${num} of those: ${unit} × ${num}.`,
  });
};

const addFractions: Generator = (rng, d) => {
  const den = pick(rng, d < 0.4 ? [4, 5, 6, 8] : [7, 8, 9, 10, 12]);
  const subtract = d > 0.35 && chance(rng, 0.5);
  if (d > 0.75 && chance(rng, 0.35)) {
    const b = int(rng, 1, den - 1);
    return equation({ answer: den - b, expression: `1 − ${b}/${den} = □/${den}`, hint: `1 whole is ${den}/${den}. So ${den}/${den} − ${b}/${den}.` });
  }
  const a = int(rng, 2, den - 1);
  const b = subtract ? int(rng, 1, a - 1) : int(rng, 1, den - a);
  const answer = subtract ? a - b : a + b;
  return equation({
    answer,
    expression: `${a}/${den} ${subtract ? "−" : "+"} ${b}/${den} = □/${den}`,
    hint: `The bottoms match, so ${subtract ? "subtract" : "add"} the tops: ${a} ${subtract ? "−" : "+"} ${b}. The bottom stays ${den}.`,
  });
};

const decimals: Generator = (rng, d) => {
  const maxWhole = lerp(3, 20, d);
  const a = int(rng, 1, maxWhole * 10) / 10;
  const b = int(rng, 1, lerp(9, maxWhole * 10, d)) / 10;
  const subtract = d > 0.3 && chance(rng, 0.5);
  const [x, y] = subtract && b > a ? [b, a] : [a, b];
  const answer = round1(subtract ? x - y : x + y);
  return equation({
    answer,
    expression: `${x.toFixed(1)} ${subtract ? "−" : "+"} ${y.toFixed(1)} = □`,
    hint: `Think in tenths: ${Math.round(x * 10)} ${subtract ? "−" : "+"} ${Math.round(y * 10)} = ${Math.round(answer * 10)} tenths, which is ${answer.toFixed(1)}.`,
  });
};

const percentages: Generator = (rng, d) => {
  const pool: { p: number; hint: (n: number) => string }[] = [
    { p: 50, hint: (n) => `50% is half: ${n} ÷ 2.` },
    { p: 10, hint: (n) => `10% means divide by 10: ${n} ÷ 10.` },
    { p: 25, hint: (n) => `25% is a quarter: halve ${n}, then halve again.` },
  ];
  if (d > 0.35) {
    pool.push({ p: 20, hint: (n) => `20% is 10% doubled: (${n} ÷ 10) × 2.` });
    pool.push({ p: 5, hint: (n) => `5% is half of 10%: ${n} ÷ 10 ÷ 2.` });
  }
  if (d > 0.65) {
    pool.push({ p: 75, hint: (n) => `75% is three quarters: find 25% (${n} ÷ 4), then × 3.` });
    pool.push({ p: 15, hint: (n) => `15% = 10% + 5%: ${n / 10} + ${n / 20}.` });
    pool.push({ p: 30, hint: (n) => `30% is 10% × 3: (${n} ÷ 10) × 3.` });
  }
  const { p, hint } = pick(rng, pool);
  // Pick a whole that gives an integer answer.
  const step = 100 / gcd(p, 100);
  const n = step * int(rng, 1, Math.max(2, Math.floor(lerp(100, 400, d) / step)));
  return equation({ answer: (n * p) / 100, expression: `${p}% of ${n} = □`, hint: hint(n) });
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// ---------------------------------------------------------------------------
// Algebra Summit
// ---------------------------------------------------------------------------

const negatives: Generator = (rng, d) => {
  const range = lerp(10, 20, d);
  const form = int(rng, 0, d < 0.35 ? 0 : d < 0.7 ? 2 : 4);
  switch (form) {
    case 0: { // small − big
      const a = int(rng, 1, range - 1);
      const b = int(rng, a + 1, range);
      return equation({ answer: a - b, expression: `${a} − ${b} = □`, hint: `Start at ${a} on a number line and move ${b} left. You pass zero.` });
    }
    case 1: { // −a + b
      const a = int(rng, 1, range);
      const b = int(rng, 1, range);
      return equation({ answer: b - a, expression: `−${a} + ${b} = □`, hint: `Start at −${a} and move ${b} right.` });
    }
    case 2: { // −a − b
      const a = int(rng, 1, range);
      const b = int(rng, 1, range);
      return equation({ answer: -a - b, expression: `−${a} − ${b} = □`, hint: `Start at −${a} and move ${b} further left: it gets more negative.` });
    }
    case 3: { // a − (−b)
      const a = int(rng, -range, range);
      const b = int(rng, 1, range);
      return equation({ answer: a + b, expression: `${signed(a)} − (−${b}) = □`, hint: `Subtracting a negative is the same as adding: ${signed(a)} + ${b}.` });
    }
    default: { // a × b with signs
      const a = int(rng, 2, 9) * (chance(rng, 0.5) ? -1 : 1);
      const b = int(rng, 2, 9) * (chance(rng, 0.5) ? -1 : 1);
      return equation({
        answer: a * b,
        expression: `${signed(a)} × ${signed(b, true)} = □`,
        hint: `Multiply ${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}. Same signs → positive, different signs → negative.`,
      });
    }
  }
};

const BEDMAS_HINT = "BEDMAS: Brackets, Exponents, Division & Multiplication (left to right), then Addition & Subtraction.";

const orderOfOperations: Generator = (rng, d) => {
  const form = int(rng, 0, d < 0.35 ? 1 : d < 0.7 ? 3 : 5);
  const a = int(rng, 2, 9);
  const b = int(rng, 2, 9);
  const c = int(rng, 2, 9);
  switch (form) {
    case 0:
      return equation({ answer: a + b * c, expression: `${a} + ${b} × ${c} = □`, hint: `${BEDMAS_HINT} So ${b} × ${c} first.` });
    case 1: {
      const big = b * c + a;
      return equation({ answer: big - b * c, expression: `${big} − ${b} × ${c} = □`, hint: `${BEDMAS_HINT} So ${b} × ${c} first.` });
    }
    case 2:
      return equation({ answer: (a + b) * c, expression: `(${a} + ${b}) × ${c} = □`, hint: `Brackets first: ${a} + ${b} = ${a + b}. Then × ${c}.` });
    case 3: {
      const dividend = b * c;
      return equation({ answer: a + dividend / b, expression: `${a} + ${dividend} ÷ ${b} = □`, hint: `${BEDMAS_HINT} So ${dividend} ÷ ${b} first.` });
    }
    case 4: {
      const hi = Math.max(a, b) + 1;
      const lo = Math.min(a, b);
      return equation({ answer: c * (hi - lo) + a, expression: `${c} × (${hi} − ${lo}) + ${a} = □`, hint: `Brackets: ${hi} − ${lo} = ${hi - lo}. Multiply by ${c}, then add ${a}.` });
    }
    default: {
      const sq = int(rng, 2, 6);
      return equation({ answer: sq * sq + b * c, expression: `${sq}² + ${b} × ${c} = □`, hint: `Exponent first: ${sq}² = ${sq * sq}. Then ${b} × ${c}. Then add.` });
    }
  }
};

const powersAndRoots: Generator = (rng, d) => {
  const form = int(rng, 0, d < 0.35 ? 0 : d < 0.7 ? 1 : 2);
  if (form === 0) {
    const n = int(rng, 2, lerp(10, 15, d));
    return equation({ answer: n * n, expression: `${n}² = □`, hint: `${n}² means ${n} × ${n}.` });
  }
  if (form === 1) {
    const n = int(rng, 2, lerp(10, 15, d));
    return equation({ answer: n, expression: `√${n * n} = □`, hint: `Which number times itself makes ${n * n}?` });
  }
  const n = int(rng, 2, 5);
  if (chance(rng, 0.5)) {
    return equation({ answer: n ** 3, expression: `${n}³ = □`, hint: `${n}³ means ${n} × ${n} × ${n}.` });
  }
  const m = int(rng, n + 1, 12);
  return equation({ answer: m * m - n * n, expression: `${m}² − ${n}² = □`, hint: `Work out each square first: ${m * m} − ${n * n}.` });
};

const oneStepEquation: Generator = (rng, d) => {
  const x = d > 0.7 && chance(rng, 0.3) ? -int(rng, 1, 9) : int(rng, 1, lerp(12, 25, d));
  const k = int(rng, 2, lerp(9, 15, d));
  const form = int(rng, 0, d < 0.3 ? 1 : 3);
  const base = { answerPrefix: "x =", question: "" };
  switch (form) {
    case 0:
      return equation({ ...base, answer: x, expression: `x + ${k} = ${x + k}`, hint: `Undo + ${k}: subtract ${k} from both sides. x = ${x + k} − ${k}.` });
    case 1:
      return equation({ ...base, answer: x, expression: `x − ${k} = ${signed(x - k)}`, hint: `Undo − ${k}: add ${k} to both sides. x = ${signed(x - k)} + ${k}.` });
    case 2:
      return equation({ ...base, answer: x, expression: `${k}x = ${signed(k * x)}`, hint: `${k}x means ${k} × x. Undo it: divide both sides by ${k}.` });
    default: {
      // x ÷ k = q, so x = q × k
      const q = x;
      return equation({ ...base, answer: q * k, expression: `x ÷ ${k} = ${signed(q)}`, hint: `Undo ÷ ${k}: multiply both sides by ${k}. x = ${signed(q)} × ${k}.` });
    }
  }
};

const twoStepEquation: Generator = (rng, d) => {
  const x = d > 0.6 && chance(rng, 0.3) ? -int(rng, 1, 8) : int(rng, 1, lerp(9, 15, d));
  const k = int(rng, 2, lerp(6, 12, d));
  const c = int(rng, 1, lerp(10, 30, d));
  const minus = chance(rng, 0.5);
  const rhs = minus ? k * x - c : k * x + c;
  const base = { answerPrefix: "x =", question: "" };
  if (d > 0.5 && chance(rng, 0.3)) {
    // x/k ± c form
    const q = x;
    const whole = q * k;
    const r = minus ? q - c : q + c;
    return equation({
      ...base,
      answer: whole,
      expression: `x/${k} ${minus ? "−" : "+"} ${c} = ${signed(r)}`,
      hint: `Undo the ${minus ? "− " + c : "+ " + c} first: x/${k} = ${signed(q)}. Then multiply by ${k}.`,
    });
  }
  return equation({
    ...base,
    answer: x,
    expression: `${k}x ${minus ? "−" : "+"} ${c} = ${signed(rhs)}`,
    hint: `Undo the ${minus ? "− " + c : "+ " + c} first: ${k}x = ${signed(minus ? rhs + c : rhs - c)}. Then divide by ${k}.`,
  });
};

// ---------------------------------------------------------------------------
// Registry & session builder
// ---------------------------------------------------------------------------

export const GENERATORS: Record<string, Generator> = {
  "6A": identify,
  "5A": counting(1, 5, 10),
  "4A": counting(5, 15, 30),
  "3A": sequence,
  CMP: compare,
  "2A": addSmall,
  A: addTo10,
  BND: makeTen,
  B: addTo20,
  A2: addTwoDigitNoCarry,
  A3: addWithCarry,
  C: subTo10,
  D: subTo20,
  S2: subTwoDigitNoBorrow,
  S3: subWithBorrow,
  MIX: missingNumber,
  E: timesTable([2, 5, 10]),
  M2: timesTable([3, 4], [4]),
  M3: timesTable([6, 7, 8, 9, 11, 12], [7, 8]),
  M4: bigMultiply,
  F: divisionFacts([2, 5, 10]),
  V2: divisionFacts([3, 4, 6, 7, 8, 9, 11, 12]),
  V3: bigDivide,
  FR1: fractionOf,
  FR2: addFractions,
  DEC: decimals,
  PCT: percentages,
  NEG: negatives,
  OOP: orderOfOperations,
  SQR: powersAndRoots,
  X1: oneStepEquation,
  X2: twoStepEquation,
};

export function generateProblem(stageId: string, difficulty: number, rng: Rng = Math.random): MathProblem {
  const generator = GENERATORS[stageId] ?? addSmall;
  const d = clamp01(difficulty);
  const draft = generator(rng, d);
  const expression = draft.expression;
  return {
    ...draft,
    problemType: draft.problemType ?? "equation",
    question: draft.question || (draft.answerPrefix ? `${expression}, ${draft.answerPrefix} ?` : expression.replace("□", "?")),
    id: nextId(rng),
    difficulty: d,
  };
}

export interface GenerateOptions {
  /** Where the session's difficulty ramp starts and ends. */
  from?: number;
  to?: number;
  seed?: number;
}

/**
 * Builds a session that ramps from `from` to `to` difficulty. Problems stay in
 * ramp order (easy → hard) rather than being shuffled, so kids warm up first.
 */
export function generateProblems(stageId: string, count: number, options: GenerateOptions = {}): MathProblem[] {
  const { from = 0.2, to = 0.9, seed } = options;
  const rng = seed === undefined ? Math.random : createRng(seed);
  const problems: MathProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? 1 : i / (count - 1);
    const difficulty = from + (to - from) * t;
    let problem = generateProblem(stageId, difficulty, rng);
    let attempts = 0;
    while (seen.has(problem.question) && attempts++ < 25) {
      problem = generateProblem(stageId, difficulty, rng);
    }
    seen.add(problem.question);
    problems.push(problem);
  }
  return problems;
}

/** Numeric answers compare with a small tolerance so 0.1 + 0.2 style floats pass. */
export function isCorrectAnswer(problem: MathProblem, input: string | number): boolean {
  const value = typeof input === "number" ? input : parseFloat(input.replace("−", "-"));
  if (!Number.isFinite(value)) return false;
  return Math.abs(value - problem.answer) < 1e-6;
}
