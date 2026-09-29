"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MathProblem, generateProblems, isCorrectAnswer } from "@/lib/math-engine";
import { Stage, getNextStage } from "@/lib/stages";
import { UserProgress, saveProgress } from "@/lib/progress-store";
import { AgeGroup, GameState, UserProfile, saveGameState } from "@/lib/user-store";
import { SessionMode, SessionOutcome, applySessionResult, getDifficultyRange, getStageSkill } from "@/lib/session";
import { getTone } from "@/lib/tone";

export type PracticeMode = SessionMode;

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

type Feedback = "correct" | "wrong" | null;
type Attempt = { problem: MathProblem; correct: boolean };

/** Practice re-asks each missed question once at the end; this caps how many. */
const MAX_RETRIES = 4;

export function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function fillAnswer(problem: MathProblem): string {
  if (problem.answerPrefix) return `${problem.expression}  →  ${problem.answerPrefix} ${formatNumber(problem.answer)}`;
  if (problem.problemType === "sequence") return problem.expression.replace("?", formatNumber(problem.answer));
  if (problem.problemType !== "equation") return `${problem.question} ${formatNumber(problem.answer)}`;
  return problem.expression.replace("□", formatNumber(problem.answer));
}

function formatNumber(n: number): string {
  return n < 0 ? `−${-n}` : String(n);
}

