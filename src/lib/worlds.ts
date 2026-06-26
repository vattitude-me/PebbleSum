export interface World {
  id: string;
  name: string;
  theme: string;
  gradient: string;
  stageIds: string[];
  icon: string;
  description: string;
}

export const WORLDS: World[] = [
  {
    id: "meadow",
    name: "Pebble Meadow",
    theme: "green",
    gradient: "from-green-300 to-emerald-400",
    stageIds: ["6A", "5A", "4A"],
    icon: "🌿",
    description: "Where counting begins — a soft meadow of discovery",
  },
  {
    id: "river",
    name: "Addition River",
    theme: "blue",
    gradient: "from-blue-300 to-cyan-400",
    stageIds: ["3A", "2A"],
    icon: "🌊",
    description: "Cross the river by mastering addition",
  },
  {
    id: "mountain",
    name: "Summit Peak",
    theme: "purple",
    gradient: "from-purple-300 to-indigo-400",
    stageIds: ["A", "B"],
    icon: "⛰️",
    description: "Climb higher with advanced operations",
  },
  {
    id: "castle",
    name: "Multiply Castle",
    theme: "orange",
    gradient: "from-orange-300 to-amber-400",
    stageIds: ["C", "D"],
    icon: "🏰",
    description: "Conquer the castle with multiplication and division",
  },
  {
    id: "stars",
    name: "Fraction Galaxy",
    theme: "pink",
    gradient: "from-pink-300 to-rose-400",
    stageIds: ["E", "F"],
    icon: "✨",
    description: "Reach the stars with fractions and mixed operations",
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
