"use client";

import { AppSettings, saveSettings } from "@/lib/user-store";

interface SettingsPageProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onBack: () => void;
}

export default function SettingsPage({ settings, onSettingsChange, onBack }: SettingsPageProps) {
  const update = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    saveSettings(updated);
    onSettingsChange(updated);
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <button onClick={onBack} className="settings-page__back">
          <img src="/assets/icons/icon-arrow-left.png" alt="Back" className="settings-page__back-icon" />
        </button>
        <h2 className="settings-page__title">Settings</h2>
      </div>

      {/* Sound */}
      <section className="settings-page__section">
        <h3 className="settings-page__section-title">Audio</h3>
        <div className="settings-page__row">
          <div className="settings-page__row-info">
            <img src="/assets/icons/icon-sound-on.png" alt="Sound" className="settings-page__row-icon" />
            <span>Sound Effects</span>
          </div>
          <button
            onClick={() => update({ soundEnabled: !settings.soundEnabled })}
            className={`settings-page__toggle ${settings.soundEnabled ? "settings-page__toggle--on" : ""}`}
          >
            <div className="settings-page__toggle-knob" />
          </button>
        </div>
        <div className="settings-page__row">
          <div className="settings-page__row-info">
            <img src="/assets/icons/icon-music.png" alt="Music" className="settings-page__row-icon" />
            <span>Background Music</span>
          </div>
          <button
            onClick={() => update({ musicEnabled: !settings.musicEnabled })}
            className={`settings-page__toggle ${settings.musicEnabled ? "settings-page__toggle--on" : ""}`}
          >
            <div className="settings-page__toggle-knob" />
          </button>
        </div>
      </section>

      {/* Display */}
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
          {(["default", "ocean", "forest", "space", "candy"] as const).map((theme) => (
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

      {/* Input */}
      <section className="settings-page__section">
        <h3 className="settings-page__section-title">Input Mode</h3>
        <div className="settings-page__input-options">
          {(["numpad", "keyboard", "buttons"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => update({ inputMode: mode })}
              className={`settings-page__input-btn ${settings.inputMode === mode ? "settings-page__input-btn--active" : ""}`}
            >
              {mode === "numpad" ? "Number Pad" : mode === "keyboard" ? "Keyboard" : "Tap Buttons"}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-page__section">
        <h3 className="settings-page__section-title">Reminders</h3>
        <div className="settings-page__row">
          <div className="settings-page__row-info">
            <img src="/assets/icons/icon-calendar.png" alt="Remind" className="settings-page__row-icon" />
            <span>Daily Reminder</span>
          </div>
          <button
            onClick={() => update({ notificationsEnabled: !settings.notificationsEnabled })}
            className={`settings-page__toggle ${settings.notificationsEnabled ? "settings-page__toggle--on" : ""}`}
          >
            <div className="settings-page__toggle-knob" />
          </button>
        </div>
      </section>
    </div>
  );
}
