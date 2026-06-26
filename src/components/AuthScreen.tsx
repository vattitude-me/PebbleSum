"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [botChecked, setBotChecked] = useState(false);
  const [botVerifying, setBotVerifying] = useState(false);
  const [botVerified, setBotVerified] = useState(false);
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

    if (!botVerified) {
      setError("Please complete the verification check.");
      return;
    }

    if (!email || !password) {
      setError("Please fill in all fields.");
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
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      if (message.includes("user-not-found") || message.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (message.includes("invalid-email")) {
        setError("Please enter a valid email address.");
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
        <p className="auth-screen__subtitle">
          {mode === "login"
            ? "Sign in to continue your math journey"
            : "Create an account to save progress and learn across devices"}
        </p>

        <form onSubmit={handleSubmit} className="auth-screen__form">
          <div className="auth-screen__field">
            <label className="auth-screen__label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-screen__input"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-screen__field">
            <label className="auth-screen__label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-screen__input"
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "signup" && (
            <div className="auth-screen__field">
              <label className="auth-screen__label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-screen__input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

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

          {error && <p className="auth-screen__error">{error}</p>}

          <button type="submit" className="auth-screen__submit" disabled={loading || !botVerified}>
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
