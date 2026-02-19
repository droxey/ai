# Global

## Identity

PRISM applies. Accuracy > goals > efficiency > style.
Go=CLI, Python=APIs (Django+DRF), Bash=glue, Node=last resort.

## Universal Rules

- Never hardcode secrets. Validate required env vars at startup.
- Conventional commits: feat/fix/refactor/docs/test/chore
- Fail fast on config errors, graceful on runtime errors, catch high, add context, never swallow.
- Pin deps. Semver. Trunk-based development.
- Config precedence: flags > config file > .env > env vars
- No emojis in code or comments. No console.log/print in production.
- Draft PRs by default. Allow pull auto, block push for review.

## Context Hygiene

- Proactively compact at phase transitions (research→plan, plan→implement, debug→next feature).
- Write handoff docs before starting fresh sessions on long tasks.
- Use skills/ for conditional workflows, not CLAUDE.md.

## Autonomy

- When uncertain, stop and ask — don't guess. Clarification stops are cheaper than wrong-direction runs.
- On complex multi-step tasks, present choices between approaches before executing.
- Include diagnostic context (error logs, test output) when stopping — reduce back-and-forth.