export default function PracticeView({ stage, mode, progress, gameState, profile, ageGroup, onComplete, onBack }: PracticeViewProps) {
  const isLevelClear = mode === "levelClear";
  const tone = getTone(ageGroup);
  const isYoung = ageGroup === "young";
  const originalCount = isLevelClear ? stage.levelClearQuestions : stage.questionsPerDay;
  const timeLimit = isLevelClear ? stage.levelClearSeconds : stage.sctSeconds;
  const maxHearts = stage.mistakesAllowed + 1;

  const [queue, setQueue] = useState<MathProblem[]>(() => {
    const range = getDifficultyRange(mode, getStageSkill(progress, stage.id));
    return generateProblems(stage.id, originalCount, range);
  });
  const [index, setIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [retriedIds, setRetriedIds] = useState<Set<string>>(() => new Set());
  const [combo, setCombo] = useState(0);
  const [cheer, setCheer] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [outcome, setOutcome] = useState<SessionOutcome | null>(null);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Level-clear runs get a short pause every third of the test.
  const breakEvery = isLevelClear ? Math.floor(originalCount / 3) : 0;
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakMessage, setBreakMessage] = useState("");
  const pausedMsRef = useRef(0);
  const breakStartRef = useRef<number | null>(null);

  const firstTries = attempts.slice(0, originalCount);
  const firstTryCorrect = firstTries.filter((a) => a.correct).length;
  const mistakes = firstTries.length - firstTryCorrect;
  const hearts = maxHearts - mistakes;
  const problem = queue[index];
  const isRetry = index >= originalCount;

  const activeTime = useCallback(() => Math.floor((Date.now() - startTime - pausedMsRef.current) / 1000), [startTime]);

  useEffect(() => {
    if (outcome || isOnBreak) return;
    const interval = setInterval(() => setElapsed(activeTime()), 1000);
    return () => clearInterval(interval);
  }, [outcome, isOnBreak, activeTime]);

  useEffect(() => {
    containerRef.current?.focus();
  }, [index]);

  const finish = useCallback((finalAttempts: Attempt[], abandoned: boolean) => {
    const first = finalAttempts.slice(0, originalCount);
    const correct = first.filter((a) => a.correct).length;
    const timeSeconds = activeTime();
    const result = applySessionResult({
      stage,
      mode,
      progress,
      gameState,
      dailyGoalMinutes: profile.dailyGoalMinutes,
      correct,
      total: originalCount,
      mistakes: first.length - correct,
      timeSeconds,
      abandoned,
    });
    saveProgress(result.updatedProgress);
    saveGameState(result.updatedGameState);
    setFinalSeconds(timeSeconds);
    setOutcome(result);
  }, [stage, mode, progress, gameState, profile.dailyGoalMinutes, originalCount, activeTime]);

  const advance = useCallback((finalAttempts: Attempt[], nextQueue: MathProblem[]) => {
    setFeedback(null);
    setUserAnswer("");
    setCheer("");
    const next = index + 1;
    const firstTryMistakes = finalAttempts.slice(0, originalCount).filter((a) => !a.correct).length;
    if (isLevelClear && firstTryMistakes >= maxHearts) {
      finish(finalAttempts, true);
    } else if (next >= nextQueue.length) {
      finish(finalAttempts, false);
    } else {
      if (breakEvery >= 2 && next % breakEvery === 0 && next < originalCount) {
        breakStartRef.current = Date.now();
        setBreakMessage(tone.breakMessages[Math.floor(Math.random() * tone.breakMessages.length)]);
        setIsOnBreak(true);
      }
      setIndex(next);
    }
  }, [index, originalCount, isLevelClear, maxHearts, finish, breakEvery, tone]);

  const submit = useCallback((value: string | number) => {
    if (feedback !== null || !problem) return;
    if (typeof value === "string" && !value.trim()) return;
    const correct = isCorrectAnswer(problem, value);
    const nextAttempts = [...attempts, { problem, correct }];
    setAttempts(nextAttempts);

    if (correct) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setFeedback("correct");
      if (nextCombo >= 3 && nextCombo % 3 === 0) {
        setCheer(tone.cheers[Math.floor(Math.random() * tone.cheers.length)]);
      }
      setTimeout(() => advance(nextAttempts, queue), 550);
      return;
    }

    setCombo(0);
    setFeedback("wrong");
    if (isLevelClear) {
      // Tests stay brisk: flash the answer, then move on.
      setTimeout(() => advance(nextAttempts, queue), 1400);
      return;
    }
    // Practice: re-ask this question at the end (once), and wait for "Got it".
    if (!retriedIds.has(problem.id) && retriedIds.size < MAX_RETRIES) {
      const nextQueue = [...queue, { ...problem, id: `${problem.id}-retry` }];
      setQueue(nextQueue);
      setRetriedIds(new Set(retriedIds).add(problem.id));
    }
  }, [feedback, problem, attempts, combo, tone, advance, queue, isLevelClear, retriedIds]);

  const dismissHint = useCallback(() => {
    if (feedback === "wrong" && !isLevelClear) advance(attempts, queue);
  }, [feedback, isLevelClear, advance, attempts, queue]);

  const resumeFromBreak = useCallback(() => {
    if (breakStartRef.current !== null) {
      pausedMsRef.current += Date.now() - breakStartRef.current;
      breakStartRef.current = null;
    }
    setIsOnBreak(false);
  }, []);

  const pressKey = useCallback((key: string) => {
    if (feedback !== null) return;
    if (key === "del") setUserAnswer((a) => a.slice(0, -1));
    else if (key === "." ) setUserAnswer((a) => (a.includes(".") ? a : (a === "" || a === "-" ? `${a}0.` : `${a}.`)));
    else if (key === "-") setUserAnswer((a) => (a.startsWith("-") ? a.slice(1) : `-${a}`));
    else setUserAnswer((a) => (a.replace("-", "").length >= 6 ? a : a + key));
  }, [feedback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (outcome || isOnBreak || showExitConfirm) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (feedback === "wrong") dismissHint();
        else submit(userAnswer);
        return;
      }
      if (feedback !== null || problem?.problemType !== "equation") return;
      if (e.key >= "0" && e.key <= "9") pressKey(e.key);
      else if (e.key === "Backspace") pressKey("del");
      else if (e.key === "." && stage.keypad === "decimal") pressKey(".");
      else if (e.key === "-" && stage.keypad === "signed") pressKey("-");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [outcome, isOnBreak, showExitConfirm, feedback, problem, pressKey, stage.keypad, dismissHint, submit, userAnswer]);

  const handleContinue = useCallback(() => {
    if (outcome) onComplete(outcome.updatedProgress, outcome.updatedGameState);
  }, [outcome, onComplete]);

  const missed = useMemo(() => {
    const seen = new Set<string>();
    return attempts
      .slice(0, originalCount)
      .filter((a) => !a.correct && !seen.has(a.problem.question) && seen.add(a.problem.question))
      .map((a) => a.problem);
  }, [attempts, originalCount]);

  if (outcome) {
    return (
      <SessionResults
        stage={stage}
        isLevelClear={isLevelClear}
        outcome={outcome}
        correct={firstTryCorrect}
        total={originalCount}
        mistakes={mistakes}
        timeSeconds={finalSeconds}
        timeLimit={timeLimit}
        missed={missed}
        ranOutOfHearts={isLevelClear && mistakes >= maxHearts}
        tone={tone}
        onContinue={handleContinue}
      />
    );
  }

  if (!problem) return null;

  const remaining = timeLimit - elapsed;
  const showTimer = isLevelClear || !isYoung;
  const keypadExtra = stage.keypad === "decimal" ? "." : stage.keypad === "signed" ? "-" : "";
  const displayAnswer = feedback === "wrong" ? formatNumber(problem.answer) : userAnswer.replace("-", "−") || "?";
  const expressionParts = problem.expression.split("□");
  const exprLength = problem.expression.length;
  const sizeClass = exprLength > 18 ? "practice__expr--sm" : exprLength > 12 ? "practice__expr--md" : "";

  return (
    <div ref={containerRef} tabIndex={-1} className={`practice ${isYoung ? "practice--young" : ""} ${isLevelClear ? "practice--test" : ""}`} style={{ outline: "none" }}>
      <div className="practice__header">
        <button onClick={() => setShowExitConfirm(true)} className="practice__close" aria-label="Leave session">
          <img src="/assets/icons/icon-arrow-left.webp" alt="" className="practice__close-icon" />
        </button>
        <div className="practice__title">
          <span className="practice__stage-name">{stage.name}</span>
          <span className="practice__mode-tag">{isLevelClear ? "Level test" : isRetry ? "Try again" : "Practice"}</span>
        </div>
        <div className="practice__timer-hearts">
          {showTimer && (
            <span className={`practice__timer ${isLevelClear && remaining <= 10 ? "practice__timer--over" : ""}`} aria-label={isLevelClear ? "Time left" : "Time"}>
              <img src="/assets/icons/icon-timer.webp" alt="" className="practice__timer-icon" />
              {isLevelClear ? formatTime(remaining) : formatTime(elapsed)}
            </span>
          )}
          {isLevelClear && (
            <span className="practice__hearts" aria-label={`${hearts} hearts left`}>
              {Array.from({ length: maxHearts }).map((_, i) => (
                <span key={i} className={`practice__heart ${i < hearts ? "" : "practice__heart--empty"}`}>{i < hearts ? "❤️" : "🤍"}</span>
              ))}
            </span>
          )}
        </div>
      </div>

      {/* One segment per question: green = right first time, orange = missed */}
      <div className="practice__segments" aria-label={`Question ${Math.min(index + 1, originalCount)} of ${originalCount}`}>
        {Array.from({ length: originalCount }).map((_, i) => {
          const a = attempts[i];
          const state = a ? (a.correct ? "done" : "missed") : i === index ? "current" : "todo";
          return <span key={i} className={`practice__segment practice__segment--${state}`} />;
        })}
      </div>

      <div className="practice__status-row">
        {combo >= 3 ? <span className="practice__combo animate-pop-in">🔥 {combo} in a row</span> : <span />}
        {cheer && <span className="practice__encouragement animate-pop-in">{cheer}</span>}
      </div>

      <div className={`practice__problem ${feedback === "correct" ? "practice__problem--correct" : feedback === "wrong" ? "practice__problem--wrong" : ""}`}>
        {isRetry && feedback === null && <span className="practice__retry-tag">One more go 💪</span>}

        {problem.problemType === "equation" ? (
          problem.answerPrefix ? (
            <div className={`practice__algebra ${sizeClass}`}>
              <div className="practice__problem-text">{problem.expression}</div>
              <div className="practice__problem-text practice__problem-text--answer">
                <span className="practice__operator">{problem.answerPrefix}</span>
                <span className={`practice__answer-slot ${feedback === "wrong" ? "practice__answer-slot--reveal" : ""}`}>{displayAnswer}</span>
              </div>
            </div>
          ) : (
            <div className={`practice__problem-text ${isYoung ? "practice__problem-text--large" : ""} ${sizeClass}`}>
              {expressionParts[0] && <span>{expressionParts[0].trim()}</span>}
              <span className={`practice__answer-slot ${feedback === "wrong" ? "practice__answer-slot--reveal" : ""}`}>{displayAnswer}</span>
              {expressionParts[1] && <span>{expressionParts[1].trim()}</span>}
            </div>
          )
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
            <div className="practice__sequence">{problem.expression}</div>
          </div>
        ) : (
          <div className="practice__visual-problem">
            <p className="practice__visual-question practice__visual-question--big">{problem.question}</p>
          </div>
        )}

        {feedback === "correct" && (
          <div className="practice__feedback practice__feedback--correct animate-pop-in">
            <img src="/assets/icons/icon-checkmark.webp" alt="" className="practice__feedback-icon" />
            <span>{tone.correct}</span>
          </div>
        )}
      </div>

      {feedback === "wrong" ? (
        <div className="practice__hint-card animate-slide-up" role="status">
          <p className="practice__hint-answer">
            {problem.problemType === "equation" ? "The answer is " : "It's "}
            <strong>{formatNumber(problem.answer)}</strong>
          </p>
          <p className="practice__hint-text">💡 {problem.hint}</p>
          {!isLevelClear && (
            <>
              {!isRetry && retriedIds.has(problem.id) && <p className="practice__hint-note">We&apos;ll try one like this again at the end.</p>}
              <button onClick={dismissHint} className="practice__hint-btn" autoFocus>
                Got it
              </button>
            </>
          )}
        </div>
      ) : problem.visualChoices ? (
        <div className="practice__choices practice__choices--visual">
          {problem.visualChoices.map((vc) => (
            <button key={vc.value} onClick={() => submit(vc.value)} disabled={feedback !== null || isOnBreak}
              className={`practice__choice-btn practice__choice-btn--visual ${isYoung ? "practice__choice-btn--large" : ""}`}>
              {vc.display}
            </button>
          ))}
        </div>
      ) : problem.choices ? (
        <div className={`practice__choices ${problem.choices.length === 2 ? "practice__choices--pair" : ""} ${problem.choices.length === 3 ? "practice__choices--trio" : ""}`}>
          {problem.choices.map((choice) => (
            <button key={choice} onClick={() => submit(choice)} disabled={feedback !== null || isOnBreak}
              className={`practice__choice-btn ${isYoung ? "practice__choice-btn--large" : ""}`}>
              {choice}
            </button>
          ))}
        </div>
      ) : (
        <div className="practice__keypad">
          <div className="practice__numpad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", keypadExtra, "0", "del"].map((key, i) =>
              key === "" ? <span key={`blank-${i}`} /> : (
                <button key={key} onClick={() => pressKey(key)} disabled={feedback !== null || isOnBreak}
                  aria-label={key === "del" ? "Delete" : key === "-" ? "Plus or minus" : key}
                  className={`practice__numpad-btn ${key === "del" ? "practice__numpad-btn--del" : ""} ${key === "." || key === "-" ? "practice__numpad-btn--extra" : ""} ${isYoung ? "practice__numpad-btn--large" : ""}`}>
                  {key === "del" ? "⌫" : key === "-" ? "±" : key}
                </button>
              )
            )}
          </div>
          <button onClick={() => submit(userAnswer)} disabled={feedback !== null || isOnBreak || !userAnswer || userAnswer === "-"}
            className={`practice__check-btn ${isYoung ? "practice__check-btn--large" : ""}`}>
            Check
          </button>
        </div>
      )}

      {showExitConfirm && (
        <div className="practice__exit-overlay">
          <div className="practice__exit-modal">
            <p className="practice__exit-title">{tone.exitTitle}</p>
            <p className="practice__exit-sub">This session won&apos;t be saved.</p>
            <div className="practice__exit-actions">
              <button onClick={() => setShowExitConfirm(false)} className="practice__exit-btn practice__exit-btn--stay">Keep going</button>
              <button onClick={onBack} className="practice__exit-btn practice__exit-btn--leave">Leave</button>
            </div>
          </div>
        </div>
      )}

      {isOnBreak && (
        <div className="practice__exit-overlay">
          <div className="practice__exit-modal">
            <p className="practice__exit-title">Take a breath 🌤️</p>
            <p className="practice__exit-sub">{breakMessage}</p>
            <p className="practice__exit-sub">{index} of {originalCount} done — the clock is paused.</p>
            <div className="practice__exit-actions">
              <button onClick={resumeFromBreak} className="practice__exit-btn practice__exit-btn--stay">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

interface SessionResultsProps {
  stage: Stage;
  isLevelClear: boolean;
  outcome: SessionOutcome;
  correct: number;
  total: number;
  mistakes: number;
  timeSeconds: number;
  timeLimit: number;
  missed: MathProblem[];
  ranOutOfHearts: boolean;
  tone: ReturnType<typeof getTone>;
  onContinue: () => void;
}

function SessionResults({ stage, isLevelClear, outcome, correct, total, mistakes, timeSeconds, timeLimit, missed, ranOutOfHearts, tone, onContinue }: SessionResultsProps) {
  const { levelCleared, withinTime, xpGain, coinsGained, advancedTo } = outcome;
  const accuracy = total > 0 ? correct / total : 0;
  const stars = accuracy === 1 && withinTime ? 3 : accuracy >= 0.8 ? 2 : 1;
  const celebrate = levelCleared || (!isLevelClear && stars === 3);
  const nextStage = advancedTo ?? getNextStage(stage.id);

  const title = isLevelClear
    ? levelCleared ? "Level cleared! 🏆" : "Not yet!"
    : stars === 3 ? tone.perfectTitle : stars === 2 ? tone.goodTitle : tone.keepGoingTitle;

  const reasons: string[] = [];
  if (isLevelClear && !levelCleared) {
    if (ranOutOfHearts) reasons.push(`Out of hearts — you can miss ${stage.mistakesAllowed} at most.`);
    else if (mistakes > stage.mistakesAllowed) reasons.push(`${mistakes} missed — ${stage.mistakesAllowed} allowed.`);
    if (!ranOutOfHearts && timeSeconds > timeLimit) reasons.push(`Took ${formatTime(timeSeconds)} — the target is ${formatTime(timeLimit)}.`);
  }

  return (
    <div className={`practice-complete ${levelCleared ? "practice-complete--level-cleared" : ""}`}>
      {celebrate && (
        <div className="practice-complete__confetti" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className="practice-complete__confetti-piece" style={{ animationDelay: `${i * 0.08}s`, left: `${4 + i * 4}%` }} />
          ))}
        </div>
      )}

      <div className="practice-complete__header">
        <img src={`/assets/icons/${celebrate ? "icon-pebble-celebrate-left.webp" : "icon-pebble-wave.webp"}`} alt="" className={`practice-complete__mascot ${levelCleared ? "practice-complete__mascot--celebrate" : ""}`} />
        <h2 className={`practice-complete__title ${levelCleared ? "practice-complete__title--cleared" : ""} ${isLevelClear && !levelCleared ? "practice-complete__title--not-cleared" : ""}`}>{title}</h2>
        {!isLevelClear && (
          <div className="practice-complete__stars" aria-label={`${stars} of 3 stars`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={`practice-complete__star ${n <= stars ? "practice-complete__star--on" : ""}`} style={{ animationDelay: `${n * 0.15}s` }}>★</span>
            ))}
          </div>
        )}
        {levelCleared && advancedTo && <p className="practice-complete__subtitle">Next up: <strong>{advancedTo.name}</strong></p>}
        {reasons.map((r) => <p key={r} className="practice-complete__subtitle">{r}</p>)}
      </div>

      <div className="practice-complete__stats">
        <div className="practice-complete__stat">
          <span className="practice-complete__stat-label">Right first time</span>
          <span className="practice-complete__stat-value">{correct}/{total}</span>
        </div>
        <div className="practice-complete__stat">
          <span className="practice-complete__stat-label">Time</span>
          <span className={`practice-complete__stat-value ${withinTime ? "practice-complete__stat-value--success" : "practice-complete__stat-value--warning"}`}>{formatTime(timeSeconds)}</span>
        </div>
        <div className="practice-complete__stat">
          <span className="practice-complete__stat-label">Target</span>
          <span className="practice-complete__stat-value">{formatTime(timeLimit)}</span>
        </div>
      </div>

      {(xpGain > 0 || coinsGained > 0) && (
        <div className="practice-complete__rewards">
          <div className="practice-complete__reward">
            <img src="/assets/icons/icon-xp.webp" alt="" className="practice-complete__reward-icon" />
            <span>+{xpGain} XP</span>
          </div>
          <div className="practice-complete__reward">
            <img src="/assets/icons/icon-coin-star.webp" alt="" className="practice-complete__reward-icon" />
            <span>+{coinsGained} coins</span>
          </div>
        </div>
      )}

      {missed.length > 0 && (
        <div className="practice-complete__review">
          <p className="practice-complete__review-title">Worth another look</p>
          <ul className="practice-complete__review-list">
            {missed.slice(0, 4).map((p) => (
              <li key={p.id} className="practice-complete__review-item">{fillAnswer(p)}</li>
            ))}
          </ul>
        </div>
      )}

      {isLevelClear && !levelCleared && (
        <p className="practice-complete__mastery-msg">A couple more practice rounds and you&apos;ll have it.</p>
      )}
      {!isLevelClear && nextStage && !advancedTo && stars === 3 && (
        <p className="practice-complete__mastery-msg practice-complete__mastery-msg--success">{tone.readyNudge}</p>
      )}

      <button onClick={onContinue} className="practice-complete__btn">
        {levelCleared ? "Onward!" : "Continue"}
      </button>
    </div>
  );
}
