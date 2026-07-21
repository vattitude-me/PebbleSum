"use client";

import { EarnedBadge, BADGE_DEFINITIONS, GameState } from "@/lib/user-store";
import { UserProgress } from "@/lib/progress-store";

interface RewardsPageProps {
  badges: EarnedBadge[];
  gameState: GameState;
  progress: UserProgress;
}

export default function RewardsPage({ badges, gameState, progress }: RewardsPageProps) {
  const earnedIds = badges.map((b) => b.badgeId);

  const categories = [
    { key: "streak", label: "Streak Awards", icon: "icon-fire.webp" },
    { key: "mastery", label: "Mastery", icon: "icon-star.webp" },
    { key: "speed", label: "Speed", icon: "icon-timer.webp" },
    { key: "milestone", label: "Milestones", icon: "icon-badge-trophy.webp" },
    { key: "consistency", label: "Consistency", icon: "icon-calendar.webp" },
  ];

  return (
    <div className="rewards">
      <h2 className="rewards__title">Rewards & Achievements</h2>
      <p className="rewards__subtitle">Collect badges by practicing every day!</p>

      {/* Summary Stats */}
      <div className="rewards__summary">
        <div className="rewards__summary-card">
          <img src="/assets/icons/icon-coin-star.webp" alt="Coins" className="rewards__summary-icon" />
          <span className="rewards__summary-value">{gameState.coins}</span>
          <span className="rewards__summary-label">Coins</span>
        </div>
        <div className="rewards__summary-card">
          <img src="/assets/icons/icon-star.webp" alt="Badges" className="rewards__summary-icon" />
          <span className="rewards__summary-value">{badges.length}/{BADGE_DEFINITIONS.length}</span>
          <span className="rewards__summary-label">Badges</span>
        </div>
        <div className="rewards__summary-card">
          <img src="/assets/icons/icon-fire.webp" alt="Best Streak" className="rewards__summary-icon" />
          <span className="rewards__summary-value">{gameState.longestStreak}</span>
          <span className="rewards__summary-label">Best Streak</span>
        </div>
      </div>

      {/* Badge Categories */}
      {categories.map((cat) => {
        const catBadges = BADGE_DEFINITIONS.filter((b) => b.category === cat.key);
        if (catBadges.length === 0) return null;

        return (
          <section key={cat.key} className="rewards__category">
            <div className="rewards__category-header">
              <img src={`/assets/icons/${cat.icon}`} alt={cat.label} className="rewards__category-icon" />
              <h3 className="rewards__category-title">{cat.label}</h3>
            </div>
            <div className="rewards__badges-grid">
              {catBadges.map((badge) => {
                const isEarned = earnedIds.includes(badge.id);
                const earned = badges.find((b) => b.badgeId === badge.id);

                return (
                  <div key={badge.id} className={`rewards__badge ${isEarned ? "rewards__badge--earned" : "rewards__badge--locked"}`}>
                    <div className="rewards__badge-icon-wrap">
                      <img
                        src={`/assets/icons/${badge.icon}`}
                        alt={badge.name}
                        className={`rewards__badge-img ${!isEarned ? "rewards__badge-img--locked" : ""}`}
                      />
                    </div>
                    <span className="rewards__badge-name">{badge.name}</span>
                    <span className="rewards__badge-desc">{badge.description}</span>
                    {isEarned && earned && (
                      <span className="rewards__badge-date">
                        {new Date(earned.earnedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
