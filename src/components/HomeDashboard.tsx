"use client";

import { useEffect, useState, useRef } from "react";
import { UserProgress, getToday } from "@/lib/progress-store";
import { UserProfile, GameState } from "@/lib/user-store";
import { STAGES, getStageById, getStageIndex } from "@/lib/stages";
import { getWorldForStage } from "@/lib/worlds";
import { getTone } from "@/lib/tone";
import { PracticeMode } from "@/components/PracticeView";
import IOSInstallModal from "@/components/IOSInstallModal";

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
  const currentStage = getStageById(progress.currentStageId) ?? STAGES[0];
  const stageIndex = getStageIndex(currentStage.id);
  const world = getWorldForStage(currentStage.id);
  const tone = getTone(profile.ageGroup);
  const today = getToday();
  const isSameDay = gameState.practiceDate === today;

  const todayPracticeMinutes = isSameDay ? Math.floor(gameState.todayPracticeSeconds / 60) : 0;
  const goalMinutes = profile.dailyGoalMinutes;
  const goalProgress = Math.min(todayPracticeMinutes / goalMinutes, 1);
  const todayCompleted = gameState.dailyGoalCompleted && isSameDay;
  const practiceCount = progress.stagePracticeCounts?.[currentStage.id] || 0;
  const practicesNeeded = currentStage.practiceSessionsRequired;
  const isAutoClear = currentStage.id === "6A";
  const canAttemptLevelClear = !isAutoClear && practiceCount >= practicesNeeded;
  const practicesLeft = Math.max(0, practicesNeeded - practiceCount);
  const level = Math.floor(progress.xp / 500) + 1;
  const xpInLevel = progress.xp % 500;
  const upNext = STAGES.slice(stageIndex + 1, stageIndex + 4);
  const isFinalStage = stageIndex === STAGES.length - 1;

  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSModalOpen, setIsIOSModalOpen] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      const dismissed = localStorage.getItem("pebblesum_ios_install_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
      return;
    }

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
    if (isIOS) {
      setIsIOSModalOpen(true);
      return;
    }
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    deferredPromptRef.current = null;
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    if (isIOS) {
      localStorage.setItem("pebblesum_ios_install_dismissed", "true");
    }
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
        <header className="dashboard__header">
          <div className="dashboard__greeting">
            <p className="dashboard__greeting-hello">{getGreeting()},</p>
            <h2 className="dashboard__greeting-name">{profile.name}!</h2>
          </div>
          <div className="dashboard__stats-strip">
            <div className="dashboard__stat-chip" title="Day streak">
              <img src="/assets/icons/icon-fire.webp" alt="" className="dashboard__stat-icon" />
              <span className="dashboard__stat-value">{progress.streak}</span>
              <span className="dashboard__stat-unit">{progress.streak === 1 ? "day" : "days"}</span>
            </div>
            <div className="dashboard__stat-chip" title="Coins">
              <img src="/assets/icons/icon-coin-star.webp" alt="" className="dashboard__stat-icon" />
              <span className="dashboard__stat-value">{gameState.coins}</span>
            </div>
            <div className="dashboard__stat-chip dashboard__stat-chip--xp" title={`${xpInLevel}/500 XP to level ${level + 1}`}>
              <span className="dashboard__xp-label">Lv {level}</span>
              <div className="dashboard__xp-bar">
                <div className="dashboard__xp-fill" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
              </div>
            </div>
          </div>
        </header>

        <section className="mission" style={{ "--world-color": world?.color ?? "var(--primary)" } as React.CSSProperties}>
          <div className="mission__top">
            <span className="mission__world">{world?.icon} {world?.name}</span>
            <span className="mission__step">Stage {stageIndex + 1} of {STAGES.length}</span>
          </div>
          <h3 className="mission__title">{currentStage.name}</h3>
          <p className="mission__desc">{currentStage.description}</p>

          {/* Practice → test path: each dot is one practice session */}
          <div className="mission__path" aria-label={isAutoClear ? `${practiceCount} of 10 practices` : `${Math.min(practiceCount, practicesNeeded)} of ${practicesNeeded} practices before the test`}>
            {Array.from({ length: isAutoClear ? 10 : practicesNeeded }).map((_, i) => (
              <span key={i} className={`mission__dot ${i < practiceCount ? "mission__dot--done" : ""}`} />
            ))}
            {!isAutoClear && (
              <>
                <span className="mission__path-line" />
                <span className={`mission__trophy ${canAttemptLevelClear ? "mission__trophy--open" : ""}`}>{canAttemptLevelClear ? "🏆" : "🔒"}</span>
              </>
            )}
          </div>
          <p className="mission__path-caption">
            {isAutoClear
              ? `${Math.max(0, 10 - practiceCount)} more to finish this stage`
              : canAttemptLevelClear
                ? "Test unlocked — clear it to move on!"
                : `${practicesLeft} more ${practicesLeft === 1 ? "practice" : "practices"} to unlock the test`}
          </p>

          <div className="mission__actions">
            <button onClick={() => onStartPractice("practice")} className={`mission__play ${canAttemptLevelClear ? "mission__play--secondary" : ""}`}>
              <img src="/assets/icons/icon-play.webp" alt="" className="mission__play-icon" />
              <span>{tone.practiceCta}</span>
            </button>
            {canAttemptLevelClear && (
              <button onClick={() => onStartPractice("levelClear")} className="mission__test">
                <span>🏆 Take the test</span>
                <span className="mission__test-meta">{currentStage.levelClearQuestions} questions · {Math.round(currentStage.levelClearSeconds / 6) / 10} min</span>
              </button>
            )}
          </div>
        </section>

        <section className={`goal-card ${todayCompleted ? "goal-card--done" : ""}`}>
          <div className="goal-card__ring" style={{ "--goal": `${goalProgress * 360}deg` } as React.CSSProperties}>
            <span>{todayCompleted ? "✓" : `${Math.round(goalProgress * 100)}%`}</span>
          </div>
          <div className="goal-card__text">
            <p className="goal-card__title">{todayCompleted ? "Daily goal done!" : "Daily goal"}</p>
            <p className="goal-card__sub">{todayCompleted ? "Extra practice still earns XP." : `${todayPracticeMinutes} of ${goalMinutes} minutes today`}</p>
          </div>
        </section>

        {upNext.length > 0 ? (
          <section className="up-next">
            <p className="up-next__label">Coming up</p>
            <div className="up-next__row">
              {upNext.map((stage) => {
                const w = getWorldForStage(stage.id);
                return (
                  <div key={stage.id} className="up-next__item">
                    <span className="up-next__icon">{w?.icon}</span>
                    <span className="up-next__name">{stage.name}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : isFinalStage && (
          <section className="up-next">
            <p className="up-next__label">Final stage — you&apos;ve reached the summit 🏔️</p>
          </section>
        )}

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
              <button onClick={handleDismissBanner} className="dashboard__install-dismiss">
                ✕
              </button>
            </div>
          </section>
        )}

      </div>
      <IOSInstallModal isOpen={isIOSModalOpen} onClose={() => setIsIOSModalOpen(false)} />
    </div>
  );
}
