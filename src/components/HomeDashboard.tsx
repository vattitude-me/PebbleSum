"use client";

import { UserProgress, getToday } from "@/lib/progress-store";
import { UserProfile, GameState, EarnedBadge } from "@/lib/user-store";
import { STAGES } from "@/lib/stages";
import { getWorldForStage } from "@/lib/worlds";

interface HomeDashboardProps {
  profile: UserProfile;
  progress: UserProgress;
  gameState: GameState;
  badges: EarnedBadge[];
  onStartPractice: () => void;
  onNavigate: (page: string) => void;
}

export default function HomeDashboard({
  profile,
  progress,
  gameState,
  badges,
  onStartPractice,
  onNavigate,
}: HomeDashboardProps) {
  const currentStageIndex = STAGES.findIndex((s) => s.id === progress.currentStageId);
  const currentStage = STAGES[currentStageIndex];
  const todayCompleted = progress.completedSessions.some(
    (s) => s.date === getToday() && s.stageId === progress.currentStageId
  );
  const world = getWorldForStage(progress.currentStageId);
  const level = Math.floor(progress.xp / 500) + 1;
  const xpInLevel = progress.xp % 500;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };


  return (
    <div className="dashboard">

 {/* Coins + XP (compact row) */}
      <section className="dashboard__progress-row">
        <div className="dashboard__coins-pill">
          <img src="/assets/icons/icon-coin-star.png" alt="Coins" className="dashboard__coins-icon" />
          <span className="dashboard__coins-value">{gameState.coins}</span>
        </div>
        <div className="dashboard__xp-inline">
          <span className="dashboard__xp-level">Lv {level}</span>
          <div className="dashboard__xp-bar">
            <div className="dashboard__xp-fill" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
          </div>
          <span className="dashboard__xp-count">{xpInLevel}/{500}</span>
        </div>
      </section>

      {/* Greeting + Streak */}
      <section className="dashboard__greeting">
        <div className="dashboard__greeting-text">
          <p className="dashboard__greeting-hello">{getGreeting()},</p>
          <h2 className="dashboard__greeting-name">{profile.name}!</h2>
        </div>
        <div className="dashboard__streak-pill">
          <img src="/assets/icons/icon-fire.png" alt="Streak" className="dashboard__streak-icon" />
          <span className="dashboard__streak-value">{progress.streak}</span>
        </div>
      </section>

     

      {/* Daily Goal Card */}
      <section className="dashboard__daily-card">
        <div className={`dashboard__daily-bg bg-gradient-to-br ${world?.gradient || "from-purple-300 to-indigo-400"}`} />
        <div className="dashboard__daily-content">
          <div className="dashboard__daily-info">
            <span className="dashboard__daily-label">
              {todayCompleted ? "Today's Practice Complete! 🎉" : "Daily Goal"}
            </span>
            <h3 className="dashboard__daily-title">
              {todayCompleted
                ? "Amazing work! Come back tomorrow."
                : `${currentStage?.name || "Practice"}`}
            </h3>
            {!todayCompleted && (
              <p className="dashboard__daily-meta">
                {currentStage?.questionsPerDay} questions · {Math.floor((currentStage?.sctSeconds || 300) / 60)} min target
              </p>
            )}
          </div>
          {!todayCompleted && (
            <button onClick={onStartPractice} className="dashboard__start-btn">
              <img src="/assets/icons/icon-play.png" alt="Start" className="dashboard__start-icon" />
              <span>Start</span>
            </button>
          )}
          {todayCompleted && (
            <div className="dashboard__complete-badge">
              <img src="/assets/icons/icon-checkmark.png" alt="Done" className="dashboard__complete-icon" />
            </div>
          )}
        </div>
      </section>

      

      {/* Journey Card (Primary Progression) */}
      {world && (
        <section className="dashboard__world-card" onClick={() => onNavigate("journey")}>
          <div className={`dashboard__world-bg bg-gradient-to-r ${world.gradient}`} />
          <div className="dashboard__world-content">
            <div className="dashboard__world-icon-wrap">
              <span className="dashboard__world-icon">{world.icon}</span>
            </div>
            <div className="dashboard__world-info">
              <h4 className="dashboard__world-name">{world.name}</h4>
              <p className="dashboard__world-desc">Continue your learning path</p>
              <p className="dashboard__world-progress">Stage {currentStageIndex + 1} of {STAGES.length}</p>
            </div>
            <img src="/assets/icons/icon-arrow-right.png" alt="Go" className="dashboard__world-arrow" />
          </div>
        </section>
      )}

      {/* Mastery Progress */}
      {!todayCompleted && progress.consecutivePerfectDays > 0 && currentStage && (
        <section className="dashboard__mastery">
          <h4 className="dashboard__mastery-title">Stage Mastery</h4>
          <div className="dashboard__mastery-bar">
            <div
              className="dashboard__mastery-fill"
              style={{ width: `${(progress.consecutivePerfectDays / currentStage.unlockRequirement) * 100}%` }}
            />
          </div>
          <p className="dashboard__mastery-text">
            {progress.consecutivePerfectDays} / {currentStage.unlockRequirement} perfect days to unlock next stage
          </p>
        </section>
      )}
    </div>
  );
}
