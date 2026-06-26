"use client";

import { useEffect, useState, useCallback } from "react";
import { STAGES } from "@/lib/stages";
import { UserProgress, loadProgress, saveProgress, isStreakActive, getToday } from "@/lib/progress-store";
import {
  UserProfile,
  GameState,
  AppSettings,
  EarnedBadge,
  loadProfile,
  loadGameState,
  loadSettings,
  loadBadges,
  saveBadges,
  isOnboardingComplete,
  checkNewBadges,
  AgeGroup,
} from "@/lib/user-store";
import SplashScreen from "@/components/SplashScreen";
import OnboardingFlow from "@/components/OnboardingFlow";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import HomeDashboard from "@/components/HomeDashboard";
import PracticeView from "@/components/PracticeView";
import JourneyMap from "@/components/JourneyMap";
import RewardsPage from "@/components/RewardsPage";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";

type AppScreen = "splash" | "onboarding" | "home" | "practice" | "journey" | "rewards" | "profile" | "settings" | "parent";

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("splash");
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);

  useEffect(() => {
    const p = loadProgress();
    if (p.lastPracticeDate && !isStreakActive(p.lastPracticeDate)) {
      p.streak = 0;
      p.consecutivePerfectDays = 0;
      saveProgress(p);
    }
    setProgress(p);
    setProfile(loadProfile());
    setGameState(loadGameState());
    setSettings(loadSettings());
    setBadges(loadBadges());
  }, []);

  const handleSplashComplete = useCallback(() => {
    if (!isOnboardingComplete() || !loadProfile()) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, []);

  const handleOnboardingComplete = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    setScreen("home");
  }, []);

  const handleNavigate = useCallback((page: string) => {
    setScreen(page as AppScreen);
  }, []);

  const handleStartPractice = useCallback(() => {
    setScreen("practice");
  }, []);

  const handlePracticeComplete = useCallback((updatedProgress: UserProgress, updatedGameState: GameState) => {
    setProgress(updatedProgress);
    setGameState(updatedGameState);

    const existingBadges = loadBadges();
    const newBadges = checkNewBadges(updatedGameState, updatedProgress.streak, updatedProgress.currentStageId, existingBadges);
    if (newBadges.length > 0) {
      const allBadges = [...existingBadges, ...newBadges];
      saveBadges(allBadges);
      setBadges(allBadges);
    }

    setScreen("home");
  }, []);

  const handlePracticeBack = useCallback(() => {
    setScreen("home");
  }, []);

  if (screen === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (screen === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (!progress || !gameState || !settings) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
      </div>
    );
  }

  const ageGroup: AgeGroup = profile?.ageGroup || "middle";
  const level = Math.floor(progress.xp / 500) + 1;

  if (screen === "practice") {
    const currentStage = STAGES.find((s) => s.id === progress.currentStageId)!;
    return (
      <div className={`app-shell app-shell--${ageGroup}`}>
        <PracticeView
          stage={currentStage}
          progress={progress}
          gameState={gameState}
          ageGroup={ageGroup}
          onComplete={handlePracticeComplete}
          onBack={handlePracticeBack}
        />
      </div>
    );
  }

  if (screen === "settings") {
    return (
      <div className={`app-shell app-shell--${ageGroup}`}>
        <SettingsPage
          settings={settings}
          onSettingsChange={setSettings}
          onBack={() => setScreen("home")}
        />
      </div>
    );
  }

  const showNav = ["home", "journey", "rewards", "profile"].includes(screen);

  return (
    <div className={`app-shell app-shell--${ageGroup}`}>
      <TopBar onSettingsClick={() => setScreen("settings")} />

      <main className="app-shell__content">
        {screen === "home" && profile && (
          <HomeDashboard
            profile={profile}
            progress={progress}
            gameState={gameState}
            badges={badges}
            onStartPractice={handleStartPractice}
            onNavigate={handleNavigate}
          />
        )}

        {screen === "journey" && (
          <JourneyMap
            progress={progress}
            onSelectStage={(stageId) => {
              handleStartPractice();
            }}
          />
        )}

        {screen === "rewards" && (
          <RewardsPage
            badges={badges}
            gameState={gameState}
            progress={progress}
          />
        )}

        {screen === "profile" && profile && (
          <ProfilePage
            profile={profile}
            progress={progress}
            gameState={gameState}
            badges={badges}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {showNav && (
        <BottomNav
          active={screen}
          onNavigate={handleNavigate}
          ageGroup={ageGroup}
        />
      )}
    </div>
  );
}
