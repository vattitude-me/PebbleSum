"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [botChecked, setBotChecked] = useState(false);
  const [botVerifying, setBotVerifying] = useState(false);
  const [botVerified, setBotVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const mouseMovements = useRef(0);
  const checkStartTime = useRef(0);

  const handleMouseMove = useCallback(() => {
    mouseMovements.current++;
  }, []);

  const handleBotCheck = () => {
    if (botVerified || botVerifying) return;
    setBotChecked(true);
    setBotVerifying(true);
    checkStartTime.current = Date.now();

    setTimeout(() => {
      const elapsed = Date.now() - checkStartTime.current;
      if (mouseMovements.current < 2 && elapsed < 300) {
        setBotVerifying(false);
        setBotChecked(false);
        setError("Verification failed. Please try again.");
      } else {
        setBotVerifying(false);
        setBotVerified(true);
        setError("");
      }
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !botVerified) {
      setError("Please complete the verification check.");
      return;
    }

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3-20 characters (letters, numbers, underscore).");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(username, password, rememberMe);
      } else {
        await signUp(username, password);
      }
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      if (message.includes("user-not-found") || message.includes("invalid-credential")) {
        setError("Invalid username or password.");
      } else if (message.includes("email-already-in-use")) {
        setError("This username is already taken.");
      } else if (message.includes("invalid-email")) {
        setError("Invalid username format.");
      } else if (message.includes("weak-password")) {
        setError("Password must be at least 6 characters.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-screen ${mode === "signup" ? "auth-screen--signup" : ""}`}>
      <div className="auth-screen__container">
        <div className="auth-screen__logo">
          <img src="/assets/icons/icon-pebble-wave.png" alt="PebbleSum" className="auth-screen__logo-img" />
          <h1 className="auth-screen__app-name">PebbleSum</h1>
        </div>

        <h2 className="auth-screen__title">
          {mode === "login" ? "Welcome Back!" : "Join the Adventure!"}
        </h2>
        {mode === "login" && (
          <p className="auth-screen__subtitle">
            Sign in to continue your math journey
          </p>
        )}

        <form onSubmit={handleSubmit} className="auth-screen__form">
          <div className="auth-screen__field">
            <label className="auth-screen__label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-screen__input"
              placeholder="your_username"
              autoComplete="username"
              maxLength={20}
            />
          </div>

          <div className="auth-screen__field">
            <label className="auth-screen__label">Password</label>
            <div className="auth-screen__input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-screen__input auth-screen__input--has-toggle"
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="auth-screen__eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="auth-screen__field">
              <label className="auth-screen__label">Confirm Password</label>
              <div className="auth-screen__input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-screen__input auth-screen__input--has-toggle"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-screen__eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
            </div>
          )}

          {mode === "login" ? (
            <div className="auth-screen__remember-me">
              <label className="auth-screen__remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="auth-screen__remember-checkbox"
                />
                <span className="auth-screen__remember-text">Remember me</span>
              </label>
            </div>
          ) : (
            <div className="auth-screen__bot-check" onMouseMove={handleMouseMove}>
              <div className="auth-screen__bot-left">
                <label className={`auth-screen__bot-label ${botVerified ? "auth-screen__bot-label--verified" : ""}`}>
                  <input
                    type="checkbox"
                    checked={botChecked}
                    onChange={handleBotCheck}
                    disabled={botVerified || botVerifying}
                    className="auth-screen__bot-checkbox"
                  />
                  <span className="auth-screen__bot-box">
                    {botVerifying && <span className="auth-screen__bot-spinner" />}
                    {botVerified && <span className="auth-screen__bot-tick">✓</span>}
                  </span>
                  <span className="auth-screen__bot-text">
                    {botVerifying ? "Verifying..." : botVerified ? "Verified" : "I'm not a robot"}
                  </span>
                </label>
              </div>
              <div className="auth-screen__bot-brand">
                <svg className="auth-screen__bot-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4a3ab5" opacity="0.15"/>
                  <path d="M12 6v6l4 2" stroke="#4a3ab5" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17.65 6.35a8 8 0 1 0 .52 10.95" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M22 12h-4" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 2v4" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="auth-screen__bot-brand-text">PebbleGuard</span>
              </div>
            </div>
          )}

          {error && <p className="auth-screen__error">{error}</p>}

          <button type="submit" className="auth-screen__submit" disabled={loading || (mode === "signup" && !botVerified)}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-screen__switch">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} className="auth-screen__link">
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="auth-screen__link">
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
