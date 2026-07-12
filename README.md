# PebbleSum

A fun little app that helps your kid learn numbers and math through daily practice and repetition - like Kumon, but on your phone

A gamified math learning Progressive Web App designed for children aged 2-15. Built on daily repetition, timed mastery, and progressive difficulty using a mathematical progression.

## Features

### Math Curriculum

12 stages across 6 themed worlds, following a strict linear progression:

| World | Stages | Topics |
|-------|--------|--------|
| Pebble Meadow | 6A, 5A | Number recognition, counting (1-10) |
| Number Forest | 4A, 3A | Counting (5-30), number sequences |
| Addition River | 2A, A, B | Addition (+1 to +20) |
| Subtraction Cave | C, D | Subtraction (within 10 and 20) |
| Multiply Castle | E | Multiplication (2, 5, 10 tables) |
| Division Galaxy | F | Division (2, 5, 10 divisors) |

Problems are procedurally generated each session to teach methods rather than memorisation. Input modes include multiple-choice for foundational skills and numpad for computation stages.

### Progression System

- **Practice-then-pass** (Stages 6A-3A): Requires repeated daily practice sessions before attempting a level clear
- **Timed-pass** (Stages 2A-F): Must achieve 100% accuracy within a Standard Clear Time threshold
- **Age-based starting points**: The app places learners at an appropriate stage based on their age

### Gamification

- **XP & Levels**: Earn XP per correct answer with bonuses for perfect sessions and speed. Level up every 500 XP.
- **Daily Streaks**: Consecutive days of practice tracked with a 1.5-day window
- **Hearts**: 5 per attempt during Level Clear mode — wrong answers cost a heart
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
- **Font**: Nunito (400-900 weights)

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` file based on `.env.local.example` with your Firebase credentials.

## Deployment

The app is configured for Firebase Hosting. Build and deploy with:

```bash
npm run build
firebase deploy
```
