"use client";

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
      <span className="text-lg">🔥</span>
      <span>{streak} day{streak > 1 ? "s" : ""}</span>
    </div>
  );
}
