export interface World {
  id: string;
  name: string;
  theme: string;
  gradient: string;
  stageIds: string[];
  icon: string;
  description: string;
  ages: string;
  /** Solid accent colour for path nodes and chips (gradient is used for banners). */
  color: string;
}

export const WORLDS: World[] = [
  {
    id: "meadow",
    name: "Pebble Meadow",
    theme: "green",
    gradient: "from-green-300 to-emerald-400",
    stageIds: ["6A", "5A"],
    icon: "🌿",
    description: "Where it all begins — recognise and count",
    ages: "3–5",
    color: "#00b894",
  },
  {
    id: "forest",
    name: "Number Forest",
    theme: "teal",
    gradient: "from-teal-300 to-green-400",
    stageIds: ["4A", "3A", "CMP"],
    icon: "🌲",
    description: "Explore bigger numbers and sequences",
    ages: "4–6",
    color: "#00a8a8",
  },
  {
    id: "river",
    name: "Addition River",
    theme: "blue",
    gradient: "from-blue-300 to-cyan-400",
    stageIds: ["2A", "A", "BND", "B", "A2", "A3"],
    icon: "🌊",
    description: "Cross the river by mastering addition",
    ages: "5–8",
    color: "#0984e3",
  },
  {
    id: "cave",
    name: "Subtraction Cave",
    theme: "purple",
    gradient: "from-purple-300 to-indigo-400",
    stageIds: ["C", "D", "S2", "S3", "MIX"],
    icon: "🦇",
    description: "Venture into the cave and take away",
    ages: "6–9",
    color: "#6c5ce7",
  },
  {
    id: "castle",
    name: "Multiply Castle",
    theme: "orange",
    gradient: "from-orange-300 to-amber-400",
    stageIds: ["E", "M2", "M3", "M4"],
    icon: "🏰",
    description: "Storm the castle with multiplication",
    ages: "7–10",
    color: "#e17055",
  },
  {
    id: "stars",
    name: "Division Galaxy",
    theme: "pink",
    gradient: "from-pink-300 to-rose-400",
    stageIds: ["F", "V2", "V3"],
    icon: "✨",
    description: "Reach the stars with division",
    ages: "8–11",
    color: "#e84393",
  },
  {
    id: "falls",
    name: "Fraction Falls",
    theme: "cyan",
    gradient: "from-cyan-300 to-sky-500",
    stageIds: ["FR1", "FR2", "DEC", "PCT"],
    icon: "🍕",
    description: "Split things into parts — fractions, decimals, percent",
    ages: "9–12",
    color: "#0097b2",
  },
  {
    id: "summit",
    name: "Algebra Summit",
    theme: "slate",
    gradient: "from-slate-500 to-indigo-600",
    stageIds: ["NEG", "OOP", "SQR", "X1", "X2"],
    icon: "🏔️",
    description: "The final climb — integers, BEDMAS and solving for x",
    ages: "11–15",
    color: "#3d3d8f",
  },
];

export function getWorldForStage(stageId: string): World | undefined {
  return WORLDS.find((w) => w.stageIds.includes(stageId));
}

export function getWorldProgress(stageIds: string[], currentStageId: string, completedStageIds: string[]): number {
  const total = stageIds.length;
  const completed = stageIds.filter((id) => completedStageIds.includes(id)).length;
  const isCurrent = stageIds.includes(currentStageId);
  if (completed === total) return 100;
  if (isCurrent) return Math.max(((completed + 0.5) / total) * 100, 10);
  return (completed / total) * 100;
}
