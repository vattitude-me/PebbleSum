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

interface PracticeViewProps {
  stage: Stage;
  progress: UserProgress;
  onComplete: (updatedProgress: UserProgress) => void;
  onBack: () => void;
}

export default function PracticeView({ stage, progress, onComplete, onBack }: PracticeViewProps) {
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

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  const handleSubmit = useCallback(() => {
    if (!userAnswer.trim()) return;

    const problem = problems[currentIndex];
    const isCorrect = parseInt(userAnswer) === problem.answer;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer("");
      if (currentIndex + 1 >= problems.length) {
        finishSession(isCorrect ? correctCount + 1 : correctCount);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 800);
  }, [userAnswer, currentIndex, problems, correctCount]);

  const finishSession = (finalCorrect: number) => {
    setIsFinished(true);
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const perfect = finalCorrect === problems.length;
    const withinSCT = timeSeconds <= stage.sctSeconds;
    const xpGain = calculateXpGain(finalCorrect, problems.length, withinSCT);

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

    saveProgress(updatedProgress);
    onComplete(updatedProgress);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isFinished) {
    const lastSession = progress.completedSessions.length > 0
      ? progress.completedSessions[progress.completedSessions.length - 1]
      : null;
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const perfect = correctCount === problems.length;
    const withinSCT = timeSeconds <= stage.sctSeconds;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-pop-in">
        <div className="text-6xl mb-4">{perfect ? "🎉" : "👏"}</div>
        <h2 className="text-3xl font-bold mb-2">
          {perfect ? "Perfect!" : "Well Done!"}
        </h2>
        <div className="card w-full max-w-sm mt-4 space-y-3">
          <div className="flex justify-between">
            <span>Score</span>
            <span className="font-bold">{correctCount}/{problems.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Time</span>
            <span className="font-bold">{formatTime(timeSeconds)}</span>
          </div>
          <div className="flex justify-between">
            <span>Target Time</span>
            <span className={`font-bold ${withinSCT ? "text-green-500" : "text-orange-500"}`}>
              {formatTime(stage.sctSeconds)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>XP Earned</span>
            <span className="font-bold text-primary">
              +{calculateXpGain(correctCount, problems.length, withinSCT)}
            </span>
          </div>
          {lastSession === null && perfect && withinSCT && (
            <p className="text-center text-sm text-green-600 font-semibold mt-2">
              🌟 Keep this up for {stage.unlockRequirement} days to unlock the next stage!
            </p>
          )}
        </div>
        <button onClick={onBack} className="btn-primary mt-6">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const problem = problems[currentIndex];
  const progressPercent = (currentIndex / problems.length) * 100;

  return (
    <div className="flex flex-col items-center p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-xl">
          ✕
        </button>
        <div className="text-sm font-semibold text-gray-500">
          {currentIndex + 1} / {problems.length}
        </div>
        <div className={`text-sm font-mono font-bold ${elapsed > stage.sctSeconds ? "text-red-500" : "text-gray-600"}`}>
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Problem display */}
      <div
        className={`card w-full text-center py-12 mb-8 transition-all ${
          feedback === "correct"
            ? "ring-4 ring-green-300 bg-green-50"
            : feedback === "wrong"
            ? "ring-4 ring-red-300 bg-red-50 animate-shake"
            : ""
        }`}
      >
        <div className="text-4xl md:text-5xl font-bold tracking-wide">
          <span>{problem.displayParts.left}</span>
          <span className="mx-3 text-primary">{problem.displayParts.operator}</span>
          <span>{problem.displayParts.right}</span>
        </div>
        {feedback === "correct" && (
          <div className="text-green-500 text-2xl mt-3 animate-pop-in">✓ Correct!</div>
        )}
        {feedback === "wrong" && (
          <div className="text-red-500 text-lg mt-3 animate-pop-in">
            The answer is {problem.answer}
          </div>
        )}
      </div>

      {/* Answer input */}
      <div className="w-full max-w-xs">
        <input
          type="number"
          inputMode="numeric"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Your answer"
          autoFocus
          disabled={feedback !== null}
          className="w-full text-center text-3xl font-bold py-4 px-6 border-2 border-gray-200 rounded-2xl focus:border-primary focus:outline-none transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!userAnswer.trim() || feedback !== null}
          className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check
        </button>
      </div>
    </div>
  );
}
