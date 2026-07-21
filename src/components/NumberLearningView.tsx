"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Stage, getNextStage } from "@/lib/stages";
import {
  UserProgress,
  saveProgress,
  calculateXpGain,
  getToday,
  isStreakActive,
  SessionRecord,
} from "@/lib/progress-store";
import { AgeGroup, GameState, UserProfile, saveGameState } from "@/lib/user-store";

interface NumberLearningViewProps {
  stage: Stage;
  progress: UserProgress;
  gameState: GameState;
  profile: UserProfile;
  ageGroup: AgeGroup;
  onComplete: (updatedProgress: UserProgress, updatedGameState: GameState) => void;
  onBack: () => void;
}

const NUMBER_NAMES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

function getDotsForNumber(n: number): string {
  if (n === 0) return "🫧";
  return Array(n).fill("⭐").join(" ");
}

type Phase = "learn" | "quiz";

interface QuizQuestion {
  number: number;
  choices: number[];
}

function generateQuiz(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const shuffled = [...numbers].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);

  for (const num of selected) {
    const choices = new Set<number>([num]);
    while (choices.size < 4) {
      const r = Math.floor(Math.random() * 10);
      choices.add(r);
    }
    questions.push({
      number: num,
      choices: [...choices].sort(() => Math.random() - 0.5),
    });
  }
  return questions;
}

