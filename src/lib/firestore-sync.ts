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

interface EncryptedDocument {
  payload: string;
  version: number;
}

const ENCRYPTION_VERSION = 1;

export async function loadUserData(uid: string): Promise<FirestoreUserData | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
  if (!snap.exists()) return null;

  const stored = snap.data() as EncryptedDocument | FirestoreUserData;

  if ("payload" in stored && stored.version === ENCRYPTION_VERSION) {
    return decryptData<FirestoreUserData>(uid, stored.payload);
  }

  return stored as FirestoreUserData;
}

async function writeEncrypted(uid: string, data: Partial<FirestoreUserData>): Promise<void> {
  const existing = await loadUserData(uid);
  const merged = { ...existing, ...data } as FirestoreUserData;
  const payload = await encryptData(uid, merged);
  const encrypted: EncryptedDocument = { payload, version: ENCRYPTION_VERSION };
  await setDoc(doc(getFirebaseDb(), "users", uid), encrypted);
}

export async function saveUserData(uid: string, data: FirestoreUserData): Promise<void> {
  const payload = await encryptData(uid, data);
  const encrypted: EncryptedDocument = { payload, version: ENCRYPTION_VERSION };
  await setDoc(doc(getFirebaseDb(), "users", uid), encrypted);
}

export async function saveProfile(uid: string, profile: UserProfile): Promise<void> {
  await writeEncrypted(uid, { profile });
}

export async function saveGameState(uid: string, gameState: GameState): Promise<void> {
  await writeEncrypted(uid, { gameState });
}

export async function saveSettings(uid: string, settings: AppSettings): Promise<void> {
  await writeEncrypted(uid, { settings });
}

export async function saveBadges(uid: string, badges: EarnedBadge[]): Promise<void> {
  await writeEncrypted(uid, { badges });
}

export async function saveProgress(uid: string, progress: UserProgress): Promise<void> {
  await writeEncrypted(uid, { progress });
}

export async function saveOnboardingComplete(uid: string): Promise<void> {
  await writeEncrypted(uid, { onboardingComplete: true });
}
