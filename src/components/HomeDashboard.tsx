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

  const getMascotState = () => {
    if (todayCompleted) return "icon-pebble-celebrate-left.png";
    if (progress.streak >= 7) return "icon-pebble-celebrate-left.png";
    return "icon-pebble-wave.png";
  };

  return (
    <div className="dashboard">
      {/* Greeting Section */}
      <section className="dashboard__greeting">
        <div className="dashboard__greeting-text">
          <p className="dashboard__greeting-hello">{getGreeting()},</p>
          <h2 className="dashboard__greeting-name">{profile.name}!</h2>
        </div>
        <div className="dashboard__greeting-mascot">
          <img src={`/assets/icons/${getMascotState()}`} alt="Pebble" className="dashboard__mascot-img" />
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

      {/* Stats Row */}
      <section className="dashboard__stats">
        <div className="dashboard__stat-card">
          <img src="/assets/icons/icon-fire.png" alt="Streak" className="dashboard__stat-icon" />
          <span className="dashboard__stat-value">{progress.streak}</span>
          <span className="dashboard__stat-label">Day Streak</span>
        </div>
        <div className="dashboard__stat-card">
          <img src="/assets/icons/icon-xp.png" alt="Level" className="dashboard__stat-icon" />
          <span className="dashboard__stat-value">{level}</span>
          <span className="dashboard__stat-label">Level</span>
        </div>
        <div className="dashboard__stat-card">
          <img src="/assets/icons/icon-coin-star.png" alt="Coins" className="dashboard__stat-icon" />
          <span className="dashboard__stat-value">{gameState.coins}</span>
          <span className="dashboard__stat-label">Coins</span>
        </div>
        <div className="dashboard__stat-card" onClick={() => onNavigate("rewards")}>
          <img src="/assets/icons/icon-star.png" alt="Badges" className="dashboard__stat-icon" />
          <span className="dashboard__stat-value">{badges.length}</span>
          <span className="dashboard__stat-label">Badges</span>
        </div>
      </section>

      {/* XP Progress */}
      <section className="dashboard__xp-section">
        <div className="dashboard__xp-header">
          <span className="dashboard__xp-level">Level {level}</span>
          <span className="dashboard__xp-count">{xpInLevel} / 500 XP</span>
        </div>
        <div className="dashboard__xp-bar">
          <div className="dashboard__xp-fill" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
        </div>
      </section>

      {/* Current World */}
      {world && (
        <section className="dashboard__world-card" onClick={() => onNavigate("journey")}>
          <div className={`dashboard__world-bg bg-gradient-to-r ${world.gradient}`} />
          <div className="dashboard__world-content">
            <span className="dashboard__world-icon">{world.icon}</span>
            <div className="dashboard__world-info">
              <h4 className="dashboard__world-name">{world.name}</h4>
              <p className="dashboard__world-desc">{world.description}</p>
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

      {/* Quick Actions */}
      <section className="dashboard__actions">
        <button className="dashboard__action-btn" onClick={() => onNavigate("journey")}>
          <img src="/assets/icons/icon-level.png" alt="Journey" className="dashboard__action-icon" />
          <span>Journey Map</span>
        </button>
        <button className="dashboard__action-btn" onClick={() => onNavigate("rewards")}>
          <img src="/assets/icons/icon-gift.png" alt="Rewards" className="dashboard__action-icon" />
          <span>Rewards</span>
        </button>
        <button className="dashboard__action-btn" onClick={() => onNavigate("profile")}>
          <img src="/assets/icons/icon-bar-chart.png" alt="Stats" className="dashboard__action-icon" />
          <span>My Stats</span>
        </button>
      </section>
    </div>
  );
}
