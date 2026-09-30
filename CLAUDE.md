# CLAUDE.md — PebbleSum

## Project Overview

PebbleSum is a project hosted at https://github.com/vattitude-me/PebbleSum.

## Development Standards

### Code Style

- Follow language-specific conventions (linting configs take precedence over general rules)
- Use meaningful, descriptive names for variables, functions, and files
- Keep functions focused and small (single responsibility)
- Prefer composition over inheritance

### Git Workflow

- Branch from `main` for all work
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Keep commits atomic — one logical change per commit
- Write meaningful commit messages explaining *why*, not just *what*

### Versioning (required on every check-in)

The app shows its version under **Profile → About**, so every commit that lands on `main` must bump the version:

1. Bump `version` in `package.json` using semver:
   - `fix:`, `chore:`, `refactor:`, `docs:`, `test:` → patch (1.1.0 → 1.1.1)
   - `feat:` → minor (1.1.0 → 1.2.0)
   - breaking change (e.g. saved progress no longer loads) → major (1.1.0 → 2.0.0)
2. Run `npm install --package-lock-only` so `package-lock.json` matches.
3. Add a `## x.y.z — YYYY-MM-DD` entry at the top of `CHANGELOG.md` with one line per change.

`npm test` fails if the top `CHANGELOG.md` entry doesn't match `package.json`. The build commit and build time are stamped automatically in `next.config.ts`, so every deploy is identifiable even between version bumps.

### Testing

- Write tests for all new logic
- Tests should be deterministic and independent
- Name tests descriptively: `should_[expected]_when_[condition]`

### Security

- No hardcoded secrets, tokens, or credentials
- Use environment variables or secret managers for sensitive config
- Never commit `.env` files or key material
- Validate all external input at system boundaries

### Dependencies

- Pin dependency versions
- Prefer well-maintained, widely-used libraries
- Document why non-obvious dependencies were added

## Commands

- `npm run dev` — start the dev server
- `npm test` — run unit tests (vitest), including the version/changelog check
- `npm run build` — production build (stamps version, commit and build time)

## Architecture

_(To be updated as the project takes shape)_
