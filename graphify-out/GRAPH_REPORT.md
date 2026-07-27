# Graph Report - .  (2026-07-27)

## Corpus Check
- Large corpus: 137 files · ~892,102 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 345 nodes · 675 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.87)
- Token cost: 49,980 input · 0 output

## Community Hubs (Navigation)
- Home Dashboard Component
- App Shell & Navigation
- App Layout & Metadata
- Level-Clearing Criteria & Docs
- TypeScript Reference Config
- CLAUDE.md Dev Standards
- Math Problem Generation Engine
- Package Dependencies (Firebase/Next)
- ESLint Dev Dependencies
- Journey Map & Stage Cards
- PWA Manifest
- iOS Install Modal & Logo
- Image Optimization Script
- Streak Badge Component
- XP Bar Component
- ESLint Config
- Next.js Config
- PostCSS Config

## God Nodes (most connected - your core abstractions)
1. `Home()` - 18 edges
2. `UserProgress` - 18 edges
3. `compilerOptions` - 16 edges
4. `generateProblems()` - 15 edges
5. `UserProfile` - 15 edges
6. `GameState` - 15 edges
7. `rand()` - 14 edges
8. `generateId()` - 12 edges
9. `saveProgress()` - 11 edges
10. `STAGES` - 11 edges

## Surprising Connections (you probably didn't know these)
- `General Level Clear Rules (Practice, Perfect Score, Time Limit)` --semantically_similar_to--> `Testing Standards`  [INFERRED] [semantically similar]
  docs/level-clearing-criteria.md → CLAUDE.md
- `Onboarding Screen (Skill Level Selection)` --references--> `Math Curriculum`  [INFERRED]
  docs/pebblesum_app (2).png → README.md
- `Home Screen UI (Daily Goal, Practice CTA, Level Progress)` --references--> `Daily Goals`  [INFERRED]
  docs/pebblesum_app (1).png → README.md
- `Onboarding Screen (Skill Level Selection)` --references--> `Age-Based Starting Points`  [INFERRED]
  docs/pebblesum_app (2).png → README.md
- `Home Screen UI (Daily Goal, Practice CTA, Level Progress)` --references--> `XP & Levels System`  [INFERRED]
  docs/pebblesum_app (1).png → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Level Clear Scoring & Reward Loop** — docs_level_clearing_criteria_generalrules, docs_level_clearing_criteria_heartssystem, docs_level_clearing_criteria_xprewards, docs_pebblesum_app_4_numpadquestion, docs_pebblesum_app_5_resultsscreen [INFERRED 0.85]
- **Curriculum Worlds to Stage Criteria Mapping** — readme_math_curriculum, docs_level_clearing_criteria_foundationstages, docs_level_clearing_criteria_computationstages, docs_level_clearing_criteria_worldgroupings [INFERRED 0.90]
- **Personalisation Settings Reflected in Profile UI** — readme_personalisation, readme_text_size_options, readme_colour_themes, docs_pebblesum_app_3_profilescreen [INFERRED 0.85]

## Communities (20 total, 5 thin omitted)

### Community 0 - "Home Dashboard Component"
Cohesion: 0.12
Nodes (38): BeforeInstallPromptEvent, HomeDashboard(), HomeDashboardProps, generateQuiz(), getDotsForNumber(), NUMBER_NAMES, NumberLearningView(), NumberLearningViewProps (+30 more)

### Community 1 - "App Shell & Navigation"
Cohesion: 0.08
Nodes (34): AppScreen, Home(), BottomNavProps, NAV_ITEMS, ExitConfirmModal(), ExitConfirmModalProps, AVATARS, DAILY_GOALS (+26 more)

### Community 2 - "App Layout & Metadata"
Cohesion: 0.08
Nodes (34): geistMono, jsonLd, metadata, nunito, viewport, AppProviders(), AuthScreen(), AuthScreenProps (+26 more)

### Community 3 - "Level-Clearing Criteria & Docs"
Cohesion: 0.10
Nodes (35): Computation Stages (Timed-Pass), Foundation Stages (Practice-Then-Pass), General Level Clear Rules (Practice, Perfect Score, Time Limit), Hearts System (5 hearts, wrong answer costs 1), Level Clearing Criteria, Progression Flow (Practice -> Unlock -> Pass/Fail), Standard Completion Time (SCT), World Groupings (Journey Map) (+27 more)

### Community 4 - "TypeScript Reference Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "CLAUDE.md Dev Standards"
Cohesion: 0.09
Nodes (28): Code Style Standards, Dependency Management Standards, Git Workflow Standards, PebbleSum Project, Security Standards, Testing Standards, Authentication & Security, Consistency Badge Category (Seedling) (+20 more)

### Community 6 - "Math Problem Generation Engine"
Cohesion: 0.31
Nodes (20): arrangeInRows(), generateAdd2A(), generateAddA(), generateAddB(), generateChoices(), generateCount4A(), generateCount5A(), generateDivF() (+12 more)

### Community 7 - "Package Dependencies (Firebase/Next)"
Cohesion: 0.10
Nodes (19): firebase, next, dependencies, firebase, next, react, react-dom, @vercel/analytics (+11 more)

### Community 8 - "ESLint Dev Dependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, sharp, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 9 - "Journey Map & Stage Cards"
Cohesion: 0.18
Nodes (12): JourneyMap(), JourneyMapProps, StageCardProps, ClearingType, getStageById(), ProblemStyle, Stage, STAGES (+4 more)

### Community 10 - "PWA Manifest"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 11 - "iOS Install Modal & Logo"
Cohesion: 0.24
Nodes (5): IOSInstallModal(), IOSInstallModalProps, LogoProps, BeforeInstallPromptEvent, TopBar()

### Community 12 - "Image Optimization Script"
Cohesion: 0.83
Nodes (3): getImages(), main(), optimizeImage()

## Knowledge Gaps
- **105 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PebbleSum (App)` connect `CLAUDE.md Dev Standards` to `Level-Clearing Criteria & Docs`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `generateProblems()` connect `Math Problem Generation Engine` to `Home Dashboard Component`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `UserProgress` connect `Home Dashboard Component` to `App Shell & Navigation`, `App Layout & Metadata`, `Journey Map & Stage Cards`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home Dashboard Component` be split into smaller, more focused modules?**
  _Cohesion score 0.12210915818686402 - nodes in this community are weakly interconnected._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.08115942028985507 - nodes in this community are weakly interconnected._
- **Should `App Layout & Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.07862679955703211 - nodes in this community are weakly interconnected._