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
import { useAuth } from "@/lib/auth-context";
import { loadUserData, saveUserData, FirestoreUserData } from "@/lib/firestore-sync";
import * as firestoreSync from "@/lib/firestore-sync";
import SplashScreen from "@/components/SplashScreen";
import OnboardingFlow from "@/components/OnboardingFlow";
import AuthScreen from "@/components/AuthScreen";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import HomeDashboard from "@/components/HomeDashboard";
import PracticeView from "@/components/PracticeView";
import JourneyMap from "@/components/JourneyMap";
import RewardsPage from "@/components/RewardsPage";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";
import TermsPage from "@/components/TermsPage";
import PrivacyPage from "@/components/PrivacyPage";

type AppScreen = "splash" | "auth" | "onboarding" | "home" | "practice" | "journey" | "rewards" | "profile" | "settings" | "parent" | "terms" | "privacy";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [screen, setScreen] = useState<AppScreen>("splash");
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && dataLoaded) {
      setScreen("auth");
      setProfile(null);
      setProgress(null);
      setGameState(null);
      setSettings(null);
      setBadges([]);
      setDataLoaded(false);
    }
  }, [user, authLoading, dataLoaded]);

  useEffect(() => {
    if (authLoading) return;

    const loadData = async () => {
      if (user) {
        const cloudData = await loadUserData(user.uid);
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
  }, [user, authLoading]);

  const handleSplashComplete = useCallback(() => {
    if (authLoading) return;
    if (!user) {
      setScreen("auth");
    } else if (!dataLoaded) {
      return;
    } else if (!profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [authLoading, user, dataLoaded, profile]);

  const handleAuthSuccess = useCallback(() => {
    if (!isOnboardingComplete() && !profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [profile]);


  const handleOnboardingComplete = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    if (user) {
      const data: FirestoreUserData = {
        profile: newProfile,
        gameState: loadGameState(),
        settings: loadSettings(),
        badges: loadBadges(),
        progress: loadProgress(),
        onboardingComplete: true,
      };
      saveUserData(user.uid, data);
    }
    setScreen("home");
  }, [user]);

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

      if (user) {
        firestoreSync.saveBadges(user.uid, allBadges);
      }
    }

    if (user) {
      firestoreSync.saveProgress(user.uid, updatedProgress);
      firestoreSync.saveGameState(user.uid, updatedGameState);
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
        <AuthScreen onSuccess={handleAuthSuccess} />
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
          onSettingsChange={handleSettingsChange}
          onBack={() => setScreen("home")}
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  if (screen === "terms") {
    return (
      <div className={`app-shell app-shell--${ageGroup}`}>
        <TermsPage onBack={() => setScreen("settings")} />
      </div>
    );
  }

  if (screen === "privacy") {
    return (
      <div className={`app-shell app-shell--${ageGroup}`}>
        <PrivacyPage onBack={() => setScreen("settings")} />
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
