"use client";

import { useEffect, useState } from "react";
import { STAGES } from "@/lib/stages";
import { UserProgress, loadProgress, saveProgress, isStreakActive, getToday } from "@/lib/progress-store";
import StreakBadge from "@/components/StreakBadge";
import XpBar from "@/components/XpBar";
import StageCard from "@/components/StageCard";
import PracticeView from "@/components/PracticeView";

export default function Home() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [practicing, setPracticing] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    if (p.lastPracticeDate && !isStreakActive(p.lastPracticeDate)) {
      p.streak = 0;
      p.consecutivePerfectDays = 0;
      saveProgress(p);
    }
    setProgress(p);
  }, []);

  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce-soft text-4xl">🪨</div>
      </div>
    );
  }

  if (practicing) {
    const currentStage = STAGES.find((s) => s.id === progress.currentStageId)!;
    return (
      <PracticeView
        stage={currentStage}
        progress={progress}
        onComplete={(updated) => {
          setProgress(updated);
          setPracticing(false);
        }}
        onBack={() => setPracticing(false)}
      />
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.id === progress.currentStageId);
  const todayCompleted = progress.completedSessions.some(
    (s) => s.date === getToday() && s.stageId === progress.currentStageId
  );

  return (
    <main className="flex flex-col min-h-screen p-4 md:p-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            PebbleSum
          </h1>
          <p className="text-sm text-gray-500">Learn math, one pebble at a time</p>
        </div>
        <StreakBadge streak={progress.streak} />
      </header>

      {/* XP Progress */}
      <div className="card mb-6">
        <XpBar xp={progress.xp} />
      </div>

      {/* Daily Challenge CTA */}
      <div className="card mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">
              {todayCompleted ? "Today's Practice Complete!" : "Daily Practice"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {todayCompleted
                ? "Great job! Come back tomorrow."
                : `Stage ${progress.currentStageId}: ${STAGES[currentStageIndex].name}`}
            </p>
            {!todayCompleted && progress.consecutivePerfectDays > 0 && (
              <p className="text-xs text-purple-600 mt-1">
                {progress.consecutivePerfectDays}/{STAGES[currentStageIndex].unlockRequirement} perfect days to next stage
              </p>
            )}
          </div>
          {!todayCompleted && (
            <button onClick={() => setPracticing(true)} className="btn-primary">
              Go!
            </button>
          )}
        </div>
      </div>

      {/* Stage Progression */}
      <h2 className="font-bold text-lg mb-3">Your Journey</h2>
      <div className="space-y-3 pb-8">
        {STAGES.map((stage, idx) => (
          <StageCard
            key={stage.id}
            stage={stage}
            isUnlocked={idx <= currentStageIndex}
            isCurrent={stage.id === progress.currentStageId}
            onStart={() => setPracticing(true)}
          />
        ))}
      </div>
    </main>
  );
}
