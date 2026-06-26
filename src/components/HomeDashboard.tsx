"use client";

import { UserProgress, getToday } from "@/lib/progress-store";
import { UserProfile, GameState, EarnedBadge } from "@/lib/user-store";
import { STAGES } from "@/lib/stages";
import { getWorldForStage } from "@/lib/worlds";
import { PracticeMode } from "@/components/PracticeView";

interface HomeDashboardProps {
  profile: UserProfile;
  progress: UserProgress;
  gameState: GameState;
  badges: EarnedBadge[];
  onStartPractice: (mode: PracticeMode) => void;
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
  const today = getToday();
  const isSameDay = gameState.practiceDate === today;
  const todayPracticeMinutes = isSameDay ? Math.floor(gameState.todayPracticeSeconds / 60) : 0;
  const goalMinutes = profile.dailyGoalMinutes;
  const goalProgress = Math.min(todayPracticeMinutes / goalMinutes, 1);
  const todayCompleted = gameState.dailyGoalCompleted && isSameDay;
  const practiceCount = progress.stagePracticeCounts?.[progress.currentStageId] || 0;
  const canAttemptLevelClear = practiceCount >= (currentStage?.practiceSessionsRequired || 3);
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
      <div className="dashboard__overlay" />

      <div className="dashboard__content">
        {/* Header: Greeting + Stats Strip */}
        <header className="dashboard__header">
          <div className="dashboard__greeting">
            <p className="dashboard__greeting-hello">{getGreeting()},</p>
            <h2 className="dashboard__greeting-name">{profile.name}!</h2>
          </div>
          <div className="dashboard__stats-strip">
            <div className="dashboard__stat-chip">
              <img src="/assets/icons/icon-fire.png" alt="Streak" className="dashboard__stat-icon" />
              <span className="dashboard__stat-value">{progress.streak}</span>
            </div>
            <div className="dashboard__stat-chip">
              <img src="/assets/icons/icon-coin-star.png" alt="Coins" className="dashboard__stat-icon" />
              <span className="dashboard__stat-value">{gameState.coins}</span>
            </div>
            <div className="dashboard__stat-chip dashboard__stat-chip--xp">
              <span className="dashboard__xp-label">Lv {level}</span>
              <div className="dashboard__xp-bar">
                <div className="dashboard__xp-fill" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
              </div>
            </div>
          </div>
        </header>

        {/* Primary Action: Practice CTA */}
        <section className="dashboard__primary-action">
          {todayCompleted ? (
            <div className="dashboard__goal-complete">
              <div className="dashboard__goal-complete-icon">
                <img src="/assets/icons/icon-checkmark.png" alt="Done" className="dashboard__complete-img" />
              </div>
              <div className="dashboard__goal-complete-text">
                <h3 className="dashboard__goal-complete-title">Today&apos;s Goal Complete!</h3>
                <p className="dashboard__goal-complete-sub">Amazing work! Come back tomorrow.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="dashboard__goal-info">
                <span className="dashboard__goal-label">Daily Goal</span>
                <div className="dashboard__goal-progress-row">
                  <div className="dashboard__goal-bar">
                    <div className="dashboard__goal-fill" style={{ width: `${goalProgress * 100}%` }} />
                  </div>
                  <span className="dashboard__goal-text">{todayPracticeMinutes}/{goalMinutes} min</span>
                </div>
              </div>
              <button onClick={() => onStartPractice("practice")} className="dashboard__practice-btn">
                <img src="/assets/icons/icon-play.png" alt="Start" className="dashboard__practice-icon" />
                <span>Practice</span>
              </button>
            </>
          )}
        </section>

        {/* Level Clear + Journey — 2-column grid */}
        <div className="dashboard__duo-grid">
          <section className={`dashboard__level-strip ${canAttemptLevelClear ? "dashboard__level-strip--unlocked" : ""}`}>
            <div className="dashboard__level-strip-badge">
              {canAttemptLevelClear ? "🏆" : "🔒"}
            </div>
            <div className="dashboard__level-strip-info">
              <span className="dashboard__level-strip-title">
                Level Clear
              </span>
              <span className="dashboard__level-strip-subtitle">
                {currentStage?.name || "Test"}
              </span>
              {canAttemptLevelClear ? (
                <button onClick={() => onStartPractice("levelClear")} className="dashboard__level-strip-btn">
                  Start
                </button>
              ) : (
                <div className="dashboard__level-strip-progress">
                  <div className="dashboard__level-strip-bar">
                    <div
                      className="dashboard__level-strip-fill"
                      style={{ width: `${(practiceCount / (currentStage?.practiceSessionsRequired || 3)) * 100}%` }}
                    />
                  </div>
                  <span className="dashboard__level-strip-count">
                    {practiceCount}/{currentStage?.practiceSessionsRequired || 3} sessions
                  </span>
                </div>
              )}
            </div>
          </section>

          {world && (
            <section className="dashboard__journey-card" onClick={() => onNavigate("journey")}>
              <span className="dashboard__journey-icon">{world.icon}</span>
              <div className="dashboard__journey-info">
                <h4 className="dashboard__journey-name">{world.name}</h4>
                <p className="dashboard__journey-progress">Stage {currentStageIndex + 1} of {STAGES.length}</p>
              </div>
              <img src="/assets/icons/icon-arrow-right.png" alt="Go" className="dashboard__journey-arrow" />
            </section>
          )}
        </div>

      </div>
    </div>
  );
}
