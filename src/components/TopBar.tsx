"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import IOSInstallModal from "@/components/IOSInstallModal";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function TopBar() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSModalOpen, setIsIOSModalOpen] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      return window.matchMedia("(display-mode: standalone)").matches || 
             (window.navigator as any).standalone === true;
    };

    if (checkStandalone()) {
      setIsInstalled(true);
      return;
    }

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(isIOSDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setIsIOSModalOpen(true);
      return;
    }

    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const showInstallButton = !isInstalled && (installPrompt || isIOS);

  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <Logo size="lg" />
      </div>
      {showInstallButton && (
        <button onClick={handleInstall} className="top-bar__install" aria-label="Install app">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Install</span>
        </button>
      )}
      <IOSInstallModal isOpen={isIOSModalOpen} onClose={() => setIsIOSModalOpen(false)} />
    </header>
  );
}

