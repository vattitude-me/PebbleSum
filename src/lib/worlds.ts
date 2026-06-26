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
    stageIds: ["6A", "5A"],
    icon: "🌿",
    description: "Where it all begins — recognise and count",
  },
  {
    id: "forest",
    name: "Number Forest",
    theme: "teal",
    gradient: "from-teal-300 to-green-400",
    stageIds: ["4A", "3A"],
    icon: "🌲",
    description: "Explore bigger numbers and sequences",
  },
  {
    id: "river",
    name: "Addition River",
    theme: "blue",
    gradient: "from-blue-300 to-cyan-400",
    stageIds: ["2A", "A", "B"],
    icon: "🌊",
    description: "Cross the river by mastering addition",
  },
  {
    id: "cave",
    name: "Subtraction Cave",
    theme: "purple",
    gradient: "from-purple-300 to-indigo-400",
    stageIds: ["C", "D"],
    icon: "🦇",
    description: "Venture into the cave and take away",
  },
  {
    id: "castle",
    name: "Multiply Castle",
    theme: "orange",
    gradient: "from-orange-300 to-amber-400",
    stageIds: ["E"],
    icon: "🏰",
    description: "Storm the castle with multiplication",
  },
  {
    id: "stars",
    name: "Division Galaxy",
    theme: "pink",
    gradient: "from-pink-300 to-rose-400",
    stageIds: ["F"],
    icon: "✨",
    description: "Reach the stars with division",
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
