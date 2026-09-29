# PebbleSum — UI/UX & Level Generation Review

This review covers the app as it stood before this change, what was wrong for the target audience (ages 3–15), and what was changed. Items marked **Follow-up** are recommendations that were not implemented here.

## 1. Findings

### Curriculum & level generation

| # | Finding | Impact |
|---|---------|--------|
| C1 | The curriculum ended at "Divide by 2, 5, 10" (11 stages). The "I know multiplication" placement dropped learners into ×2/×5/×10. | Nothing for anyone past about age 9. Teens would finish the app in a week or two. |
| C2 | Every question was drawn uniformly at random from one fixed range, then shuffled. | No warm-up and no stretch. `1 + 1` could be the last question and `7 + 3` the first. |
| C3 | Trivial facts (`× 1`, `a − a`, `÷ 10 = 1`) showed up just as often as useful ones. | Wasted questions, and they make the test feel random. |
| C4 | Difficulty never adapted. A child scoring 15/15 in half the time got the same session as one scoring 6/15. | Bored fast learners and frustrated slow ones, both of whom churn. |
| C5 | A wrong answer flashed "Answer: 7" for 0.8 s, then moved on. | No teaching moment. Kids learn nothing from mistakes. |
| C6 | Multiple-choice distractors were random nearby numbers. | Guessable by elimination. |
| C7 | The 6A description said "numerals 0–3", its generator used 1–5, and the learning view used 0–9. | Inconsistent content. |
| C8 | The level test required 100 % accuracy, but it still gave 5 hearts and kept going after the first mistake. | Kids kept playing a test they had already failed. The hearts meant nothing. |

### UI/UX

| # | Finding | Impact |
|---|---------|--------|
| U1 | The home screen's main card showed a tiny "0/3 practices" box to the side of a Practice button. The world, stage position and what unlocks next were hidden. | Kids and parents couldn't tell where they were or why the test was locked. |
| U2 | Once the daily goal was met, the Practice button disappeared from home. | Kids who wanted to keep going had to find it in the nav. |
| U3 | Hearts and the timer showed during *practice* too, and hearts ran out and ended practice sessions. | Test-style pressure on 4-year-olds during what should be low-stakes practice. |
| U4 | Progress was a thin 6 px bar. | You couldn't see how many you'd got right. |
| U5 | The Journey screen was a flat list of rows. | It didn't feel like a journey. There was no sense of place or of what's coming. |
| U6 | The numpad had digits only. | Decimals and negative numbers were impossible. |
| U7 | The same copy was used for every age ("You're amazing! ⭐"). | Patronising for teens. |
| U8 | **Bug:** a guest who reloaded the page landed on Welcome, and "Get Started" re-ran onboarding and **overwrote their current stage**. | Lost progress on every device without an account. |
| U9 | Badge "Champion" was hard-coded to `["C","D","E","F"]`. | It would break as soon as stages were added. |
| U10 | The session-finishing logic (XP, streak, coins, stage advance) was duplicated across `PracticeView` and `NumberLearningView`, and neither was tested. | The two copies drift apart. |

## 2. What changed

### New curriculum: 32 stages across 8 worlds (ages 3–15)

The original stage IDs (`6A`…`F`) are kept, so saved progress still loads.

| World | Ages | Stages |
|-------|------|--------|
| 🌿 Pebble Meadow | 3–5 | Know Your Numbers · Count to 10 |
| 🌲 Number Forest | 4–6 | Count to 30 · Number Patterns · **Bigger or Smaller** |
| 🌊 Addition River | 5–8 | Add Small · Add to 10 · **Make 10** · Add to 20 · **Add Big Numbers** · **Carry the One** |
| 🦇 Subtraction Cave | 6–9 | Subtract Small · Subtract to 20 · **Subtract Big Numbers** · **Borrow a Ten** · **Missing Numbers** |
| 🏰 Multiply Castle | 7–10 | Times 2, 5, 10 · **Times 3 and 4** · **All the Tables** · **Big Multiply** |
| ✨ Division Galaxy | 8–11 | Share by 2, 5, 10 · **Division Facts** · **Big Divide** |
| 🍕 **Fraction Falls** | 9–12 | Fraction Of · Add Fractions · Decimals · Percentages |
| 🏔️ **Algebra Summit** | 11–15 | Negative Numbers · BEDMAS · Powers & Roots · Solve for x · Two-Step Equations |

