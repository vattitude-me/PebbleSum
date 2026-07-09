"use client";

import { useEffect, useRef } from "react";
import { UserProgress } from "@/lib/progress-store";
import { STAGES } from "@/lib/stages";
import { WORLDS, getWorldProgress } from "@/lib/worlds";

interface JourneyMapProps {
  progress: UserProgress;
  onSelectStage: (stageId: string) => void;
}

export default function JourneyMap({ progress, onSelectStage }: JourneyMapProps) {
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

  return (
    <div className="journey">
      <h2 className="journey__title">Your Learning Journey</h2>
      <p className="journey__subtitle">Master each world to progress through math!</p>

      <div className="journey__worlds">
        {WORLDS.map((world, worldIdx) => {
          const worldProgress = getWorldProgress(world.stageIds, progress.currentStageId, completedStageIds);
          const isActiveWorld = world.stageIds.includes(progress.currentStageId);
          const isPastWorld = world.stageIds.every((id) => completedStageIds.includes(id));
          const isFutureWorld = !isActiveWorld && !isPastWorld && worldIdx > 0;

          return (
            <div key={world.id} className={`journey__world ${isFutureWorld ? "journey__world--locked" : ""}`}>
              {/* World Header */}
              <div className={`journey__world-header bg-gradient-to-r ${world.gradient}`}>
                <span className="journey__world-icon">{world.icon}</span>
                <div className="journey__world-info">
                  <h3 className="journey__world-name">{world.name}</h3>
                  <p className="journey__world-desc">{world.description}</p>
                </div>
                {isPastWorld && (
                  <div className="journey__world-complete">
                    <img src="/assets/icons/icon-checkmark.png" alt="Complete" className="journey__world-check" />
                  </div>
                )}
              </div>

              {/* World Progress Bar */}
              <div className="journey__world-progress-bar">
                <div className="journey__world-progress-fill" style={{ width: `${worldProgress}%` }} />
              </div>

              {/* Stages in World */}
              <div className="journey__stages">
                {world.stageIds.map((stageId) => {
                  const stage = STAGES.find((s) => s.id === stageId)!;
                  const stageIdx = STAGES.findIndex((s) => s.id === stageId);
                  const state = getStageState(stageId, stageIdx);

                  return (
                    <button
                      key={stageId}
                      ref={state === "current" ? currentStageRef : undefined}
                      className={`journey__stage journey__stage--${state}`}
                      onClick={() => state !== "locked" && onSelectStage(stageId)}
                      disabled={state === "locked"}
                    >
                      <div className="journey__stage-marker">
                        {state === "mastered" && <img src="/assets/icons/icon-checkmark.png" alt="Done" className="journey__stage-icon" />}
                        {state === "current" && <img src="/assets/icons/icon-star-purple.png" alt="Current" className="journey__stage-icon journey__stage-icon--pulse" />}
                        {state === "locked" && <span className="journey__stage-lock">🔒</span>}
                      </div>
                      <div className="journey__stage-info">
                        <span className="journey__stage-name">{stage.name}</span>
                        <span className="journey__stage-desc">{stage.description}</span>
                      </div>
                      {state === "current" && (
                        <span className="journey__stage-badge">NOW</span>
                      )}
                      {state === "mastered" && (
                        <span className="journey__stage-badge journey__stage-badge--replay">REPLAY</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Path connector between worlds */}
              {worldIdx < WORLDS.length - 1 && (
                <div className="journey__path-connector">
                  <div className="journey__path-line" />
                  <div className="journey__path-dot" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
