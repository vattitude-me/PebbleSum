"use client";

import { useEffect, useState, useRef } from "react";
import { UserProgress, getToday } from "@/lib/progress-store";
import { UserProfile, GameState } from "@/lib/user-store";
import { STAGES } from "@/lib/stages";
import { PracticeMode } from "@/components/PracticeView";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface HomeDashboardProps {
  profile: UserProfile;
  progress: UserProgress;
  gameState: GameState;
  onStartPractice: (mode: PracticeMode) => void;
}

export default function HomeDashboard({
  profile,
  progress,
  gameState,
  onStartPractice,
}: HomeDashboardProps) {
  const currentStage = STAGES.find((s) => s.id === progress.currentStageId);
  const today = getToday();
  const isSameDay = gameState.practiceDate === today;
  const todayPracticeMinutes = isSameDay ? Math.floor(gameState.todayPracticeSeconds / 60) : 0;
  const goalMinutes = profile.dailyGoalMinutes;
  const goalProgress = Math.min(todayPracticeMinutes / goalMinutes, 1);
  const todayCompleted = gameState.dailyGoalCompleted && isSameDay;
  const practiceCount = progress.stagePracticeCounts?.[progress.currentStageId] || 0;
  const canAttemptLevelClear = practiceCount >= (currentStage?.practiceSessionsRequired || 3);
  const level = Math.floor(progress.xp / 500) + 1;
  const xpInLevel = progress.xp % 500;

  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setShowInstallBanner(true);
    };

    const installedHandler = () => {
      setShowInstallBanner(false);
      deferredPromptRef.current = null;
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    deferredPromptRef.current = null;
  };

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

        {/* Primary Action: Practice CTA + Level Strip */}
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
            <div className="dashboard__action-row">
              <div className="dashboard__action-left">
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
              </div>
              <div className={`dashboard__action-level ${canAttemptLevelClear ? "dashboard__action-level--unlocked" : ""}`}>
                <div className="dashboard__action-level-badge">
                  {canAttemptLevelClear ? "🏆" : "🔒"}
                </div>
                <span className="dashboard__action-level-title">{currentStage?.name || "Test"}</span>
                <span className="dashboard__action-level-stage">To clear the level</span>
                {canAttemptLevelClear ? (
                  <button onClick={() => onStartPractice("levelClear")} className="dashboard__action-level-btn">
                    Start
                  </button>
                ) : (
                  <div className="dashboard__action-level-progress">
                    <div className="dashboard__action-level-bar">
                      <div
                        className="dashboard__action-level-fill"
                        style={{ width: `${(practiceCount / (currentStage?.practiceSessionsRequired || 3)) * 100}%` }}
                      />
                    </div>
                    <span className="dashboard__action-level-count">
                      {practiceCount}/{currentStage?.practiceSessionsRequired || 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {showInstallBanner && (
          <section className="dashboard__install-banner">
            <div className="dashboard__install-info">
              <span className="dashboard__install-icon">📲</span>
              <div>
                <p className="dashboard__install-title">Install PebbleSum</p>
                <p className="dashboard__install-desc">Add to home screen for quick access</p>
              </div>
            </div>
            <div className="dashboard__install-actions">
              <button onClick={handleInstallClick} className="dashboard__install-btn">
                Install
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="dashboard__install-dismiss">
                ✕
              </button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