Onboarding placement now has 6 options, from "Learning numbers" to "Pre-algebra" (`PLACEMENTS` in `src/lib/stages.ts`).

Time limits come from a per-stage "fluent seconds per question": practice target = 3× that, test = 1.4× that plus a 10 s buffer. A two-step equation now gets about 4½ minutes for its test instead of the same 65 s given to times tables.

### Level generation (`src/lib/math-engine.ts`)

- **Difficulty-driven generators.** Each stage's generator takes `d ∈ [0,1]`, and that value moves the whole problem, not just the number range. For example, `B` (Add to 20) goes from `13 + 4` (no bridging) to `8 + 7` (bridging through ten). `A3` goes from `27 + 5` to `48 + 37`. `NEG` goes from `3 − 5` to `−5 × (−8)`.
- **Session ramp.** Problems go from easy to hard in order and are no longer shuffled, so every session starts with a win.
- **Adaptive practice** (`getStageSkill` in `src/lib/session.ts`). The last 4 sessions on a stage move the learner's skill estimate up or down, which centres the practice ramp. Level tests use a **fixed** range so everyone meets the same bar.
- **Method hints.** Every problem includes a one-line hint that teaches the strategy: "Make a ten first: 8 + 2 = 10, then add 5 more", "Undo the + 4 first: 3x = 15. Then divide by 3", "BEDMAS: …".
- **Smarter distractors.** Wrong options are off-by-one, off-by-ten and nearby values.
- **Seeded RNG** (`createRng`), so tests are deterministic.
- **Tests** (`npm test`) generate 750 problems per stage and check each answer by evaluating the rendered expression. They also check whole-number-only stages, duplicates, ramp order and difficulty scaling.

### UI

- **Home → mission card.** Shows the world chip, "Stage 6 of 32", the stage name, and a dot path of practices leading to a 🔒/🏆 test. The caption says exactly what's left ("2 more practices to unlock the test"). Play is always available. Once the test is unlocked, it becomes the primary gold button and shows the question count and time. Below that: a daily-goal ring and a "Coming up" strip of the next 3 stages.
- **Practice.**
  - Hearts appear only in level tests. The number of hearts equals `mistakesAllowed + 1`, and the test ends as soon as they run out.
  - The timer is hidden in practice for young learners. In tests it counts **down**.
  - A segmented progress bar shows one green or orange segment per question.
  - A wrong answer in practice opens a hint card with the answer, the method and a "Got it" button, and the question comes back once at the end ("One more go 💪").
  - The keypad adds `.` or `±` when the stage needs it, plus a full-width **Check** button.
  - Long expressions scale down to fit.
- **Results.** 1–3 stars, "right first time" score, time vs target, and a "Worth another look" list of missed facts with their answers. A failed test says exactly why ("2 missed — 1 allowed" / "Took 1:32 — the target is 1:13").
- **Journey.** A winding trail of large round nodes (✓ / ★ NOW / 🔒) inside world cards, with each world's age range and "n/m" mastered count. The active world is outlined.
- **Age-tuned tone** (`src/lib/tone.ts`). Young: "Yay! Correct!", "High five! ✋". Middle: "Nailed it! 🎯". Teens: "Correct", "Sharp.", "Flawless".
- **Returning guests** see "Continue as {name}" on Welcome instead of being sent through onboarding again.
- **Accessibility.** Touch targets are 48 px or larger (56 px+ for young learners). Buttons have `aria-label`s. Focus rings are visible. `prefers-reduced-motion` turns off the pulsing animations. Space (dark) theme overrides are included for all new components.

## 3. Follow-ups (not in this change)

1. **Spaced review of missed facts across days.** Store missed `question`s per stage and mix 2–3 of them into the next session's warm-up.
2. **Read-aloud for pre-readers** (stages 6A–CMP). Use `speechSynthesis` for the question prompt, with a 🔊 button.
3. **Parent view.** Accuracy and time trend per stage from `completedSessions`, plus the stage's typical age (already on `Stage.ages`).
4. **Trim `completedSessions`.** It grows without limit in localStorage and Firestore. Keep the last ~50 per stage.
5. **Duplicate install prompts.** Both `TopBar` and `HomeDashboard` show one. Keep a single one.
6. **Dead components.** `StageCard`, `XpBar` and `StreakBadge` are unused.
7. **Pre-existing lint errors** (`react-hooks/set-state-in-effect`, `no-explicit-any`) in `use-pwa-install.ts`, `TopBar`, `HomeDashboard` and `NumberLearningView`.
