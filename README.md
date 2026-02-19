# ai

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Opus_4-blueviolet)](https://docs.anthropic.com/en/docs/claude-code)
[![Config: Modular](https://img.shields.io/badge/Config-Modular-green)](PLAN.md)

Modular, token-efficient configuration files for LLM-powered development tools. Designed around a layered architecture that keeps static token overhead under 13k (~6.5% of a 200k context window), leaving the rest for actual work.

Built for a Go + Python + Docker stack. Node included as last-resort coverage for hook scripts and build tooling.

## ⚠️ Warning: Use at Your Own Risk

> **You are responsible for the actions taken by agents operating under your configuration.** Review all settings before deploying. *Never* run `--dangerously-skip-permissions` outside a sandboxed container. *Never* grant agents access to **production credentials**, **secrets**, or **irreversible operations** without human review. See [PLAN.md](PLAN.md) for the full autonomy strategy and risk model.

---

## Table of Contents

- [Customization](#customization)
- [Overview](#overview)
- [Structure](#structure)
- [Installation](#installation)
- [Shell Aliases](#shell-aliases)
- [Token Budget](#token-budget)
- [Sources](#sources)

---

## Customization

**Add a language**: Create `rules/<language>/coding-style.md` and `rules/<language>/testing.md`. Optionally add a `skills/<language>-patterns/skill.md` for reference material.

**Add a skill**: Create a directory under `skills/` with a `skill.md` file. Skills are loaded only when Claude needs them, so size is less constrained than rules.

**Add a project template**: Create a file under `templates/`. Keep to 200-400 tokens. State constraints and preferred approaches; let skills handle implementation details.

**Adjust autonomy**: Edit `settings.json` to add tools to `allowedTools` as trust builds. See the progressive autonomy strategy in [PLAN.md](PLAN.md).

---

## Overview

The configuration is organized into seven layers, each with a clear role and token cost:

| Layer | Purpose | Token Cost | Loaded |
|-------|---------|-----------|--------|
| 1. `CLAUDE.md` | Identity, universal rules | ~450 | Always |
| 2. `rules/` | Language and domain rules | ~2,500 | Always (auto) |
| 3. `skills/` | Reference patterns and workflows | 0 | On demand |
| 4. Hooks | Guardrails and automation | 0 | Event-driven |
| 5. `settings.json` | Permissions, preferences | N/A | Config only |
| 6. `templates/` | Project-level CLAUDE.md starters | 0 | Copied per project |
| 7. `contexts/` | Mode-specific system prompts | ~50-100 | Per launch alias |

Rules say *what*. Skills say *how*. This separation keeps the always-loaded footprint small while providing deep reference material when needed.

---

## Structure

```
CLAUDE.md                          # Layer 1: Global config (~450 tokens)
settings.json                      # Layer 5: Settings + hooks
rules/                             # Layer 2: Auto-loaded rules (~2,500 tokens)
  common/
    security.md                    #   Input validation, secrets, HTTPS
    git-workflow.md                #   Conventional commits, draft PRs
    testing.md                     #   TDD, coverage, deterministic tests
    docker.md                      #   Compose, Swarm, CapRover
  golang/
    coding-style.md                #   Effective Go, error wrapping, slog
    testing.md                     #   Table-driven tests, testcontainers
  python/
    coding-style.md                #   Type hints, ruff, pathlib
    testing.md                     #   pytest, Factory Boy, DRF patterns
  node/
    coding-style.md                #   ES modules, async/await, zod
    testing.md                     #   vitest, msw, hook script testing
skills/                            # Layer 3: On-demand skills (0 tokens until invoked)
  security-review/skill.md         #   Security audit workflow + checklist
  docker-patterns/skill.md         #   Multi-stage builds, Compose, Swarm
  golang-patterns/skill.md         #   Go idioms, DI, graceful shutdown
  golang-testing/skill.md          #   Table-driven tests, golden files
  python-patterns/skill.md         #   Django service layer, DRF patterns
  python-testing/skill.md          #   pytest, Factory Boy, fixtures
  django-patterns/skill.md         #   ViewSets, signals, migrations
  django-security/skill.md         #   CSRF, JWT, injection prevention
  node-patterns/skill.md           #   Hook scripts, CLI tooling, process mgmt
  strategic-compact/               #   Context management
    skill.md                       #     When and how to compact
    suggest-compact.js             #     Hook script for edit tracking
  deployment-patterns/skill.md     #   Swarm, CI/CD, zero-downtime deploy
templates/                         # Layer 6: Project-level CLAUDE.md templates
  go-cli.md                        #   Go CLI project template
  django-drf.md                    #   Django+DRF API template
  docker-devops.md                 #   Infrastructure project template
contexts/                          # Layer 7: Mode-specific system prompts
  dev.md                           #   Development focus
  review.md                        #   Code review focus
  security.md                      #   Security audit focus
```

---

## Installation

Clone and symlink into Claude Code's config directory:

```bash
git clone https://github.com/droxey/ai.git ~/ai

ln -sf ~/ai/CLAUDE.md ~/.claude/CLAUDE.md
ln -sf ~/ai/settings.json ~/.claude/settings.json
ln -sf ~/ai/rules ~/.claude/rules
ln -sf ~/ai/skills ~/.claude/skills
ln -sf ~/ai/contexts ~/.claude/contexts
```

For project-level configs, copy a template and customize:

```bash
cp ~/ai/templates/go-cli.md /path/to/project/CLAUDE.md
# Edit the [name] placeholders and add project-specific notes
```

---

## Shell Aliases

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# Core
alias c='claude'
alias cr='claude -r'
alias cc='claude -c'

# Mode-specific launches
alias cdev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'
alias creview='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'
alias csec='claude --system-prompt "$(cat ~/.claude/contexts/security.md)"'

# Container autonomy (Tier 3 -- sandboxed, never on host)
alias cdanger='docker exec -it claude-sandbox claude --dangerously-skip-permissions'
```

---

## Token Budget

Total 200k context window allocation with all rules loaded:

| Component | Tokens | % |
|-----------|--------|---|
| System prompt | ~10,000 | 5% |
| Global CLAUDE.md | ~450 | 0.2% |
| Rules (all loaded) | ~2,500 | 1.25% |
| **Static overhead** | **~12,950** | **~6.5%** |
| **Available for work** | **~142,050** | **~71%** |
| Auto-compact reserve | ~45,000 | ~22.5% |

Skills load on demand and cost 0 tokens until invoked. Compare to loading a monolithic config: easily 8-10k tokens of static overhead before you type anything.

---

## Sources

This configuration draws from three primary sources:

- **[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** -- Modular rules, skills, and hooks collection. Cherry-picked and adapted for Go/Python/Docker stack; TypeScript/frontend content adapted into lean Node rules for hook scripts only.
- **[Anthropic: Measuring AI Agent Autonomy](https://anthropic.com/research/measuring-agent-autonomy)** -- Research on progressive trust tiers, interrupt patterns, and effective oversight strategies.
- **[PRISM](https://github.com/droxey/prompts)** -- Identity and prioritization framework (Accuracy > Goals > Efficiency > Style).
