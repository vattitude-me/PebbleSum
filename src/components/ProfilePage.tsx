"use client";

import { useState } from "react";
import { UserProfile, GameState, AppSettings, saveSettings } from "@/lib/user-store";
import { UserProgress } from "@/lib/progress-store";

import { useAuth } from "@/lib/auth-context";

interface ProfilePageProps {
  profile: UserProfile;
  progress: UserProgress;
  gameState: GameState;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onNavigate: (page: string) => void;
}

const AVATAR_ICON_MAP: Record<string, string> = {
  "pebble-celebrate": "icon-pebble-celebrate-left.png",
};

function getAvatarSrc(avatarId: string) {
  return `/assets/icons/${AVATAR_ICON_MAP[avatarId] || `icon-${avatarId}.png`}`;
}

export default function ProfilePage({ profile, progress, gameState, settings, onSettingsChange, onNavigate }: ProfilePageProps) {
  const { user, username, signOut, deleteAccount } = useAuth();
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const level = Math.floor(progress.xp / 500) + 1;
  const xpInLevel = progress.xp % 500;
  const accuracy = gameState.totalQuestionsAnswered > 0
    ? Math.round((gameState.totalCorrectAnswers / gameState.totalQuestionsAnswered) * 100)
    : 0;

  const update = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    saveSettings(updated);
    onSettingsChange(updated);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") {
      setDeleteError("Please type \"delete\" to confirm.");
      return;
    }
    if (!deletePassword) {
      setDeleteError("Please enter your password.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteAccount(deletePassword);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete account.";
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setDeleteError("Incorrect password.");
      } else {
        setDeleteError(msg);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <section className="profile-page__header">
        <div className="profile-page__avatar">
          <img src={getAvatarSrc(profile.avatarId)} alt="Avatar" className="profile-page__avatar-img" />
        </div>
        <h2 className="profile-page__name">{profile.name}</h2>
        {user && <p className="profile-page__username">@{username}</p>}
        <p className="profile-page__title">Level {level} Learner</p>
        <div className="profile-page__xp-bar">
          <div className="profile-page__xp-fill" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
        </div>
        <span className="profile-page__xp-text">{xpInLevel}/500 XP to Level {level + 1}</span>
      </section>

      {/* Quick Stats — only current streak + accuracy */}
      <section className="profile-page__stats">
        <div className="profile-page__stat">
          <img src="/assets/icons/icon-fire.png" alt="Streak" className="profile-page__stat-icon" />
          <span className="profile-page__stat-value">{progress.streak}</span>
          <span className="profile-page__stat-label">Streak</span>
        </div>
        <div className="profile-page__stat">
          <img src="/assets/icons/icon-checkmark.png" alt="Accuracy" className="profile-page__stat-icon" />
          <span className="profile-page__stat-value">{accuracy}%</span>
          <span className="profile-page__stat-label">Accuracy</span>
        </div>
      </section>

      {/* Display Settings */}
      <section className="settings-page__section">
        <h3 className="settings-page__section-title">Display</h3>
        <div className="settings-page__row">
          <div className="settings-page__row-info">
            <img src="/assets/icons/icon-edit.png" alt="Text" className="settings-page__row-icon" />
            <span>Text Size</span>
          </div>
          <div className="settings-page__segmented">
            {(["normal", "large", "extra-large"] as const).map((size) => (
              <button
                key={size}
                onClick={() => update({ textSize: size })}
                className={`settings-page__seg-btn ${settings.textSize === size ? "settings-page__seg-btn--active" : ""}`}
              >
                {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="settings-page__section">
        <h3 className="settings-page__section-title">Theme</h3>
        <div className="settings-page__theme-grid">
          {(["default", "ocean", "forest", "candy"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => update({ theme })}
              className={`settings-page__theme-btn settings-page__theme-btn--${theme} ${settings.theme === theme ? "settings-page__theme-btn--active" : ""}`}
            >
              <span className="settings-page__theme-name">{theme}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="settings-page__section">
        <button
          onClick={() => setComingSoonOpen(!comingSoonOpen)}
          className="settings-page__accordion-header"
        >
          <h3 className="settings-page__section-title settings-page__section-title--inline">Coming Soon</h3>
          <span className={`settings-page__accordion-arrow ${comingSoonOpen ? "settings-page__accordion-arrow--open" : ""}`}>
            &#9662;
          </span>
        </button>
        {comingSoonOpen && (
          <div className="settings-page__coming-soon">
            <div className="settings-page__coming-soon-item">
              <span>🔔</span><span>Push Notifications & Reminders</span>
            </div>
            <div className="settings-page__coming-soon-item">
              <span>🎵</span><span>Sound Effects & Music</span>
            </div>
            <div className="settings-page__coming-soon-item">
              <span>⌨️</span><span>Multiple Input Modes</span>
            </div>
            <div className="settings-page__coming-soon-item">
              <span>🔐</span><span>SMS Multi-Factor Authentication</span>
            </div>
            <div className="settings-page__coming-soon-item">
              <span>👨‍👩‍👧</span><span>Parent / Guardian Dashboard</span>
            </div>
          </div>
        )}
      </section>

      {/* Legal */}
      <section className="settings-page__section">
        <h3 className="settings-page__section-title">Legal</h3>
        <button onClick={() => onNavigate("terms")} className="settings-page__nav-row">
          <span>Terms of Service</span>
          <img src="/assets/icons/icon-arrow-right.png" alt="Go" className="settings-page__nav-arrow" />
        </button>
        <button onClick={() => onNavigate("privacy")} className="settings-page__nav-row">
          <span>Privacy Policy</span>
          <img src="/assets/icons/icon-arrow-right.png" alt="Go" className="settings-page__nav-arrow" />
        </button>
      </section>

      {/* Account */}
      {user && (
        <section className="settings-page__section">
          <h3 className="settings-page__section-title">Account</h3>
          <button onClick={handleSignOut} className="settings-page__btn settings-page__btn--secondary">
            Sign Out
          </button>
        </section>
      )}

      {/* Danger Zone */}
      {user && (
        <section className="settings-page__section settings-page__section--danger">
          <h3 className="settings-page__section-title settings-page__section-title--danger">Danger Zone</h3>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="settings-page__btn settings-page__btn--danger"
            >
              Delete Account
            </button>
          ) : (
            <div className="settings-page__delete-confirm">
              <p className="settings-page__delete-warning">
                This will permanently delete your account and all your data. This action cannot be undone.
              </p>
              <p className="settings-page__delete-instruction">
                Type <strong>delete</strong> below to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='Type "delete" to confirm'
                className="settings-page__delete-input"
                autoComplete="off"
              />
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="settings-page__delete-input"
              />
              {deleteError && <p className="settings-page__delete-error">{deleteError}</p>}
              <div className="settings-page__delete-actions">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeletePassword(""); setDeleteError(""); }}
                  className="settings-page__btn settings-page__btn--secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmText.toLowerCase() !== "delete"}
                  className="settings-page__btn settings-page__btn--danger"
                >
                  {deleteLoading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="profile-page__footer">
        <a href="https://vattitude.ca" target="_blank" rel="noopener noreferrer" className="profile-page__footer-link">
          vattitude.ca
        </a>
        <p className="profile-page__copyright">&copy; 2025 Vattitude Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
