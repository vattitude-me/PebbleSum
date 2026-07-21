"use client";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <div className="welcome-screen__container">
        <div className="welcome-screen__hero">
          <img
            src="/assets/icons/icon-pebble-wave.webp"
            alt="PebbleSum mascot"
            className="welcome-screen__mascot"
          />
          <h1 className="welcome-screen__title">
            <span className="welcome-screen__title-pebble">Pebble</span>
            <span className="welcome-screen__title-sum">Sum</span>
          </h1>
          <p className="welcome-screen__tagline">Fun math practice for kids</p>
        </div>

        <div className="welcome-screen__features">
          <div className="welcome-screen__feature">
            <span className="welcome-screen__feature-icon">🎯</span>
            <span className="welcome-screen__feature-text">Daily challenges</span>
          </div>
          <div className="welcome-screen__feature">
            <span className="welcome-screen__feature-icon">🏆</span>
            <span className="welcome-screen__feature-text">Earn badges</span>
          </div>
          <div className="welcome-screen__feature">
            <span className="welcome-screen__feature-icon">🔥</span>
            <span className="welcome-screen__feature-text">Build streaks</span>
          </div>
        </div>

        <div className="welcome-screen__actions">
          <button
            onClick={onGetStarted}
            className="welcome-screen__btn-primary"
          >
            Get Started
          </button>
          <button
            onClick={onSignIn}
            className="welcome-screen__btn-secondary"
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
