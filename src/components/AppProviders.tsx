"use client";

import { ReactNode, useEffect } from "react";
import { AuthProvider } from "@/lib/auth-context";

export default function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed, continue without it
      });
    }
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
