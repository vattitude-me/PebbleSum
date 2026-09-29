"use client";

import { useState } from "react";
import { UserProfile, saveProfile, setOnboardingComplete } from "@/lib/user-store";
import { PLACEMENTS, getStageById } from "@/lib/stages";

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

const AVATARS = [
  { id: "pebble-wave", icon: "icon-pebble-wave.webp", label: "Pebble" },
  { id: "pebble-celebrate-left", icon: "icon-pebble-celebrate-left.webp", label: "Happy Pebble" },
  { id: "pebble-thinking", icon: "icon-pebble-thinking.webp", label: "Smart Pebble" },
];

const THEMES = [
  { id: "default", label: "Purple", color: "#6c5ce7" },
  { id: "ocean", label: "Ocean", color: "#0984e3" },
  { id: "forest", label: "Forest", color: "#00b894" },
  { id: "space", label: "Space", color: "#a29bfe" },
  { id: "candy", label: "Candy", color: "#e84393" },
];

const DAILY_GOALS = [
  { minutes: 5, label: "5 min", description: "Quick daily practice" },
  { minutes: 10, label: "10 min", description: "Steady learner" },
  { minutes: 15, label: "15 min", description: "Math champion" },
  { minutes: 20, label: "20 min", description: "Super scholar" },
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [placementId, setPlacementId] = useState("adding");
  const [avatarId, setAvatarId] = useState("pebble-wave");
  const [themeId, setThemeId] = useState("default");
  const [dailyGoal, setDailyGoal] = useState(10);

  const totalSteps = 4;

  const handleFinish = () => {
    const placement = PLACEMENTS.find((p) => p.id === placementId) ?? PLACEMENTS[1];
    const startStage = getStageById(placement.startStageId);
    // Approximate age from the start of the stage's typical age range, e.g. "7–8" → 7.
    const approxAge = parseInt(startStage?.ages ?? "8", 10) || 8;
    const profile: UserProfile = {
      name: name || "Learner",
      age: approxAge,
      ageGroup: placement.ageGroup,
      startStageId: placement.startStageId,
      avatarId,
      themeId,
      dailyGoalMinutes: dailyGoal,
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    setOnboardingComplete();
    onComplete(profile);
  };

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="onboarding">
      <div className="onboarding__container">
      <div className="onboarding__progress">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`onboarding__dot ${i <= step ? "onboarding__dot--active" : ""}`} />
        ))}
      </div>

      <div className="onboarding__card animate-pop-in" key={step}>
        {step === 0 && (
          <div className="onboarding__step">
            <img src="/assets/icons/icon-pencil.webp" alt="Write your name" className="onboarding__mascot" />
            <h2 className="onboarding__title">What&apos;s your name?</h2>
            <p className="onboarding__subtitle">Let&apos;s get to know each other!</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="onboarding__input"
              autoFocus
              maxLength={20}
            />
          </div>
        )}

        {step === 1 && (
          <div className="onboarding__step">
            <h2 className="onboarding__title">What can you already do?</h2>
            <p className="onboarding__subtitle">We&apos;ll start you in the right place. You can always go back.</p>
            <div className="onboarding__skill-grid onboarding__skill-grid--placement">
              {PLACEMENTS.map((placement) => (
                <button
                  key={placement.id}
                  onClick={() => setPlacementId(placement.id)}
                  className={`onboarding__skill-btn ${placementId === placement.id ? "onboarding__skill-btn--selected" : ""}`}
                  aria-pressed={placementId === placement.id}
                >
                  <span className="onboarding__skill-icon">{placement.icon}</span>
                  <span className="onboarding__skill-title">{placement.title}</span>
                  <span className="onboarding__skill-desc">{placement.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding__step">
            <h2 className="onboarding__title">Choose your buddy</h2>
            <p className="onboarding__subtitle">Pick a friend and a color!</p>
            <div className="onboarding__avatar-grid">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setAvatarId(av.id)}
                  className={`onboarding__avatar-btn ${avatarId === av.id ? "onboarding__avatar-btn--selected" : ""}`}
                >
                  <img src={`/assets/icons/${av.icon}`} alt={av.label} className="onboarding__avatar-img" />
                  <span className="onboarding__avatar-label">{av.label}</span>
                </button>
              ))}
            </div>
            <div className="onboarding__theme-row">
              <p className="onboarding__theme-label">Your color</p>
              <div className="onboarding__theme-swatches">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`onboarding__theme-swatch ${themeId === t.id ? "onboarding__theme-swatch--selected" : ""}`}
                    style={{ backgroundColor: t.color }}
                    title={t.label}
                    aria-label={t.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding__step">
            <img src="/assets/icons/icon-pebble-celebrate-left.webp" alt="Let's go!" className="onboarding__mascot" />
            <h2 className="onboarding__title">Daily goal</h2>
            <p className="onboarding__subtitle">How much will you practice each day?</p>
            <div className="onboarding__goal-grid">
              {DAILY_GOALS.map((g) => (
                <button
                  key={g.minutes}
                  onClick={() => setDailyGoal(g.minutes)}
                  className={`onboarding__goal-btn ${dailyGoal === g.minutes ? "onboarding__goal-btn--selected" : ""}`}
                >
                  <span className="onboarding__goal-time">{g.label}</span>
                  <span className="onboarding__goal-desc">{g.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="onboarding__actions">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="onboarding__btn-back">
            <img src="/assets/icons/icon-arrow-left.webp" alt="Back" className="onboarding__btn-icon" />
          </button>
        )}
        <button
          onClick={() => {
            if (step < totalSteps - 1) setStep((s) => s + 1);
            else handleFinish();
          }}
          disabled={!canNext()}
          className="onboarding__btn-next"
        >
          {step === totalSteps - 1 ? "Let's Go!" : "Next"}
          {step < totalSteps - 1 && (
            <img src="/assets/icons/icon-arrow-right.webp" alt="Next" className="onboarding__btn-icon" />
          )}
        </button>
      </div>
      </div>
    </div>
  );
}
