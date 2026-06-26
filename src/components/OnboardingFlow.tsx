"use client";

import { useState } from "react";
import { UserProfile, getAgeGroup, saveProfile, setOnboardingComplete } from "@/lib/user-store";

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

const AVATARS = [
  { id: "pebble-wave", icon: "icon-pebble-wave.png", label: "Pebble" },
  { id: "pebble-celebrate", icon: "icon-pebble-celebrate-left.png", label: "Happy Pebble" },
  { id: "pebble-thinking", icon: "icon-pebble-thinking.png", label: "Smart Pebble" },
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
  const [age, setAge] = useState<number | null>(null);
  const [avatarId, setAvatarId] = useState("pebble-wave");
  const [dailyGoal, setDailyGoal] = useState(10);

  const totalSteps = 4;

  const handleFinish = () => {
    const profile: UserProfile = {
      name: name || "Learner",
      age: age || 7,
      ageGroup: getAgeGroup(age || 7),
      avatarId,
      themeId: "default",
      dailyGoalMinutes: dailyGoal,
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    setOnboardingComplete();
    onComplete(profile);
  };

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return age !== null;
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
            <img src="/assets/icons/icon-pencil.png" alt="Write your name" className="onboarding__mascot" />
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
            <img src="/assets/icons/icon-pebble-thinking.png" alt="Thinking" className="onboarding__mascot" />
            <h2 className="onboarding__title">How old are you?</h2>
            <p className="onboarding__subtitle">This helps us pick the right level</p>
            <div className="onboarding__age-grid">
              {Array.from({ length: 14 }, (_, i) => i + 2).map((a) => (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  className={`onboarding__age-btn ${age === a ? "onboarding__age-btn--selected" : ""}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding__step">
            <h2 className="onboarding__title">Choose your buddy</h2>
            <p className="onboarding__subtitle">Pick a friend to learn with!</p>
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
          </div>
        )}

        {step === 3 && (
          <div className="onboarding__step">
            <img src="/assets/icons/icon-pebble-celebrate-left.png" alt="Let's go!" className="onboarding__mascot" />
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
            <img src="/assets/icons/icon-arrow-left.png" alt="Back" className="onboarding__btn-icon" />
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
            <img src="/assets/icons/icon-arrow-right.png" alt="Next" className="onboarding__btn-icon" />
          )}
        </button>
      </div>
      </div>
    </div>
  );
}
