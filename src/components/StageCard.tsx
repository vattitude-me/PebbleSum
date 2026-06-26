"use client";

import { Stage } from "@/lib/stages";

interface StageCardProps {
  stage: Stage;
  isUnlocked: boolean;
  isCurrent: boolean;
  onStart: () => void;
}

export default function StageCard({ stage, isUnlocked, isCurrent, onStart }: StageCardProps) {
  const categoryColors: Record<string, string> = {
    "Number Recognition": "from-green-400 to-emerald-500",
    "Counting": "from-teal-400 to-green-500",
    "Sequencing": "from-cyan-400 to-teal-500",
    "Addition": "from-blue-400 to-cyan-500",
    "Subtraction": "from-purple-400 to-indigo-500",
    "Multiplication": "from-orange-400 to-amber-500",
    "Division": "from-pink-400 to-rose-500",
  };

  const gradient = categoryColors[stage.category] || "from-gray-400 to-gray-500";

  return (
    <div
      className={`card relative overflow-hidden transition-all duration-200 ${
        isCurrent ? "ring-2 ring-primary scale-[1.02]" : ""
      } ${!isUnlocked ? "opacity-50 grayscale" : "hover:scale-[1.02]"}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isUnlocked ? "📘" : "🔒"}</span>
            <div>
              <h3 className="font-bold text-lg">Stage {stage.id}</h3>
              <p className="text-sm text-gray-500">{stage.name}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{stage.description}</p>
        </div>
        {isCurrent && isUnlocked && (
          <button onClick={onStart} className="btn-primary text-sm px-4 py-2">
            Start
          </button>
        )}
      </div>
      {isUnlocked && (
        <div className="mt-3 flex gap-3 text-xs text-gray-400">
          <span>⏱ {Math.floor(stage.sctSeconds / 60)}min target</span>
          <span>📝 {stage.questionsPerDay} questions</span>
        </div>
      )}
    </div>
  );
}