export default function NumberLearningView({
  stage,
  progress,
  gameState,
  profile,
  ageGroup,
  onComplete,
  onBack,
}: NumberLearningViewProps) {
  const [phase, setPhase] = useState<Phase>("learn");
  const [currentNumber, setCurrentNumber] = useState(0);
  const [quiz, setQuiz] = useState<QuizQuestion[]>(() => generateQuiz());
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showLevelClearedPopup, setShowLevelClearedPopup] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [startTime] = useState(Date.now());
  const finishedDataRef = useRef<{ updatedProgress: UserProgress; updatedGameState: GameState } | null>(null);

  const LEVEL_CLEAR_THRESHOLD = 10;
  const currentPracticeCount = progress.stagePracticeCounts[stage.id] || 0;

  const handleNextNumber = () => {
    if (currentNumber < 9) {
      setCurrentNumber(currentNumber + 1);
    } else {
      setPhase("quiz");
    }
  };

  const handlePrevNumber = () => {
    if (currentNumber > 0) {
      setCurrentNumber(currentNumber - 1);
    }
  };

  const handleNumberTap = (n: number) => {
    setCurrentNumber(n);
  };

  const handleQuizAnswer = useCallback((choice: number) => {
    if (feedback !== null) return;
    const question = quiz[quizIndex];
    const isCorrect = choice === question.number;

    if (isCorrect) {
      setQuizCorrect((c) => c + 1);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      if (quizIndex + 1 >= quiz.length) {
        finishSession(isCorrect ? quizCorrect + 1 : quizCorrect);
      } else {
        setQuizIndex((i) => i + 1);
      }
    }, isCorrect ? 500 : 800);
  }, [feedback, quiz, quizIndex, quizCorrect]);

  const finishSession = (finalCorrect: number) => {
    setIsFinished(true);
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const total = quiz.length;
    const perfect = finalCorrect === total;
    const withinTime = true;
    const xpGain = calculateXpGain(finalCorrect, total, withinTime);
    const coinsGained = Math.floor(xpGain / 5) + (perfect ? 10 : 0);

    const today = getToday();
    const streakActive = isStreakActive(progress.lastPracticeDate);
    const newStreak = streakActive ? progress.streak + (progress.lastPracticeDate === today ? 0 : 1) : 1;

    const newPracticeCount = currentPracticeCount + 1;
    const levelCleared = newPracticeCount >= LEVEL_CLEAR_THRESHOLD;
    const nextStage = getNextStage(stage.id);
    const shouldAdvance = levelCleared && nextStage;

    const session: SessionRecord = {
      date: today,
      stageId: stage.id,
      correct: finalCorrect,
      total,
      timeSeconds,
      perfect,
      withinSCT: withinTime,
    };

    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + xpGain,
      streak: newStreak,
      lastPracticeDate: today,
      consecutivePerfectDays: perfect ? progress.consecutivePerfectDays + 1 : 0,
      currentStageId: shouldAdvance ? nextStage!.id : progress.currentStageId,
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
      coins: gameState.coins + coinsGained,
      hearts: gameState.hearts,
      dailyGoalCompleted: goalReached,
      todayPracticeSeconds: newPracticeSeconds,
      practiceDate: today,
      todaySessionCount: (isSameDay ? gameState.todaySessionCount : 0) + 1,
      longestStreak: Math.max(gameState.longestStreak, newStreak),
      totalSessionsCompleted: gameState.totalSessionsCompleted + 1,
      totalCorrectAnswers: gameState.totalCorrectAnswers + finalCorrect,
      totalQuestionsAnswered: gameState.totalQuestionsAnswered + total,
    };

    saveProgress(updatedProgress);
    saveGameState(updatedGameState);
    finishedDataRef.current = { updatedProgress, updatedGameState };

    if (levelCleared && currentPracticeCount < LEVEL_CLEAR_THRESHOLD) {
      setShowLevelClearedPopup(true);
    }
  };

  const handleContinue = useCallback(() => {
    if (finishedDataRef.current) {
      onComplete(finishedDataRef.current.updatedProgress, finishedDataRef.current.updatedGameState);
    }
  }, [onComplete]);

  const handleMoveToNextLevel = useCallback(() => {
    if (finishedDataRef.current) {
      onComplete(finishedDataRef.current.updatedProgress, finishedDataRef.current.updatedGameState);
    }
  }, [onComplete]);

  const handleSkipLevel = useCallback(() => {
    const nextStage = getNextStage(stage.id);
    if (!nextStage) return;

    const updatedProgress: UserProgress = {
      ...progress,
      currentStageId: nextStage.id,
    };
    saveProgress(updatedProgress);
    onComplete(updatedProgress, gameState);
  }, [progress, stage, gameState, onComplete]);

  const handleKeepPracticing = useCallback(() => {
    setShowLevelClearedPopup(false);
    setPhase("learn");
    setCurrentNumber(0);
    setQuiz(generateQuiz());
    setQuizIndex(0);
    setQuizCorrect(0);
    setIsFinished(false);
    setFeedback(null);
  }, []);

  if (showLevelClearedPopup) {
    return (
      <div className="number-learn">
        <div className="number-learn__popup-overlay">
          <div className="number-learn__popup">
            <div className="number-learn__popup-confetti" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="number-learn__popup-confetti-piece" style={{ animationDelay: `${i * 0.1}s`, left: `${5 + (i * 6)}%` }} />
              ))}
            </div>
            <img
              src="/assets/icons/icon-pebble-celebrate-left.webp"
              alt="Pebble celebrating"
              className="number-learn__popup-mascot"
            />
            <h2 className="number-learn__popup-title">Level Cleared! 🏆</h2>
            <p className="number-learn__popup-text">
              Amazing! You&apos;ve learned your numbers 0–9!
              You can keep practicing here or move on to the next level.
            </p>
            <div className="number-learn__popup-actions">
              <button onClick={handleKeepPracticing} className="number-learn__popup-btn number-learn__popup-btn--secondary">
                Keep Practicing
              </button>
              <button onClick={handleMoveToNextLevel} className="number-learn__popup-btn number-learn__popup-btn--primary">
                Next Level →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const total = quiz.length;
    const perfect = quizCorrect === total;
    const xpGain = calculateXpGain(quizCorrect, total, true);
    const coinsGained = Math.floor(xpGain / 5) + (perfect ? 10 : 0);

    return (
      <div className="number-learn">
        <div className="practice-complete">
          <div className="practice-complete__header">
            <img
              src={`/assets/icons/${perfect ? "icon-pebble-celebrate-left.png" : "icon-pebble-wave.png"}`}
              alt="Pebble"
              className="practice-complete__mascot"
            />
            <h2 className="practice-complete__title">{perfect ? "Perfect! 🎉" : "Well Done! 👏"}</h2>
            <p className="practice-complete__subtitle">
              {perfect ? "You know your numbers!" : "Keep learning, you're doing great!"}
            </p>
          </div>

          <div className="practice-complete__stats">
            <div className="practice-complete__stat">
              <span className="practice-complete__stat-label">Score</span>
              <span className="practice-complete__stat-value">{quizCorrect}/{total}</span>
            </div>
            <div className="practice-complete__stat">
              <span className="practice-complete__stat-label">Practice</span>
              <span className="practice-complete__stat-value">{Math.min(currentPracticeCount + 1, LEVEL_CLEAR_THRESHOLD)}/{LEVEL_CLEAR_THRESHOLD}</span>
            </div>
          </div>

          {(xpGain > 0 || coinsGained > 0) && (
            <div className="practice-complete__rewards">
              <div className="practice-complete__reward">
                <img src="/assets/icons/icon-xp.webp" alt="XP" className="practice-complete__reward-icon" />
                <span>+{xpGain} XP</span>
              </div>
              <div className="practice-complete__reward">
                <img src="/assets/icons/icon-coin-star.webp" alt="Coins" className="practice-complete__reward-icon" />
                <span>+{coinsGained} Coins</span>
              </div>
            </div>
          )}

          <button onClick={handleContinue} className="practice-complete__btn">
            Continue
          </button>
        </div>
      </div>
    );
  }

  const isYoung = ageGroup === "young";

  if (phase === "quiz") {
    const question = quiz[quizIndex];
    const progressPercent = ((quizIndex) / quiz.length) * 100;

    return (
      <div className={`number-learn ${isYoung ? "number-learn--young" : ""}`}>
        <div className="practice__header">
          <button onClick={() => setShowExitConfirm(true)} className="practice__close">
            <img src="/assets/icons/icon-arrow-left.webp" alt="Back" className="practice__close-icon" />
          </button>
          <div className="practice__progress-info">
            <span className="practice__question-count">Quiz {quizIndex + 1}/{quiz.length}</span>
          </div>
          <div className="practice__timer-hearts" />
        </div>

        <div className="practice__progress-bar">
          <div className="practice__progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className={`practice__problem ${feedback === "correct" ? "practice__problem--correct" : feedback === "wrong" ? "practice__problem--wrong" : ""}`}>
          <div className="practice__visual-problem">
            <p className="practice__visual-question">What number is this?</p>
            <div className="practice__numeral-display">{question.number}</div>
          </div>

          {feedback === "correct" && (
            <div className="practice__feedback practice__feedback--correct animate-pop-in">
              <img src="/assets/icons/icon-checkmark.webp" alt="Correct" className="practice__feedback-icon" />
              <span>Correct!</span>
            </div>
          )}
          {feedback === "wrong" && (
            <div className="practice__feedback practice__feedback--wrong animate-pop-in">
              <img src="/assets/icons/icon-close-red.webp" alt="Wrong" className="practice__feedback-icon" />
              <span>It&apos;s {question.number}!</span>
            </div>
          )}
        </div>

        <div className="practice__choices">
          {question.choices.map((choice) => (
            <button
              key={choice}
              onClick={() => handleQuizAnswer(choice)}
              disabled={feedback !== null}
              className={`practice__choice-btn practice__choice-btn--with-name ${isYoung ? "practice__choice-btn--large" : ""}`}
            >
              <span className="practice__choice-number">{choice}</span>
              <span className="practice__choice-name">{NUMBER_NAMES[choice]}</span>
            </button>
          ))}
        </div>

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

  // Learning phase
  return (
    <div className={`number-learn ${isYoung ? "number-learn--young" : ""}`}>
      <div className="practice__header">
        <button onClick={() => setShowExitConfirm(true)} className="practice__close">
          <img src="/assets/icons/icon-arrow-left.webp" alt="Back" className="practice__close-icon" />
        </button>
        <div className="practice__progress-info">
          <span className="practice__question-count">Learn: {currentNumber + 1}/10</span>
        </div>
        <div className="practice__timer-hearts" />
      </div>

      <div className="practice__progress-bar">
        <div className="practice__progress-fill" style={{ width: `${((currentNumber + 1) / 10) * 100}%` }} />
      </div>

      <div className="number-learn__card">
        <div className="number-learn__numeral">{currentNumber}</div>
        <div className="number-learn__name">{NUMBER_NAMES[currentNumber]}</div>
        <div className="number-learn__dots">{getDotsForNumber(currentNumber)}</div>
      </div>

      <div className="number-learn__number-strip">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            onClick={() => handleNumberTap(i)}
            className={`number-learn__strip-btn ${i === currentNumber ? "number-learn__strip-btn--active" : ""}`}
          >
            {i}
          </button>
        ))}
      </div>

      <div className="number-learn__nav">
        <button
          onClick={handlePrevNumber}
          disabled={currentNumber === 0}
          className="number-learn__nav-btn number-learn__nav-btn--prev"
        >
          ← Back
        </button>
        <button
          onClick={handleNextNumber}
          className="number-learn__nav-btn number-learn__nav-btn--next"
        >
          {currentNumber === 9 ? "Start Quiz →" : "Next →"}
        </button>
      </div>

      <button onClick={handleSkipLevel} className="number-learn__skip-btn">
        I already know my numbers — skip to counting →
      </button>

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
