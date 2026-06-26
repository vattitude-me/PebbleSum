"use client";

import { useState, useEffect, useCallback } from "react";
import { MathProblem, generateProblems } from "@/lib/math-engine";
import { Stage } from "@/lib/stages";
import {
  UserProgress,
  saveProgress,
  calculateXpGain,
  getToday,
  isStreakActive,
  SessionRecord,
} from "@/lib/progress-store";
import { getNextStage } from "@/lib/stages";
import { AgeGroup, GameState, saveGameState, addCoins } from "@/lib/user-store";

interface PracticeViewProps {
  stage: Stage;
  progress: UserProgress;
  gameState: GameState;
  ageGroup: AgeGroup;
  onComplete: (updatedProgress: UserProgress, updatedGameState: GameState) => void;
  onBack: () => void;
}

export default function PracticeView({ stage, progress, gameState, ageGroup, onComplete, onBack }: PracticeViewProps) {
  const [problems] = useState<MathProblem[]>(() =>
    generateProblems(stage.id, stage.questionsPerDay)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [hearts, setHearts] = useState(gameState.hearts);
  const [comboCount, setComboCount] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState("");

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  const encouragements = [
    "Great job! 🌟",
    "You're amazing! ⭐",
    "Keep going! 💪",
    "Fantastic! 🎯",
    "Brilliant! ✨",
    "Superstar! 🌈",
  ];

  const handleSubmit = useCallback(() => {
    if (!userAnswer.trim()) return;

    const problem = problems[currentIndex];
    const isCorrect = parseInt(userAnswer) === problem.answer;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setComboCount((c) => c + 1);
      setFeedback("correct");
      if (comboCount > 0 && comboCount % 3 === 2) {
        setShowEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
      }
    } else {
      setFeedback("wrong");
      setComboCount(0);
      setHearts((h) => Math.max(0, h - 1));
      setShowEncouragement("");
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer("");
      setShowEncouragement("");
      if (currentIndex + 1 >= problems.length || (!isCorrect && hearts <= 1)) {
        finishSession(isCorrect ? correctCount + 1 : correctCount);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 1000);
  }, [userAnswer, currentIndex, problems, correctCount, hearts, comboCount]);

  const handleNumpad = (digit: string) => {
    if (feedback !== null) return;
    if (digit === "del") {
      setUserAnswer((a) => a.slice(0, -1));
    } else if (digit === "go") {
      handleSubmit();
    } else {
      setUserAnswer((a) => a + digit);
    }
  };

  const finishSession = (finalCorrect: number) => {
    setIsFinished(true);
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const perfect = finalCorrect === problems.length;
    const withinSCT = timeSeconds <= stage.sctSeconds;
    const xpGain = calculateXpGain(finalCorrect, problems.length, withinSCT);
    const coinsGained = Math.floor(xpGain / 5) + (perfect ? 10 : 0);

    const today = getToday();
    const streakActive = isStreakActive(progress.lastPracticeDate);
    const newStreak = streakActive ? progress.streak + (progress.lastPracticeDate === today ? 0 : 1) : 1;

    let consecutivePerfect = progress.consecutivePerfectDays;
    if (perfect && withinSCT) {
      consecutivePerfect += 1;
    } else {
      consecutivePerfect = 0;
    }

    const nextStage = getNextStage(stage.id);
    const shouldLevelUp = consecutivePerfect >= stage.unlockRequirement && nextStage;

    const session: SessionRecord = {
      date: today,
      stageId: stage.id,
      correct: finalCorrect,
      total: problems.length,
      timeSeconds,
      perfect,
      withinSCT,
    };

    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + xpGain,
      streak: newStreak,
      lastPracticeDate: today,
      consecutivePerfectDays: consecutivePerfect,
      currentStageId: shouldLevelUp ? nextStage!.id : progress.currentStageId,
      completedSessions: [...progress.completedSessions, session],
    };

    const updatedGameState: GameState = {
      ...gameState,
      coins: gameState.coins + coinsGained,
      hearts,
      dailyGoalCompleted: true,
      todaySessionCount: gameState.todaySessionCount + 1,
      longestStreak: Math.max(gameState.longestStreak, newStreak),
      totalSessionsCompleted: gameState.totalSessionsCompleted + 1,
      totalCorrectAnswers: gameState.totalCorrectAnswers + finalCorrect,
      totalQuestionsAnswered: gameState.totalQuestionsAnswered + problems.length,
    };

    saveProgress(updatedProgress);
    saveGameState(updatedGameState);
    onComplete(updatedProgress, updatedGameState);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isFinished) {
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const perfect = correctCount === problems.length;
    const withinSCT = timeSeconds <= stage.sctSeconds;
    const xpGain = calculateXpGain(correctCount, problems.length, withinSCT);
    const coinsGained = Math.floor(xpGain / 5) + (perfect ? 10 : 0);

    return (
      <div className="practice-complete">
        <div className="practice-complete__header">
          <img
            src={`/assets/icons/${perfect ? "icon-pebble-celebrate-left.png" : "icon-pebble-wave.png"}`}
            alt="Pebble"
            className="practice-complete__mascot"
          />
          <h2 className="practice-complete__title">
            {perfect ? "Perfect! 🎉" : "Well Done! 👏"}
          </h2>
          <p className="practice-complete__subtitle">
            {perfect ? "You nailed every question!" : "Keep practicing to get even better!"}
          </p>
        </div>

        <div className="practice-complete__stats">
          <div className="practice-complete__stat">
            <span className="practice-complete__stat-label">Score</span>
            <span className="practice-complete__stat-value">{correctCount}/{problems.length}</span>
          </div>
          <div className="practice-complete__stat">
            <span className="practice-complete__stat-label">Time</span>
            <span className="practice-complete__stat-value">{formatTime(timeSeconds)}</span>
          </div>
          <div className="practice-complete__stat">
            <span className="practice-complete__stat-label">Target</span>
            <span className={`practice-complete__stat-value ${withinSCT ? "practice-complete__stat-value--success" : "practice-complete__stat-value--warning"}`}>
              {formatTime(stage.sctSeconds)}
            </span>
          </div>
        </div>

        <div className="practice-complete__rewards">
          <div className="practice-complete__reward">
            <img src="/assets/icons/icon-xp.png" alt="XP" className="practice-complete__reward-icon" />
            <span>+{xpGain} XP</span>
          </div>
          <div className="practice-complete__reward">
            <img src="/assets/icons/icon-coin-star.png" alt="Coins" className="practice-complete__reward-icon" />
            <span>+{coinsGained} Coins</span>
          </div>
        </div>

        {perfect && withinSCT && (
          <p className="practice-complete__mastery-msg">
            🌟 {progress.consecutivePerfectDays + 1}/{stage.unlockRequirement} perfect days to next stage!
          </p>
        )}

        <button onClick={onBack} className="practice-complete__btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const problem = problems[currentIndex];
  const progressPercent = (currentIndex / problems.length) * 100;
  const isYoung = ageGroup === "young";

  return (
    <div className={`practice ${isYoung ? "practice--young" : ""}`}>
      {/* Practice Header */}
      <div className="practice__header">
        <button onClick={onBack} className="practice__close">
          <img src="/assets/icons/icon-arrow-left.png" alt="Back" className="practice__close-icon" />
        </button>
        <div className="practice__progress-info">
          <span className="practice__question-count">{currentIndex + 1}/{problems.length}</span>
        </div>
        <div className="practice__timer-hearts">
          <span className={`practice__timer ${elapsed > stage.sctSeconds ? "practice__timer--over" : ""}`}>
            <img src="/assets/icons/icon-timer.png" alt="Time" className="practice__timer-icon" />
            {formatTime(elapsed)}
          </span>
          <span className="practice__hearts">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`practice__heart ${i < hearts ? "" : "practice__heart--empty"}`}>
                {i < hearts ? "❤️" : "🤍"}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="practice__progress-bar">
        <div className="practice__progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Combo indicator */}
      {comboCount >= 3 && (
        <div className="practice__combo animate-pop-in">
          🔥 {comboCount}x Combo!
        </div>
      )}

      {/* Problem display */}
      <div className={`practice__problem ${feedback === "correct" ? "practice__problem--correct" : feedback === "wrong" ? "practice__problem--wrong" : ""}`}>
        <div className={`practice__problem-text ${isYoung ? "practice__problem-text--large" : ""}`}>
          <span>{problem.displayParts.left}</span>
          <span className="practice__operator">{problem.displayParts.operator}</span>
          <span>{problem.displayParts.right}</span>
          <span className="practice__equals">=</span>
          <span className="practice__answer-slot">
            {userAnswer || "?"}
          </span>
        </div>

        {feedback === "correct" && (
          <div className="practice__feedback practice__feedback--correct animate-pop-in">
            <img src="/assets/icons/icon-checkmark.png" alt="Correct" className="practice__feedback-icon" />
            <span>Correct!</span>
          </div>
        )}
        {feedback === "wrong" && (
          <div className="practice__feedback practice__feedback--wrong animate-pop-in">
            <img src="/assets/icons/icon-close-red.png" alt="Wrong" className="practice__feedback-icon" />
            <span>Answer: {problem.answer}</span>
          </div>
        )}
        {showEncouragement && (
          <div className="practice__encouragement animate-pop-in">
            {showEncouragement}
          </div>
        )}
      </div>

      {/* Numpad Input */}
      <div className="practice__numpad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "go"].map((key) => (
          <button
            key={key}
            onClick={() => handleNumpad(key)}
            disabled={feedback !== null}
            className={`practice__numpad-btn ${key === "go" ? "practice__numpad-btn--go" : ""} ${key === "del" ? "practice__numpad-btn--del" : ""} ${isYoung ? "practice__numpad-btn--large" : ""}`}
          >
            {key === "del" ? "⌫" : key === "go" ? "✓" : key}
          </button>
        ))}
      </div>
    </div>
  );
}
