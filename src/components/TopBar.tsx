"use client";

import Logo from "@/components/Logo";

interface TopBarProps {
  onSettingsClick: () => void;
}

export default function TopBar({ onSettingsClick }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <Logo size="lg" />
      </div>
      <button onClick={onSettingsClick} className="top-bar__settings" aria-label="Settings">
        <img src="/assets/icons/icon-gear.png" alt="" className="top-bar__settings-icon" />
      </button>
    </header>
  );
}
