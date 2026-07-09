"use client";

import { useEffect, useState, useCallback } from "react";
import { STAGES, getStartingStageForAge } from "@/lib/stages";
import { UserProgress, loadProgress, saveProgress, isStreakActive, getToday } from "@/lib/progress-store";
import {
  UserProfile,
  GameState,
  AppSettings,
  EarnedBadge,
  loadProfile,
  loadGameState,
  saveGameState as saveGameStateLocal,
  loadSettings,
  saveSettings as saveSettingsLocal,
  loadBadges,
  saveBadges,
  isOnboardingComplete,
  checkNewBadges,
  AgeGroup,
} from "@/lib/user-store";
import { useAuth } from "@/lib/auth-context";
import { loadUserData, saveUserData, FirestoreUserData } from "@/lib/firestore-sync";
import * as firestoreSync from "@/lib/firestore-sync";
import SplashScreen from "@/components/SplashScreen";
import OnboardingFlow from "@/components/OnboardingFlow";
import AuthScreen from "@/components/AuthScreen";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import HomeDashboard from "@/components/HomeDashboard";
import PracticeView, { PracticeMode } from "@/components/PracticeView";
import JourneyMap from "@/components/JourneyMap";
import RewardsPage from "@/components/RewardsPage";
import ProfilePage from "@/components/ProfilePage";
import TermsPage from "@/components/TermsPage";
import PrivacyPage from "@/components/PrivacyPage";

type AppScreen = "splash" | "auth" | "onboarding" | "home" | "practice" | "journey" | "rewards" | "profile" | "parent" | "terms" | "privacy";

