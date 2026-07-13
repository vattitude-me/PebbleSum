"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MathProblem, generateProblems } from "@/lib/math-engine";
import { Stage, getStageById } from "@/lib/stages";
import {
  UserProgress,
  saveProgress,
  calculateXpGain,
  getToday,
  isStreakActive,
  SessionRecord,
} from "@/lib/progress-store";
import { getNextStage } from "@/lib/stages";
import { AgeGroup, GameState, UserProfile, saveGameState } from "@/lib/user-store";

export type PracticeMode = "practice" | "levelClear";

interface PracticeViewProps {
  stage: Stage;
  mode: PracticeMode;
  progress: UserProgress;
  gameState: GameState;
  profile: UserProfile;
  ageGroup: AgeGroup;
  onComplete: (updatedProgress: UserProgress, updatedGameState: GameState) => void;
  onBack: () => void;
}

export default function PracticeView({ stage, mode, progress, gameState, profile, ageGroup, onComplete, onBack }: PracticeViewProps) {
  const isLevelClear = mode === "levelClear";
  const questionCount = isLevelClear ? stage.levelClearQuestions : stage.questionsPerDay;
  const timeLimit = isLevelClear ? stage.levelClearSeconds : stage.sctSeconds;

  const [problems] = useState<MathProblem[]>(() =>
    generateProblems(stage.id, questionCount)
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const finishedDataRef = useRef<{ updatedProgress: UserProgress; updatedGameState: GameState } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  // Focus the container on mount and after each question advance
  useEffect(() => {
    containerRef.current?.focus();
  }, [currentIndex]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || feedback !== null) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setUserAnswer((a) => a + e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setUserAnswer((a) => a.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmitRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, feedback]);

  const encouragements = [
    "Great job! 🌟",
    "You're amazing! ⭐",
    "Keep going! 💪",
    "Fantastic! 🎯",
    "Brilliant! ✨",
    "Superstar! 🌈",
  ];

  const handleSubmit = useCallback(() => {
    if (!userAnswer.trim() || feedback !== null) return;

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
    }, isCorrect ? 500 : 800);
  }, [userAnswer, currentIndex, problems, correctCount, hearts, comboCount, feedback]);

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

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

  const handleChoiceSelect = useCallback((choice: number) => {
    if (feedback !== null) return;

    const problem = problems[currentIndex];
    const isCorrect = choice === problem.answer;

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
    }, isCorrect ? 500 : 800);
  }, [currentIndex, problems, correctCount, hearts, comboCount, feedback]);

  const finishSession = (finalCorrect: number) => {
    setIsFinished(true);
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const perfect = finalCorrect === problems.length;
    const withinTime = timeSeconds <= timeLimit;
    const xpGain = calculateXpGain(finalCorrect, problems.length, withinTime);
    const coinsGained = Math.floor(xpGain / 5) + (perfect ? 10 : 0);

    const today = getToday();
    const streakActive = isStreakActive(progress.lastPracticeDate);
    const newStreak = streakActive ? progress.streak + (progress.lastPracticeDate === today ? 0 : 1) : 1;

    const nextStage = getNextStage(stage.id);
    const levelCleared = isLevelClear && perfect && withinTime;
    const shouldLevelUp = levelCleared && nextStage;

    const currentPracticeCount = progress.stagePracticeCounts[stage.id] || 0;
    const newPracticeCount = isLevelClear ? currentPracticeCount : currentPracticeCount + 1;

    const session: SessionRecord = {
      date: today,
      stageId: stage.id,
      correct: finalCorrect,
      total: problems.length,
      timeSeconds,
      perfect,
      withinSCT: withinTime,
    };

    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + (isLevelClear && !levelCleared ? 0 : xpGain),
      streak: newStreak,
      lastPracticeDate: today,
      consecutivePerfectDays: perfect && withinTime ? progress.consecutivePerfectDays + 1 : 0,
      currentStageId: shouldLevelUp ? nextStage!.id : progress.currentStageId,
      completedSessions: [...progress.completedSessions, session],
      stagePracticeCounts: {
        ...progress.stagePracticeCounts,
        [stage.id]: newPracticeCount,
      },
    };

    const isSameDay = gameState.practiceDate === today;
    const newPracticeSeconds = (isSameDay ? gameState.todayPracticeSeconds : 0) + timeSeconds;
    const goalSeconds = profile.dailyGoalMinutes * 60;
    const goalReached = newPracticeSeconds >= goalSeconds;

    const updatedGameState: GameState = {
      ...gameState,
      coins: gameState.coins + (isLevelClear && !levelCleared ? 0 : coinsGained),
      hearts,
      dailyGoalCompleted: goalReached,
      todayPracticeSeconds: newPracticeSeconds,
      practiceDate: today,
      todaySessionCount: (isSameDay ? gameState.todaySessionCount : 0) + 1,
      longestStreak: Math.max(gameState.longestStreak, newStreak),
      totalSessionsCompleted: gameState.totalSessionsCompleted + 1,
      totalCorrectAnswers: gameState.totalCorrectAnswers + finalCorrect,
      totalQuestionsAnswered: gameState.totalQuestionsAnswered + problems.length,
    };

    saveProgress(updatedProgress);
    saveGameState(updatedGameState);
    finishedDataRef.current = { updatedProgress, updatedGameState };
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleContinue = useCallback(() => {
    if (finishedDataRef.current) {
      onComplete(finishedDataRef.current.updatedProgress, finishedDataRef.current.updatedGameState);
    }
  }, [onComplete]);


  if (isFinished) {
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const perfect = correctCount === problems.length;
    const withinTime = timeSeconds <= timeLimit;
    const levelCleared = isLevelClear && perfect && withinTime;
    const xpGain = isLevelClear && !levelCleared ? 0 : calculateXpGain(correctCount, problems.length, withinTime);
    const coinsGained = isLevelClear && !levelCleared ? 0 : Math.floor(xpGain / 5) + (perfect ? 10 : 0);

    const getTitle = () => {
      if (isLevelClear && levelCleared) return "Level Cleared! 🏆";
      if (isLevelClear && !levelCleared) return "Not Quite! ⏱️";
      if (perfect) return "Perfect! 🎉";
      return "Well Done! 👏";
    };

    const getSubtitle = () => {
      if (isLevelClear && levelCleared) return "You've mastered this stage!";
      if (isLevelClear && !perfect) return "You need a perfect score to clear this level. Keep practicing!";
      if (isLevelClear && !withinTime) return `Too slow! You need to finish within ${formatTime(timeLimit)}.`;
      if (perfect) return "You nailed every question!";
      return "Keep practicing to get even better!";
    };

    return (
      <div className={`practice-complete ${isLevelClear && levelCleared ? "practice-complete--level-cleared" : ""}`}>
        {isLevelClear && levelCleared && (
          <div className="practice-complete__confetti" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="practice-complete__confetti-piece" style={{ animationDelay: `${i * 0.08}s`, left: `${4 + (i * 4)}%` }} />
            ))}
          </div>
        )}

        <div className="practice-complete__header">
          <img
            src={`/assets/icons/${levelCleared || (!isLevelClear && perfect) ? "icon-pebble-celebrate-left.png" : "icon-pebble-wave.png"}`}
            alt="Pebble"
            className={`practice-complete__mascot ${isLevelClear && levelCleared ? "practice-complete__mascot--celebrate" : ""}`}
          />
          <h2 className={`practice-complete__title ${isLevelClear && levelCleared ? "practice-complete__title--cleared" : ""} ${isLevelClear && !levelCleared ? "practice-complete__title--not-cleared" : ""}`}>{getTitle()}</h2>
          <p className="practice-complete__subtitle">{getSubtitle()}</p>
        </div>

        {isLevelClear && levelCleared && (
          <div className="practice-complete__badge">
            <span className="practice-complete__badge-icon">⭐</span>
            <span className="practice-complete__badge-text">Stage {stage.id} Complete!</span>
          </div>
        )}

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
            <span className={`practice-complete__stat-value ${withinTime ? "practice-complete__stat-value--success" : "practice-complete__stat-value--warning"}`}>
              {formatTime(timeLimit)}
            </span>
          </div>
        </div>

        {(xpGain > 0 || coinsGained > 0) && (
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
        )}

        {isLevelClear && levelCleared && (
          <p className="practice-complete__mastery-msg practice-complete__mastery-msg--success">
            Amazing work! You&apos;re moving on to the next stage!
          </p>
        )}

        {isLevelClear && !levelCleared && (
          <p className="practice-complete__mastery-msg">
            You need 100% correct within {formatTime(timeLimit)} to advance.
          </p>
        )}

        <button onClick={handleContinue} className="practice-complete__btn">
          {isLevelClear && levelCleared ? "Onward!" : "Continue"}
        </button>
      </div>
    );
  }

  const problem = problems[currentIndex];
  const progressPercent = (currentIndex / problems.length) * 100;
  const isYoung = ageGroup === "young";

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`practice ${isYoung ? "practice--young" : ""}`}
      style={{ outline: "none" }}
    >
      {/* Practice Header */}
      <div className="practice__header">
        <button onClick={() => setShowExitConfirm(true)} className="practice__close">
          <img src="/assets/icons/icon-arrow-left.png" alt="Back" className="practice__close-icon" />
        </button>
        <div className="practice__progress-info">
          <span className="practice__question-count">{currentIndex + 1}/{problems.length}</span>
        </div>
        <div className="practice__timer-hearts">
          <span className={`practice__timer ${elapsed > timeLimit ? "practice__timer--over" : ""}`}>
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
        {problem.problemType === "equation" ? (
          <div className={`practice__problem-text ${isYoung ? "practice__problem-text--large" : ""}`}>
            <span>{problem.displayParts.left}</span>
            <span className="practice__operator">{problem.displayParts.operator}</span>
            <span>{problem.displayParts.right}</span>
            <span className="practice__equals">=</span>
            <span className="practice__answer-slot">
              {userAnswer || "?"}
            </span>
          </div>
        ) : problem.problemType === "identify" ? (
          <div className="practice__visual-problem">
            <p className="practice__visual-question">{problem.question}</p>
            <div className="practice__numeral-display">{problem.visual}</div>
          </div>
        ) : problem.problemType === "count" ? (
          <div className="practice__visual-problem practice__visual-problem--count">
            <p className="practice__visual-question practice__visual-question--count">{problem.question}</p>
            <hr className="practice__count-divider" />
            <div className="practice__visual-objects">{problem.visual}</div>
          </div>
        ) : problem.problemType === "sequence" ? (
          <div className="practice__visual-problem">
            <p className="practice__visual-question">{problem.question}</p>
            <div className="practice__sequence">{problem.displayParts.left}</div>
          </div>
        ) : null}

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

      {/* Visual choices for number recognition (6A) */}
      {problem.visualChoices ? (
        <div className="practice__choices practice__choices--visual">
          {problem.visualChoices.map((vc) => (
            <button
              key={vc.value}
              onClick={() => handleChoiceSelect(vc.value)}
              disabled={feedback !== null}
              className={`practice__choice-btn practice__choice-btn--visual ${isYoung ? "practice__choice-btn--large" : ""}`}
            >
              {vc.display}
            </button>
          ))}
        </div>
      ) : problem.choices ? (
        <div className="practice__choices">
          {problem.choices.map((choice) => (
            <button
              key={choice}
              onClick={() => handleChoiceSelect(choice)}
              disabled={feedback !== null}
              className={`practice__choice-btn ${isYoung ? "practice__choice-btn--large" : ""}`}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : (
        /* Numpad Input for equation problems */
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
      )}

      {showExitConfirm && (
        <div className="practice__exit-overlay">
          <div className="practice__exit-modal">
            <p className="practice__exit-title">Are you sure you want to exit?</p>
            <p className="practice__exit-sub">Your progress for this session won&apos;t be saved.</p>
            <div className="practice__exit-actions">
              <button onClick={() => setShowExitConfirm(false)} className="practice__exit-btn practice__exit-btn--stay">
                Keep Going
              </button>
              <button onClick={onBack} className="practice__exit-btn practice__exit-btn--leave">
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
