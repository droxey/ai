# Test Coverage Analysis

> Generated 2026-02-19. Analyzes current test coverage and proposes improvements.

## Current State: Zero Tests

This repository contains **no test files**. The only executable code is:

1. `skills/strategic-compact/suggest-compact.js` (48 lines) — hook script tracking edit counts and suggesting compaction.
2. Two inline Node scripts in `settings.json` hooks — git-push warning and PR URL extraction.

Everything else is markdown documentation (rules, skills, templates, contexts). The repo prescribes extensive testing practices (table-driven Go tests, pytest + Factory Boy, vitest, 80% coverage targets) while having 0% coverage itself.

---

## Area 1: Test `suggest-compact.js`

The only standalone script has real logic with multiple code paths.

| What to Test | Why |
|---|---|
| Fresh state (no state file) | Verify `loadState()` fallback to `{editCount: 0, lastSuggestion: 0}` |
| Edit count below threshold | Should pass stdin through without stderr warning |
| Edit count at threshold (20) | Should emit compaction suggestion to stderr |
| Time debounce (< 5 min since last suggestion) | Should suppress suggestion even if threshold met |
| Time debounce (> 5 min since last suggestion) | Should re-enable suggestions |
| Counter reset after suggestion | `editCount` should reset to 0 after emitting |
| Corrupt/malformed state file | Should gracefully fall back to defaults |
| stdin passthrough integrity | Output must exactly match input on all code paths |

**Approach**: vitest with `vi.mock('fs')` for state file isolation, fixture JSON piped through stdin.

---

## Area 2: Test Inline Hook Scripts

The inline hooks in `settings.json` contain non-trivial logic.

### PreToolUse Bash hook (git push warning)

- Should warn on `git push` commands.
- Should not warn on other git commands (`git status`, `git diff`).
- Should pass through valid JSON unmodified.
- Should handle malformed stdin gracefully.

### PostToolUse Bash hook (PR URL extraction)

- Should extract and log GitHub PR URLs from `gh pr create` output.
- Should not trigger on non-PR commands.
- Should handle missing/malformed stdout in tool output.

**Recommendation**: Extract inline scripts into named files (`hooks/warn-git-push.js`, `hooks/log-pr-url.js`) for testability and maintainability. Test the same way as `suggest-compact.js`.

---

## Area 3: Markdown/Configuration Validation

A validation suite for the 20+ markdown files would catch drift and errors.

| Validation | Purpose |
|---|---|
| Code blocks parse without syntax errors | Catch broken examples in skills/rules |
| No dead internal links between documents | Catch references to renamed/deleted files |
| All skills referenced in PLAN.md exist on disk | Catch skill name mismatches |
| `settings.json` is valid JSON with expected schema | Catch hook config errors |
| All hook command paths resolve | Catch broken paths like `~/.claude/skills/...` |
| Template files contain required sections | Catch incomplete project templates |

**Approach**: A small bash or Node validation script run in CI.

---

## Area 4: Gaps in Testing Guidance

### 4a. Missing `node-testing` skill

Go and Python both have dedicated testing skills with code examples. Node has only a rules file (`rules/node/testing.md`) with no corresponding `skills/node-testing/skill.md`. All executable code in this repo is Node — this gap matters.

### 4b. No async/background task testing

The Python stack mentions Celery (`templates/django-drf.md`), but no rule or skill covers testing `@shared_task`, task chains, or result backends.

### 4c. No database migration testing

`skills/django-patterns/skill.md` mentions "Test migrations in CI" as a one-liner but provides no patterns for data migrations (RunPython), reversibility, or production-like data volumes.

### 4d. No property-based / fuzz testing

The repo emphasizes table-driven tests but never mentions:
- **Go**: `testing/quick` or `github.com/flyingmutant/rapid`
- **Python**: `hypothesis`

These catch edge cases manually written test tables miss.

### 4e. No contract/API schema testing

For a REST API stack (Django + DRF), there is no guidance on OpenAPI schema validation, consumer-driven contracts (Pact), or schema evolution testing.

### 4f. No automated security testing

`skills/security-review/skill.md` is a manual checklist. No guidance on:
- `bandit` (Python), `gosec` (Go) in CI
- Dependency vulnerability scanning (`pip-audit`, `govulncheck`)
- DAST patterns (OWASP ZAP)

### 4g. No performance/load testing

Monitoring (Prometheus/Grafana) is documented but testing is not:
- Benchmark tests (`go test -bench`, `pytest-benchmark`)
- Load testing (`k6`, `locust`)
- Performance regression detection in CI

---

## Priority Ranking

| Priority | Area | Effort | Impact |
|---|---|---|---|
| **P0** | Test `suggest-compact.js` | Low | Prevent regressions in the only executable code |
| **P0** | Extract + test inline hooks | Low | Testability and maintainability of active hook logic |
| **P1** | Add `node-testing` skill | Low | Fill obvious gap; all repo code is Node |
| **P1** | Markdown/config validation CI | Medium | Catch structural drift across 20+ files |
| **P2** | Add async task testing guidance | Low | Celery is in the stack but uncovered |
| **P2** | Add security testing automation guidance | Medium | Complement manual security review skill |
| **P2** | Add property-based testing guidance | Low | Cover edge cases table-driven tests miss |
| **P3** | Add contract testing guidance | Medium | Useful for multi-service API architectures |
| **P3** | Add performance testing guidance | Medium | Complement monitoring stack |
| **P3** | Add migration testing patterns | Low | Prevent data migration failures |