export default function Home() {
  const { user, loading: authLoading, isGuest } = useAuth();
  const [screen, setScreen] = useState<AppScreen>("splash");
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("practice");
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && !isGuest && dataLoaded) {
      setScreen("auth");
      setProfile(null);
      setProgress(null);
      setGameState(null);
      setSettings(null);
      setBadges([]);
      setDataLoaded(false);
    }
  }, [user, authLoading, isGuest, dataLoaded]);

  useEffect(() => {
    if (authLoading) return;
    if (!user && !isGuest) return;

    const loadData = async () => {
      if (user) {
        const cloudData = await loadUserData(user.uid);
        if (!cloudData && dataLoaded && profile) {
          const localData: FirestoreUserData = {
            profile: profile,
            gameState: gameState || loadGameState(),
            settings: settings || loadSettings(),
            badges: badges.length > 0 ? badges : loadBadges(),
            progress: progress || loadProgress(),
            onboardingComplete: true,
          };
          await saveUserData(user.uid, localData);
          setDataLoaded(true);
          return;
        }
        if (cloudData) {
          setProfile(cloudData.profile);
          setGameState(cloudData.gameState);
          setSettings(cloudData.settings);
          setBadges(cloudData.badges);
          const p = cloudData.progress;
          if (p.lastPracticeDate && !isStreakActive(p.lastPracticeDate)) {
            p.streak = 0;
            p.consecutivePerfectDays = 0;
            firestoreSync.saveProgress(user.uid, p);
          }
          setProgress(p);

          saveProgress(p);
          saveGameStateLocal(cloudData.gameState);
          saveSettingsLocal(cloudData.settings);
          saveBadges(cloudData.badges);

          setDataLoaded(true);
          return;
        }
      }

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
      setDataLoaded(true);
    };

    loadData();
  }, [user, authLoading, isGuest]);

  const handleSplashComplete = useCallback(() => {
    if (authLoading) return;
    if (!user && !isGuest) {
      setScreen("auth");
    } else if (!dataLoaded) {
      return;
    } else if (!profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [authLoading, user, isGuest, dataLoaded, profile]);

  const handleAuthSuccess = useCallback(() => {
    if (!isOnboardingComplete() && !profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [profile]);

  const handleGuestStart = useCallback(() => {
    if (!isOnboardingComplete() && !profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [profile]);


  const handleOnboardingComplete = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    const startingStage = getStartingStageForAge(newProfile.age);
    const baseProgress = progress || loadProgress();
    const updatedProgress = { ...baseProgress, currentStageId: startingStage };
    saveProgress(updatedProgress);
    setProgress(updatedProgress);

    const currentGameState = gameState || loadGameState();
    const currentSettings = settings || loadSettings();
    const currentBadges = badges.length > 0 ? badges : loadBadges();

    if (user) {
      const data: FirestoreUserData = {
        profile: newProfile,
        gameState: currentGameState,
        settings: currentSettings,
        badges: currentBadges,
        progress: updatedProgress,
        onboardingComplete: true,
      };
      await saveUserData(user.uid, data);
    }
    setScreen("home");
  }, [user, progress, gameState, settings, badges]);

  const handleNavigate = useCallback((page: string) => {
    setScreen(page as AppScreen);
  }, []);

  const handleStartPractice = useCallback((mode: PracticeMode = "practice") => {
    setPracticeMode(mode);
    setScreen("practice");
  }, []);

  const handlePracticeComplete = useCallback(async (updatedProgress: UserProgress, updatedGameState: GameState) => {
    setProgress(updatedProgress);
    setGameState(updatedGameState);

    const existingBadges = loadBadges();
    const newBadges = checkNewBadges(updatedGameState, updatedProgress.streak, updatedProgress.currentStageId, existingBadges);
    if (newBadges.length > 0) {
      const allBadges = [...existingBadges, ...newBadges];
      saveBadges(allBadges);
      setBadges(allBadges);

      if (user) {
        await firestoreSync.saveBadges(user.uid, allBadges);
      }
    }

    if (user) {
      await firestoreSync.saveProgressAndGameState(user.uid, updatedProgress, updatedGameState);
    }

    setScreen("home");
  }, [user]);

  const handlePracticeBack = useCallback(() => {
    setScreen("home");
  }, []);

  const handleSettingsChange = useCallback((updated: AppSettings) => {
    setSettings(updated);
    if (user) {
      firestoreSync.saveSettings(user.uid, updated);
    }
  }, [user]);

  if (screen === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (screen === "auth") {
    return (
      <div className={`app-shell app-shell--${profile?.ageGroup || "middle"}`}>
        <AuthScreen onSuccess={handleAuthSuccess} onSkip={handleGuestStart} />
      </div>
    );
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

  const themeClass = settings.theme !== "default" ? `theme-${settings.theme}` : "";
  const textSizeClass = settings.textSize === "large" ? "text-size-large" : settings.textSize === "extra-large" ? "text-size-extra-large" : "";
  const shellClasses = `app-shell app-shell--${ageGroup} ${themeClass} ${textSizeClass}`.trim();

  if (screen === "practice") {
    const currentStage = STAGES.find((s) => s.id === progress.currentStageId)!;
    return (
      <div className={shellClasses}>
        <PracticeView
          stage={currentStage}
          mode={practiceMode}
          progress={progress}
          gameState={gameState}
          profile={profile!}
          ageGroup={ageGroup}
          onComplete={handlePracticeComplete}
          onBack={handlePracticeBack}
        />
      </div>
    );
  }

  if (screen === "terms") {
    return (
      <div className={shellClasses}>
        <TermsPage onBack={() => setScreen("profile")} />
      </div>
    );
  }

  if (screen === "privacy") {
    return (
      <div className={shellClasses}>
        <PrivacyPage onBack={() => setScreen("profile")} />
      </div>
    );
  }

  const showNav = ["home", "journey", "rewards", "profile"].includes(screen);

  return (
    <div className={shellClasses}>
      <TopBar />

      <main className="app-shell__content">
        {screen === "home" && profile && (
          <HomeDashboard
            profile={profile}
            progress={progress}
            gameState={gameState}
            onStartPractice={handleStartPractice}
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
            settings={settings}
            onSettingsChange={handleSettingsChange}
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
