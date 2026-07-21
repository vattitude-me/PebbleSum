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
          <h1 className="welcome-screen__title">PebbleSum</h1>
          <p className="welcome-screen__tagline">Fun math practice for kids</p>
        </div>

        <div className="welcome-screen__features">
          <div className="welcome-screen__feature">
            <span className="welcome-screen__feature-icon">🎯</span>
            <span>Daily challenges that grow with you</span>
          </div>
          <div className="welcome-screen__feature">
            <span className="welcome-screen__feature-icon">🏆</span>
            <span>Earn badges and rewards</span>
          </div>
          <div className="welcome-screen__feature">
            <span className="welcome-screen__feature-icon">🔥</span>
            <span>Build a daily learning streak</span>
          </div>
        </div>

        <div className="welcome-screen__actions">
          <button onClick={onGetStarted} className="welcome-screen__btn-primary">
            Get Started
          </button>
          <button onClick={onSignIn} className="welcome-screen__btn-secondary">
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
