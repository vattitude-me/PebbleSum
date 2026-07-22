"use client";

import { useEffect, useState, useCallback } from "react";
import { STAGES, getStartingStageForAge, getStartingStageForSkill } from "@/lib/stages";
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
  setOnboardingComplete,
  saveProfile,
  checkNewBadges,
  resetDailyGameState,
  AgeGroup,
} from "@/lib/user-store";
import { useAuth } from "@/lib/auth-context";
import { loadUserData, saveUserData, FirestoreUserData } from "@/lib/firestore-sync";
import * as firestoreSync from "@/lib/firestore-sync";
import SplashScreen from "@/components/SplashScreen";
import WelcomeScreen from "@/components/WelcomeScreen";
import OnboardingFlow from "@/components/OnboardingFlow";
import AuthScreen from "@/components/AuthScreen";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import HomeDashboard from "@/components/HomeDashboard";
import PracticeView, { PracticeMode } from "@/components/PracticeView";
import NumberLearningView from "@/components/NumberLearningView";
import JourneyMap from "@/components/JourneyMap";
import RewardsPage from "@/components/RewardsPage";
import ProfilePage from "@/components/ProfilePage";
import TermsPage from "@/components/TermsPage";
import PrivacyPage from "@/components/PrivacyPage";
import ExitConfirmModal from "@/components/ExitConfirmModal";

type AppScreen = "splash" | "welcome" | "auth" | "onboarding" | "home" | "practice" | "journey" | "rewards" | "profile" | "parent" | "terms" | "privacy";

