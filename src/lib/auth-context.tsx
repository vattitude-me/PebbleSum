"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";

const toEmail = (username: string) => `${username.toLowerCase().trim()}@pebblesum.app`;

interface AuthContextType {
  user: User | null;
  username: string | null;
  loading: boolean;
  signIn: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (username: string, password: string, rememberMe = true) => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, toEmail(username), password);
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    await createUserWithEmailAndPassword(getFirebaseAuth(), toEmail(username), password);
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser || !currentUser.email) throw new Error("Not signed in");

    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    await deleteDoc(doc(getFirebaseDb(), "users", currentUser.uid));
    await deleteUser(currentUser);
  }, []);

  const username = user?.email?.replace("@pebblesum.app", "") || null;

  return (
    <AuthContext.Provider value={{ user, username, loading, signIn, signUp, signOut: signOutUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
