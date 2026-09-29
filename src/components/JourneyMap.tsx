"use client";

import { useEffect, useRef } from "react";
import { UserProgress } from "@/lib/progress-store";
import { STAGES } from "@/lib/stages";
import { WORLDS, getWorldProgress } from "@/lib/worlds";

interface JourneyMapProps {
  progress: UserProgress;
  onSelectStage: (stageId: string) => void;
  onSkipStage?: (stageId: string) => void;
}

export default function JourneyMap({ progress, onSelectStage, onSkipStage }: JourneyMapProps) {
  const currentStageRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (currentStageRef.current) {
      currentStageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [progress.currentStageId]);
  const currentStageIndex = STAGES.findIndex((s) => s.id === progress.currentStageId);
  const completedStageIds = STAGES.slice(0, currentStageIndex).map((s) => s.id);

  const getStageState = (stageId: string, idx: number): "mastered" | "current" | "locked" => {
    if (idx < currentStageIndex) return "mastered";
    if (stageId === progress.currentStageId) return "current";
    return "locked";
  };

  const totalMastered = currentStageIndex;

  return (
    <div className="journey">
      <h2 className="journey__title">Your Learning Journey</h2>
      <p className="journey__subtitle">
        {totalMastered} of {STAGES.length} stages mastered · tap any unlocked stage to practise
      </p>

      <div className="journey__worlds">
        {WORLDS.map((world, worldIdx) => {
          const worldProgress = getWorldProgress(world.stageIds, progress.currentStageId, completedStageIds);
          const masteredInWorld = world.stageIds.filter((id) => completedStageIds.includes(id)).length;
          const isActiveWorld = world.stageIds.includes(progress.currentStageId);
          const isPastWorld = world.stageIds.every((id) => completedStageIds.includes(id));
          const isFutureWorld = !isActiveWorld && !isPastWorld;

          return (
            <section
              key={world.id}
              className={`journey__world ${isFutureWorld ? "journey__world--locked" : ""} ${isActiveWorld ? "journey__world--active" : ""}`}
              style={{ "--world-color": world.color } as React.CSSProperties}
            >
              <div className={`journey__world-header bg-gradient-to-r ${world.gradient}`}>
                <span className="journey__world-icon">{world.icon}</span>
                <div className="journey__world-info">
                  <h3 className="journey__world-name">{world.name}</h3>
                  <p className="journey__world-desc">{world.description}</p>
                </div>
                <div className="journey__world-meta">
                  {isPastWorld ? (
                    <img src="/assets/icons/icon-checkmark.webp" alt="Complete" className="journey__world-check" />
                  ) : (
                    <span className="journey__world-count">{masteredInWorld}/{world.stageIds.length}</span>
                  )}
                  <span className="journey__world-ages">Ages {world.ages}</span>
                </div>
              </div>

              <div className="journey__world-progress-bar">
                <div className="journey__world-progress-fill" style={{ width: `${worldProgress}%` }} />
              </div>

              {/* Stages as a winding trail of nodes */}
              <ol className="journey__trail">
                {world.stageIds.map((stageId, i) => {
                  const stage = STAGES.find((s) => s.id === stageId)!;
                  const stageIdx = STAGES.findIndex((s) => s.id === stageId);
                  const state = getStageState(stageId, stageIdx);
                  const lane = ["center", "right", "center", "left"][i % 4];

                  return (
                    <li key={stageId} className={`journey__step journey__step--${lane}`}>
                      <button
                        ref={state === "current" ? currentStageRef : undefined}
                        className={`journey__node journey__node--${state}`}
                        onClick={() => state !== "locked" && onSelectStage(stageId)}
                        disabled={state === "locked"}
                        aria-label={`${stage.name}: ${state === "mastered" ? "mastered, tap to replay" : state === "current" ? "current stage" : "locked"}`}
                      >
                        <span className="journey__node-disc">
                          {state === "mastered" ? "✓" : state === "current" ? "★" : "🔒"}
                        </span>
                        {state === "current" && <span className="journey__node-now">NOW</span>}
                      </button>
                      <div className="journey__node-label">
                        <span className="journey__stage-name">{stage.name}</span>
                        <span className="journey__stage-desc">{stage.description}</span>
                      </div>
                      {stageId === "6A" && state === "current" && onSkipStage && (
                        <button className="journey__skip-btn" onClick={() => onSkipStage(stageId)}>
                          I know my numbers — skip ahead →
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>

              {worldIdx < WORLDS.length - 1 && (
                <div className="journey__path-connector">
                  <div className="journey__path-line" />
                  <div className="journey__path-dot" />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
