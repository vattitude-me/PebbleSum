"use client";

import { useState } from "react";
import { UserProfile, AgeGroup, saveProfile, setOnboardingComplete } from "@/lib/user-store";

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

const AVATARS = [
  { id: "pebble-wave", icon: "icon-pebble-wave.png", label: "Pebble" },
  { id: "pebble-celebrate-left", icon: "icon-pebble-celebrate-left.png", label: "Happy Pebble" },
  { id: "pebble-thinking", icon: "icon-pebble-thinking.png", label: "Smart Pebble" },
];

const DAILY_GOALS = [
  { minutes: 5, label: "5 min", description: "Quick daily practice" },
  { minutes: 10, label: "10 min", description: "Steady learner" },
  { minutes: 15, label: "15 min", description: "Math champion" },
  { minutes: 20, label: "20 min", description: "Super scholar" },
];

const SKILL_LEVELS: { id: AgeGroup; icon: string; title: string; description: string }[] = [
  { id: "young", icon: "🔢", title: "I'm learning numbers", description: "Counting and recognizing numbers" },
  { id: "middle", icon: "➕", title: "I can add and subtract", description: "Simple addition and subtraction" },
  { id: "older", icon: "✖️", title: "I know multiplication", description: "Multiplication and beyond" },
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [skillLevel, setSkillLevel] = useState<AgeGroup>("middle");
  const [avatarId, setAvatarId] = useState("pebble-wave");
  const [dailyGoal, setDailyGoal] = useState(10);

  const totalSteps = 4;

  const handleFinish = () => {
    const ageFromSkill = skillLevel === "young" ? 4 : skillLevel === "middle" ? 8 : 12;
    const profile: UserProfile = {
      name: name || "Learner",
      age: ageFromSkill,
      ageGroup: skillLevel,
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
            <img src="/assets/icons/icon-pebble-thinking.webp" alt="Thinking" className="onboarding__mascot" />
            <h2 className="onboarding__title">What do you know?</h2>
            <p className="onboarding__subtitle">Pick what fits you best!</p>
            <div className="onboarding__skill-grid">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSkillLevel(level.id)}
                  className={`onboarding__skill-btn ${skillLevel === level.id ? "onboarding__skill-btn--selected" : ""}`}
                >
                  <span className="onboarding__skill-icon">{level.icon}</span>
                  <span className="onboarding__skill-title">{level.title}</span>
                  <span className="onboarding__skill-desc">{level.description}</span>
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