export default function Home() {
  const { user, loading: authLoading, isGuest, skipLogin } = useAuth();
  const [screen, setScreen] = useState<AppScreen>("splash");
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("practice");
  const [practiceStageId, setPracticeStageId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [firstTimeFlow, setFirstTimeFlow] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && !isGuest && dataLoaded) {
      setScreen("welcome");
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
          const resetGameState = resetDailyGameState(cloudData.gameState);
          setGameState(resetGameState);
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
          saveGameStateLocal(resetGameState);
          saveSettingsLocal(cloudData.settings);
          saveBadges(cloudData.badges);
          if (cloudData.profile) {
            saveProfile(cloudData.profile);
          }
          if (cloudData.onboardingComplete) {
            setOnboardingComplete();
          }

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
      const resetGameState = resetDailyGameState(loadGameState());
      setGameState(resetGameState);
      saveGameStateLocal(resetGameState);
      setSettings(loadSettings());
      setBadges(loadBadges());
      setDataLoaded(true);
    };

    loadData();
  }, [user, authLoading, isGuest]);

  useEffect(() => {
    if (dataLoaded && (user || isGuest) && (screen === "auth" || screen === "welcome")) {
      if (!isOnboardingComplete() && !profile) {
        setScreen("onboarding");
      } else {
        setScreen("home");
      }
    }
  }, [dataLoaded, user, isGuest, screen, profile]);

  const handleSplashComplete = useCallback(() => {
    if (authLoading) return;
    if (!user && !isGuest) {
      setScreen("welcome");
    } else if (!dataLoaded) {
      return;
    } else if (!profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [authLoading, user, isGuest, dataLoaded, profile]);

  const handleAuthSuccess = useCallback(() => {
    if (dataLoaded) {
      if (!isOnboardingComplete() && !profile) {
        setScreen("onboarding");
      } else {
        setScreen("home");
      }
    }
  }, [profile, dataLoaded]);

  const handleGuestStart = useCallback(() => {
    if (!isOnboardingComplete() && !profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [profile]);

  const handleGetStarted = useCallback(() => {
    skipLogin();
    setFirstTimeFlow(true);
    setScreen("onboarding");
  }, [skipLogin]);

  const handleGoToSignIn = useCallback(() => {
    setScreen("auth");
  }, []);


  const handleOnboardingComplete = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    const startingStage = getStartingStageForSkill(newProfile.ageGroup);
    const baseProgress = progress || loadProgress();
    const updatedProgress = { ...baseProgress, currentStageId: startingStage };
    saveProgress(updatedProgress);
    setProgress(updatedProgress);

    const currentGameState = gameState || loadGameState();
    const updatedSettings = { ...(settings || loadSettings()), theme: newProfile.themeId as "default" | "ocean" | "forest" | "space" | "candy" };
    saveSettingsLocal(updatedSettings);
    setSettings(updatedSettings);
    const currentBadges = badges.length > 0 ? badges : loadBadges();

    if (user) {
      const data: FirestoreUserData = {
        profile: newProfile,
        gameState: currentGameState,
        settings: updatedSettings,
        badges: currentBadges,
        progress: updatedProgress,
        onboardingComplete: true,
      };
      await saveUserData(user.uid, data);
    }

    if (firstTimeFlow) {
      setFirstTimeFlow(false);
      setPracticeMode("practice");
      setPracticeStageId(startingStage);
      setScreen("practice");
    } else {
      setScreen("home");
    }
  }, [user, progress, gameState, settings, badges, firstTimeFlow]);

  const handleNavigate = useCallback((page: string) => {
    setScreen(page as AppScreen);
  }, []);

  const handleStartPractice = useCallback((mode: PracticeMode = "practice", stageId?: string) => {
    setPracticeMode(mode);
    setPracticeStageId(stageId || null);
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

  const handleSkipStage = useCallback(async (stageId: string) => {
    if (!progress) return;
    const nextStage = STAGES[STAGES.findIndex((s) => s.id === stageId) + 1];
    if (!nextStage) return;
    const updatedProgress = { ...progress, currentStageId: nextStage.id };
    saveProgress(updatedProgress);
    setProgress(updatedProgress);
    if (user) {
      await firestoreSync.saveProgress(user.uid, updatedProgress);
    }
  }, [progress, user]);

  const handleSettingsChange = useCallback((updated: AppSettings) => {
    setSettings(updated);
    if (user) {
      firestoreSync.saveSettings(user.uid, updated);
    }
  }, [user]);

  const handleProfileChange = useCallback((updated: UserProfile) => {
    setProfile(updated);
    if (user) {
      const currentGameState = gameState || loadGameState();
      const currentSettings = settings || loadSettings();
      const currentBadges = badges.length > 0 ? badges : loadBadges();
      const currentProgress = progress || loadProgress();
      const data: FirestoreUserData = {
        profile: updated,
        gameState: currentGameState,
        settings: currentSettings,
        badges: currentBadges,
        progress: currentProgress,
        onboardingComplete: true,
      };
      saveUserData(user.uid, data);
    }
  }, [user, gameState, settings, badges, progress]);

  if (screen === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (screen === "welcome") {
    return (
      <div className="app-shell app-shell--middle">
        <WelcomeScreen onGetStarted={handleGetStarted} onSignIn={handleGoToSignIn} />
      </div>
    );
  }

  if (screen === "auth") {
    return (
      <div className={`app-shell app-shell--${profile?.ageGroup || "middle"}`}>
        <AuthScreen onSuccess={handleAuthSuccess} onSkip={() => setScreen("welcome")} />
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
    const selectedStageId = practiceStageId || progress.currentStageId;
    const practiceStage = STAGES.find((s) => s.id === selectedStageId)!;
    const isReplay = selectedStageId !== progress.currentStageId;

    if (selectedStageId === "6A") {
      return (
        <div className={shellClasses}>
          <NumberLearningView
            stage={practiceStage}
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

    return (
      <div className={shellClasses}>
        <PracticeView
          stage={practiceStage}
          mode={isReplay ? "practice" : practiceMode}
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
  const exitGuardActive = ["home", "journey", "rewards", "profile"].includes(screen);

  return (
    <div className={shellClasses}>
      <ExitConfirmModal enabled={exitGuardActive} />
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
              handleStartPractice("practice", stageId);
            }}
            onSkipStage={handleSkipStage}
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
            onProfileChange={handleProfileChange}
            onNavigate={handleNavigate}
            onDevJumpToStage={(stageId) => {
              const updated = { ...progress, currentStageId: stageId };
              setProgress(updated);
            }}
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
