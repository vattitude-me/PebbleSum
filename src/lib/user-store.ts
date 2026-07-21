export type AgeGroup = "young" | "middle" | "older";

export interface UserProfile {
  name: string;
  age: number;
  ageGroup: AgeGroup;
  avatarId: string;
  themeId: string;
  dailyGoalMinutes: number;
  createdAt: string;
  parentPin?: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "mastery" | "speed" | "milestone" | "consistency";
  requirement: number;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  theme: "default" | "ocean" | "forest" | "space" | "candy";
  textSize: "normal" | "large" | "extra-large";
  inputMode: "keyboard" | "numpad" | "buttons";
  notificationsEnabled: boolean;
  dailyReminderTime: string;
}

export interface GameState {
  coins: number;
  hearts: number;
  maxHearts: number;
  dailyGoalCompleted: boolean;
  todayPracticeSeconds: number;
  practiceDate: string;
  todaySessionCount: number;
  longestStreak: number;
  totalSessionsCompleted: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
  unlockedAvatars: string[];
  unlockedThemes: string[];
}

export interface FullUserState {
  profile: UserProfile | null;
  gameState: GameState;
  settings: AppSettings;
  badges: EarnedBadge[];
  onboardingComplete: boolean;
}

const PROFILE_KEY = "pebblesum_profile";
const GAME_KEY = "pebblesum_game";
const SETTINGS_KEY = "pebblesum_settings";
const BADGES_KEY = "pebblesum_badges";
const ONBOARDING_KEY = "pebblesum_onboarding";

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  musicEnabled: false,
  theme: "default",
  textSize: "normal",
  inputMode: "numpad",
  notificationsEnabled: true,
  dailyReminderTime: "16:00",
};

const DEFAULT_GAME_STATE: GameState = {
  coins: 0,
  hearts: 5,
  maxHearts: 5,
  dailyGoalCompleted: false,
  todayPracticeSeconds: 0,
  practiceDate: "",
  todaySessionCount: 0,
  longestStreak: 0,
  totalSessionsCompleted: 0,
  totalCorrectAnswers: 0,
  totalQuestionsAnswered: 0,
  unlockedAvatars: ["pebble-wave"],
  unlockedThemes: ["default"],
};

export function getAgeGroup(age: number): AgeGroup {
  if (age <= 6) return "young";
  if (age <= 10) return "middle";
  return "older";
}

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function setStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadProfile(): UserProfile | null {
  return getStorage<UserProfile | null>(PROFILE_KEY, null);
}

export function saveProfile(profile: UserProfile): void {
  setStorage(PROFILE_KEY, profile);
}

export function loadGameState(): GameState {
  return getStorage(GAME_KEY, DEFAULT_GAME_STATE);
}

export function saveGameState(state: GameState): void {
  setStorage(GAME_KEY, state);
}

export function loadSettings(): AppSettings {
  return getStorage(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  setStorage(SETTINGS_KEY, settings);
}

export function loadBadges(): EarnedBadge[] {
  return getStorage(BADGES_KEY, []);
}

export function saveBadges(badges: EarnedBadge[]): void {
  setStorage(BADGES_KEY, badges);
}

export function isOnboardingComplete(): boolean {
  return getStorage(ONBOARDING_KEY, false);
}

export function setOnboardingComplete(): void {
  setStorage(ONBOARDING_KEY, true);
}

export function addCoins(amount: number): GameState {
  const state = loadGameState();
  state.coins += amount;
  saveGameState(state);
  return state;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: "first-step", name: "First Step", description: "Complete your first session", icon: "icon-badge-footprint.png", category: "milestone", requirement: 1 },
  { id: "streak-3", name: "Warming Up", description: "3-day streak", icon: "icon-badge-streak.png", category: "streak", requirement: 3 },
  { id: "streak-7", name: "On Fire!", description: "7-day streak", icon: "icon-badge-lightning.png", category: "streak", requirement: 7 },
  { id: "streak-30", name: "Unstoppable", description: "30-day streak", icon: "icon-badge-crown.png", category: "streak", requirement: 30 },
  { id: "speed-demon", name: "Speed Demon", description: "Complete 5 sessions within target time", icon: "icon-badge-target.png", category: "speed", requirement: 5 },
  { id: "perfectionist", name: "Perfectionist", description: "Get 10 perfect scores", icon: "icon-badge-trophy.png", category: "mastery", requirement: 10 },
  { id: "scholar", name: "Scholar", description: "Answer 500 questions correctly", icon: "icon-badge-graduation.png", category: "milestone", requirement: 500 },
  { id: "champion", name: "Champion", description: "Reach Stage C", icon: "icon-badge-champion.png", category: "milestone", requirement: 1 },
  { id: "seedling", name: "Seedling", description: "Complete 7 total sessions", icon: "icon-badge-seedling.png", category: "consistency", requirement: 7 },
];

export function checkNewBadges(
  gameState: GameState,
  streak: number,
  currentStageId: string,
  existingBadges: EarnedBadge[]
): EarnedBadge[] {
  const earned = existingBadges.map((b) => b.badgeId);
  const newBadges: EarnedBadge[] = [];
  const now = new Date().toISOString();

  if (!earned.includes("first-step") && gameState.totalSessionsCompleted >= 1) {
    newBadges.push({ badgeId: "first-step", earnedAt: now });
  }
  if (!earned.includes("streak-3") && streak >= 3) {
    newBadges.push({ badgeId: "streak-3", earnedAt: now });
  }
  if (!earned.includes("streak-7") && streak >= 7) {
    newBadges.push({ badgeId: "streak-7", earnedAt: now });
  }
  if (!earned.includes("streak-30") && streak >= 30) {
    newBadges.push({ badgeId: "streak-30", earnedAt: now });
  }
  if (!earned.includes("scholar") && gameState.totalCorrectAnswers >= 500) {
    newBadges.push({ badgeId: "scholar", earnedAt: now });
  }
  if (!earned.includes("seedling") && gameState.totalSessionsCompleted >= 7) {
    newBadges.push({ badgeId: "seedling", earnedAt: now });
  }
  const advancedStages = ["C", "D", "E", "F"];
  if (!earned.includes("champion") && advancedStages.includes(currentStageId)) {
    newBadges.push({ badgeId: "champion", earnedAt: now });
  }

  return newBadges;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function resetDailyGameState(gameState: GameState): GameState {
  const today = getTodayDate();
  if (gameState.practiceDate === today) {
    return gameState;
  }
  return {
    ...gameState,
    hearts: gameState.maxHearts,
    todayPracticeSeconds: 0,
    dailyGoalCompleted: false,
    todaySessionCount: 0,
    practiceDate: today,
  };
}
