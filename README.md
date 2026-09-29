# PebbleSum

A fun little app that helps your kid learn numbers and math through daily practice and repetition - like Kumon, but on your phone

A gamified math learning Progressive Web App designed for children aged 2-15. Built on daily repetition, timed mastery, and progressive difficulty using a mathematical progression.

## Features

### Math Curriculum

32 stages across 8 themed worlds, following a linear progression from counting (age 3) to two-step equations (age 15):

| World | Ages | Topics |
|-------|------|--------|
| Pebble Meadow | 3–5 | Number recognition, counting to 10 |
| Number Forest | 4–6 | Counting to 30, number patterns, comparing numbers |
| Addition River | 5–8 | +1 to +3, sums to 10, make 10, bridging ten, two-digit addition with and without carrying |
| Subtraction Cave | 6–9 | Within 10 and 20, two-digit subtraction with and without borrowing, missing numbers |
| Multiply Castle | 7–10 | ×2/5/10, ×3/4, all tables to 12, two-digit × one-digit |
| Division Galaxy | 8–11 | ÷2/5/10, division facts to 12, two- and three-digit ÷ one-digit |
| Fraction Falls | 9–12 | Fraction of an amount, like-denominator fractions, decimals, percentages |
| Algebra Summit | 11–15 | Integers, BEDMAS, powers & roots, one- and two-step equations |

Problems are procedurally generated each session (`src/lib/math-engine.ts`):

- Each generator takes a difficulty from 0 to 1, and a session ramps from a warm-up to a stretch.
- Practice difficulty adapts to the learner's recent sessions. Level tests use a fixed range so everyone meets the same bar.
- Every problem carries a method hint, which is shown after a wrong answer. In practice, missed questions are asked again at the end.

See [`docs/design-review.md`](docs/design-review.md) for the design rationale.

### Progression System

- **Practice-then-pass** (foundation stages): Repeated practice sessions unlock the level test
- **Timed-pass** (computation stages): Pass the level test within the time target, with at most one mistake (hearts show how many are left)
- **Placement**: Onboarding asks what the learner can already do and starts them at one of six points in the curriculum

### Gamification

- **XP & Levels**: Earn XP per correct answer with bonuses for perfect sessions and speed. Level up every 500 XP.
- **Daily Streaks**: Consecutive days of practice tracked with a 1.5-day window
- **Hearts**: Shown only in level tests — each mistake costs one, and the test ends when they run out
- **Coins**: Earned through practice sessions
- **Daily Goals**: Configurable targets (5, 10, 15, or 20 minutes)

### Rewards & Badges

9 badges across 5 categories:

- **Streak**: Warming Up (3 days), On Fire (7 days), Unstoppable (30 days)
- **Mastery**: Perfectionist (10 perfect scores)
- **Speed**: Speed Demon (5 sessions within Standard Clear Time)
- **Milestone**: First Step (1 session), Scholar (500 correct answers), Champion (reach Stage C+)
- **Consistency**: Seedling (7 total sessions)

### Personalisation

- 3 avatar characters to choose from
- 5 colour themes (Default, Ocean, Forest, Space, Candy)
- Text size options (Normal, Large, Extra Large)
- Sound and music controls
- Age-group-adapted UI (simplified for younger children)

### Authentication & Security

- Firebase Authentication with email-based usernames
- PII encryption using PBKDF2-derived AES-256-GCM keys
- Local-first data with optional cloud sync via Firestore
- Parent PIN support
- Account deletion with reauthentication

### PWA

- Installable on any device (standalone mode)
- Portrait-locked, mobile-first design (max 420px)
- Offline-capable with localStorage persistence
- Cross-device sync when signed in

## Tech Stack

- **Framework**: Next.js 16 with React 19 and TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase Authentication + Firestore
- **Analytics**: Vercel Analytics
- **Tests**: Vitest
- **Font**: Nunito (400-900 weights)

## Getting Started

```bash
npm install
npm run dev
npm test      # curriculum & generator tests (vitest)
```

Create a `.env.local` file based on `.env.local.example` with your Firebase credentials.

## Deployment

The app is configured for Firebase Hosting. Build and deploy with:

```bash
npm run build
firebase deploy
```
