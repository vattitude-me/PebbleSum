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

_(To be updated as the project takes shape)_

## Architecture

_(To be updated as the project takes shape)_
