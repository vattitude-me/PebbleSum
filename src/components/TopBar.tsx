"use client";

import Logo from "@/components/Logo";

interface TopBarProps {
  coins: number;
  streak: number;
  hearts: number;
  xp: number;
  level: number;
  onSettingsClick: () => void;
}

export default function TopBar({ coins, streak, hearts, xp, level, onSettingsClick }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <Logo size="sm" />
      </div>
      <div className="top-bar__stats">
        {streak > 0 && (
          <div className="stat-chip stat-chip--streak">
            <img src="/assets/icons/icon-fire.png" alt="Streak" className="stat-chip__icon" />
            <span>{streak}</span>
          </div>
        )}
        <div className="stat-chip stat-chip--coins">
          <img src="/assets/icons/icon-coin-star.png" alt="Coins" className="stat-chip__icon" />
          <span>{coins}</span>
        </div>
        <div className="stat-chip stat-chip--hearts">
          <img src="/assets/icons/icon-heart.png" alt="Hearts" className="stat-chip__icon" />
          <span>{hearts}</span>
        </div>
        <div className="stat-chip stat-chip--xp">
          <img src="/assets/icons/icon-xp.png" alt="XP" className="stat-chip__icon" />
          <span>Lv.{level}</span>
        </div>
      </div>
      <button onClick={onSettingsClick} className="top-bar__settings">
        <img src="/assets/icons/icon-gear.png" alt="Settings" className="top-bar__settings-icon" />
      </button>
    </header>
  );
}
