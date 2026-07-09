import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { encryptData, decryptData } from "./crypto";
import { UserProfile, GameState, AppSettings, EarnedBadge } from "./user-store";
import { UserProgress } from "./progress-store";

export interface FirestoreUserData {
  profile: UserProfile | null;
  gameState: GameState;
  settings: AppSettings;
  badges: EarnedBadge[];
  progress: UserProgress;
  onboardingComplete: boolean;
}

interface PiiFields {
  name: string;
  age: number;
  parentPin?: string;
}

interface StoredDocument {
  version: number;
  pii: string;
  profile: Omit<UserProfile, "name" | "age" | "parentPin"> | null;
  gameState: GameState;
  settings: AppSettings;
  badges: EarnedBadge[];
  progress: UserProgress;
  onboardingComplete: boolean;
}

interface LegacyEncryptedDocument {
  payload: string;
  version: number;
}

const STORAGE_VERSION = 2;

function splitProfile(profile: UserProfile | null): { pii: PiiFields | null; rest: Omit<UserProfile, "name" | "age" | "parentPin"> | null } {
  if (!profile) return { pii: null, rest: null };
  const { name, age, parentPin, ...rest } = profile;
  return { pii: { name, age, parentPin }, rest };
}

function mergeProfile(rest: Omit<UserProfile, "name" | "age" | "parentPin"> | null, pii: PiiFields | null): UserProfile | null {
  if (!rest || !pii) return null;
  return { ...rest, name: pii.name, age: pii.age, parentPin: pii.parentPin };
}

export async function loadUserData(uid: string): Promise<FirestoreUserData | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
  if (!snap.exists()) return null;

  const stored = snap.data() as StoredDocument | LegacyEncryptedDocument;

  // V1 legacy: entire document encrypted
  if ("payload" in stored && stored.version === 1) {
    const legacy = await decryptData<FirestoreUserData>(uid, stored.payload);
    // Migrate to v2 on next save
    return legacy;
  }

  // V2: only PII encrypted
  if (stored.version === STORAGE_VERSION) {
    const doc2 = stored as StoredDocument;
    const pii = doc2.pii ? await decryptData<PiiFields>(uid, doc2.pii) : null;
    const profile = mergeProfile(doc2.profile, pii);
    return {
      profile,
      gameState: doc2.gameState,
      settings: doc2.settings,
      badges: doc2.badges,
      progress: doc2.progress,
      onboardingComplete: doc2.onboardingComplete,
    };
  }

  return null;
}

async function buildStoredDocument(uid: string, data: FirestoreUserData): Promise<StoredDocument> {
  const { pii, rest } = splitProfile(data.profile);
  const encryptedPii = pii ? await encryptData(uid, pii) : "";
  return {
    version: STORAGE_VERSION,
    pii: encryptedPii,
    profile: rest,
    gameState: data.gameState,
    settings: data.settings,
    badges: data.badges,
    progress: data.progress,
    onboardingComplete: data.onboardingComplete,
  };
}

export async function saveUserData(uid: string, data: FirestoreUserData): Promise<void> {
  const stored = await buildStoredDocument(uid, data);
  await setDoc(doc(getFirebaseDb(), "users", uid), stored);
}

async function writePartial(uid: string, partial: Partial<FirestoreUserData>): Promise<void> {
  const existing = await loadUserData(uid);
  const merged = { ...existing, ...partial } as FirestoreUserData;
  await saveUserData(uid, merged);
}

export async function saveProgressAndGameState(
  uid: string,
  progress: UserProgress,
  gameState: GameState
): Promise<void> {
  await writePartial(uid, { progress, gameState });
}

export async function saveProfile(uid: string, profile: UserProfile): Promise<void> {
  await writePartial(uid, { profile });
}

export async function saveGameState(uid: string, gameState: GameState): Promise<void> {
  await writePartial(uid, { gameState });
}

export async function saveSettings(uid: string, settings: AppSettings): Promise<void> {
  await writePartial(uid, { settings });
}

export async function saveBadges(uid: string, badges: EarnedBadge[]): Promise<void> {
  await writePartial(uid, { badges });
}

export async function saveProgress(uid: string, progress: UserProgress): Promise<void> {
  await writePartial(uid, { progress });
}

export async function saveOnboardingComplete(uid: string): Promise<void> {
  await writePartial(uid, { onboardingComplete: true });
}
