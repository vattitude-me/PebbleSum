"use client";

import { UserProfile, GameState, EarnedBadge } from "@/lib/user-store";
import { UserProgress } from "@/lib/progress-store";
import { STAGES } from "@/lib/stages";

interface ProfilePageProps {
  profile: UserProfile;
  progress: UserProgress;
  gameState: GameState;
  badges: EarnedBadge[];
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ profile, progress, gameState, badges, onNavigate }: ProfilePageProps) {
  const level = Math.floor(progress.xp / 500) + 1;
  const xpInLevel = progress.xp % 500;
  const currentStage = STAGES.find((s) => s.id === progress.currentStageId);
  const totalSessions = progress.completedSessions.length;
  const perfectSessions = progress.completedSessions.filter((s) => s.perfect).length;
  const speedSessions = progress.completedSessions.filter((s) => s.withinSCT).length;
  const accuracy = gameState.totalQuestionsAnswered > 0
    ? Math.round((gameState.totalCorrectAnswers / gameState.totalQuestionsAnswered) * 100)
    : 0;

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <section className="profile-page__header">
        <div className="profile-page__avatar">
          <img src={`/assets/icons/icon-${profile.avatarId}.png`} alt="Avatar" className="profile-page__avatar-img" />
        </div>
        <h2 className="profile-page__name">{profile.name}</h2>
        <p className="profile-page__title">Level {level} Learner</p>
        <div className="profile-page__xp-bar">
          <div className="profile-page__xp-fill" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
        </div>
        <span className="profile-page__xp-text">{xpInLevel}/500 XP to Level {level + 1}</span>
      </section>

      {/* Stats Grid */}
      <section className="profile-page__stats">
        <div className="profile-page__stat">
          <img src="/assets/icons/icon-fire.png" alt="Streak" className="profile-page__stat-icon" />
          <span className="profile-page__stat-value">{progress.streak}</span>
          <span className="profile-page__stat-label">Current Streak</span>
        </div>
        <div className="profile-page__stat">
          <img src="/assets/icons/icon-timer.png" alt="Best" className="profile-page__stat-icon" />
          <span className="profile-page__stat-value">{gameState.longestStreak}</span>
          <span className="profile-page__stat-label">Best Streak</span>
        </div>
        <div className="profile-page__stat">
          <img src="/assets/icons/icon-checkmark.png" alt="Sessions" className="profile-page__stat-icon" />
          <span className="profile-page__stat-value">{totalSessions}</span>
          <span className="profile-page__stat-label">Sessions</span>
        </div>
        <div className="profile-page__stat">
          <img src="/assets/icons/icon-star.png" alt="Perfect" className="profile-page__stat-icon" />
          <span className="profile-page__stat-value">{perfectSessions}</span>
          <span className="profile-page__stat-label">Perfect</span>
        </div>
      </section>

      {/* Performance */}
      <section className="profile-page__performance">
        <h3 className="profile-page__section-title">Performance</h3>
        <div className="profile-page__perf-grid">
          <div className="profile-page__perf-item">
            <span className="profile-page__perf-label">Accuracy</span>
            <div className="profile-page__perf-bar">
              <div className="profile-page__perf-fill profile-page__perf-fill--accuracy" style={{ width: `${accuracy}%` }} />
            </div>
            <span className="profile-page__perf-value">{accuracy}%</span>
          </div>
          <div className="profile-page__perf-item">
            <span className="profile-page__perf-label">Speed Mastery</span>
            <div className="profile-page__perf-bar">
              <div className="profile-page__perf-fill profile-page__perf-fill--speed" style={{ width: `${totalSessions > 0 ? (speedSessions / totalSessions) * 100 : 0}%` }} />
            </div>
            <span className="profile-page__perf-value">{totalSessions > 0 ? Math.round((speedSessions / totalSessions) * 100) : 0}%</span>
          </div>
        </div>
      </section>

      {/* Current Stage */}
      <section className="profile-page__current">
        <h3 className="profile-page__section-title">Current Stage</h3>
        <div className="profile-page__stage-card">
          <img src="/assets/icons/icon-level.png" alt="Stage" className="profile-page__stage-icon" />
          <div className="profile-page__stage-info">
            <span className="profile-page__stage-name">{currentStage?.name}</span>
            <span className="profile-page__stage-desc">{currentStage?.description}</span>
          </div>
        </div>
      </section>

      {/* Badges preview */}
      <section className="profile-page__badges">
        <div className="profile-page__badges-header">
          <h3 className="profile-page__section-title">Badges ({badges.length})</h3>
          <button onClick={() => onNavigate("rewards")} className="profile-page__see-all">See All</button>
        </div>
        <div className="profile-page__badges-row">
          {badges.slice(0, 5).map((b) => (
            <div key={b.badgeId} className="profile-page__badge-mini">
              <img src={`/assets/icons/icon-badge-trophy.png`} alt="Badge" className="profile-page__badge-img" />
            </div>
          ))}
          {badges.length === 0 && (
            <p className="profile-page__no-badges">Complete sessions to earn badges!</p>
          )}
        </div>
      </section>

      {/* Parent View Link */}
      <section className="profile-page__parent">
        <button onClick={() => onNavigate("parent")} className="profile-page__parent-btn">
          <img src="/assets/icons/icon-gear.png" alt="Parent" className="profile-page__parent-icon" />
          <span>Parent / Guardian View</span>
          <img src="/assets/icons/icon-arrow-right.png" alt="Go" className="profile-page__parent-arrow" />
        </button>
      </section>
    </div>
  );
}
