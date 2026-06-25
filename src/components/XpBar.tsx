"use client";

interface XpBarProps {
  xp: number;
}

export default function XpBar({ xp }: XpBarProps) {
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const percent = (xpInLevel / 500) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm font-semibold mb-1">
        <span className="text-primary">Level {level}</span>
        <span className="text-gray-500">{xpInLevel}/500 XP</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
