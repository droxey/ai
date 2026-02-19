# Token-Efficient Claude Code Configuration Plan

## Design Philosophy

Three guiding principles from the source material, merged with PRISM:

1. **YK's Rule**: Start with nothing in CLAUDE.md. Add only what you repeat. Use skills for conditional content — they load on-demand vs. rules that load every session.
1. **Everything-CC's Rule**: Modular rules > monolithic CLAUDE.md. Context window is precious — disable unused MCPs, lazy-load tools, keep under 80 active tools.
1. **Anthropic's Autonomy Finding**: Effective oversight isn't approving every action — it's being in position to intervene when it matters. Experienced users auto-approve more *and* interrupt more. Claude stops to ask clarification more than humans interrupt it, especially on complex tasks. Design your config to support progressive trust, not gatekeeping.[1]

[1] Anthropic, "Measuring AI agent autonomy in practice," Feb 2026. https://anthropic.com/research/measuring-agent-autonomy

Your 200k context budget breaks down roughly as:

| Component                    | Tokens             | %          |
| ---------------------------- | ------------------ | ---------- |
| System prompt + tools        | ~18k (10k patched) | 5-9%       |
| CLAUDE.md (global + project) | Target ≤2k         | ~1%        |
| Rules (auto-loaded)          | Target ≤3k (~2.5k) | ~1.25%     |
| Skills (on-demand)           | 0 until invoked    | 0%         |
| Auto-compact reserve         | 45k                | 22.5%      |
| **Usable working context**   | **~130-145k**      | **65-72%** |

-----

## Layer 1: Global — `~/.claude/CLAUDE.md`

This loads in every session everywhere. Keep it brutally short — under 500 tokens. No code examples, no patterns, no lists of agents. Just identity and universal rules.

```markdown
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
```

That's it. ~450 tokens. Everything else goes into modular layers.

-----

## Layer 2: Modular Rules — `~/.claude/rules/`

Rules auto-load per session. Organize into common + language-specific. Only install what matches your active stack.

### Recommended Structure

```
~/.claude/rules/
├── common/
│   ├── security.md        # From everything-cc, trimmed
│   ├── git-workflow.md    # Conventional commits, draft PRs
│   ├── testing.md         # TDD cycle, coverage targets
│   └── docker.md          # Compose, Swarm, CapRover
├── golang/
│   ├── coding-style.md    # Effective Go, error wrapping, no init()
│   └── testing.md         # Table-driven tests, testcontainers
├── python/
│   ├── coding-style.md    # Type hints, ruff, pathlib
│   └── testing.md         # pytest, Factory Boy, DRF test patterns
└── node/
    ├── coding-style.md    # ES modules, async/await, zod, last-resort rules
    └── testing.md         # vitest, msw, hook script testing
```

### What to Install From Everything-CC

Cherry-pick these files from the repo's `rules/` directory:

| File                     | Action          | Rationale                                                           |
| ------------------------ | --------------- | ------------------------------------------------------------------- |
| `common/security.md`     | Install as-is   | Matches your security auditing work                                 |
| `common/git-workflow.md` | Install, trim   | Remove PR body template (you use draft PRs)                         |
| `common/testing.md`      | Install, soften | Change 80% hard requirement to "target" — you teach varied contexts |
| `common/coding-style.md` | **Skip**        | Covered by PRISM + language-specific rules                          |
| `common/agents.md`       | **Defer**       | Install when you adopt subagents (Tier 2+ autonomy)                 |
| `common/performance.md`  | **Skip**        | Model selection is session-dependent, not rule-worthy               |
| `common/patterns.md`     | **Skip**        | Move to skills (on-demand)                                          |
| `common/hooks.md`        | **Skip**        | Reference material, not a rule                                      |
| `golang/*`               | Install both    | Directly relevant to your Go CLI work                               |
| `python/*`               | Install both    | Directly relevant to Django+DRF APIs                                |
| `typescript/*`           | **Adapt**       | Node is last resort, but hooks and build tooling use it. Cherry-pick TS rules into lean `node/` rules adapted for our hook-script and build-tool use cases. Skip frontend/React patterns. |

### What to Write Yourself

One small rule file for your Docker/DevOps context:

```markdown
# ~/.claude/rules/common/docker.md
# Docker & Infrastructure

- Docker Compose for local dev, Swarm for production deploys.
- Multi-stage builds: dev target with hot reload, prod target minimal.
- CapRover for single-node management. Traefik for routing.
- Healthchecks on all services. Named volumes for persistence.
- .env for local, secrets for production. Never bake secrets into images.
```

### Estimated Token Budget for Rules

| Rule Set               | ~Tokens    |
| ---------------------- | ---------- |
| common/security.md     | ~400       |
| common/git-workflow.md | ~250       |
| common/testing.md      | ~300       |
| common/docker.md       | ~150       |
| golang/ (2 files)      | ~500       |
| python/ (2 files)      | ~500       |
| node/ (2 files)        | ~400       |
| **Total**              | **~2,500** |

-----

## Layer 3: Skills — `~/.claude/skills/`

Skills load on-demand. This is where you put the heavy reference material. From everything-cc, install only your stack:

### Must-Have Skills

| Skill                  | Source        | Why                                       |
| ---------------------- | ------------- | ----------------------------------------- |
| `security-review/`     | everything-cc | Your security auditing workflow            |
| `docker-patterns/`     | everything-cc | Compose, Swarm, networking patterns        |
| `golang-patterns/`     | everything-cc | Go idioms, clean architecture              |
| `golang-testing/`      | everything-cc | Table-driven tests, testcontainers, mocks  |
| `python-patterns/`     | everything-cc | Django service layer, DRF patterns         |
| `python-testing/`      | everything-cc | pytest, Factory Boy, fixtures              |
| `django-patterns/`     | everything-cc | DRF ViewSets, serializers, signals         |
| `django-security/`     | everything-cc | CSRF, auth, injection prevention           |
| `strategic-compact/`   | everything-cc | Proactive compaction reminders             |
| `deployment-patterns/` | everything-cc | Docker Swarm, CI/CD patterns               |
| `node-patterns/`       | Custom        | Hook scripts, CLI tooling, process mgmt    |

### Nice-to-Have Skills

| Skill                  | Rationale                                 |
| ---------------------- | ----------------------------------------- |
| `tdd-workflow/`        | If you want structured TDD slash commands |
| `verification-loop/`   | Self-verification patterns                |
| `database-migrations/` | PostgreSQL migration patterns             |
| `continuous-learning/` | Auto-extract patterns from sessions       |

### Skip These

Java, Spring Boot, C++, Swift, JPA, frontend-patterns (React/Next.js) — not your stack. TypeScript rules are adapted into lean `node/` rules for hook scripts and build tooling only; the frontend-heavy patterns from everything-cc are skipped.

-----

## Layer 4: Hooks

Start minimal. Add hooks only when you catch yourself repeating a manual check. From both sources, here's what fits your workflow:

### Recommended Hooks

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const i=JSON.parse(d);const cmd=i.tool_input?.command||'';if(/git push/.test(cmd)){console.error('[Hook] Review changes before push')}}catch{}console.log(d)})\"" }],
        "description": "Warn before git push"
      },
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "node ~/.claude/skills/strategic-compact/suggest-compact.js" }],
        "description": "Suggest compaction at logical intervals"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const i=JSON.parse(d);const cmd=i.tool_input?.command||'';if(/gh pr create/.test(cmd)){const m=i.tool_output?.stdout?.match(/https:\\/\\/github.com[^\\\\s]+/);if(m)console.error('[Hook] PR created: '+m[0])}}catch{}console.log(d)})\"" }],
        "description": "Log PR URL after creation"
      }
    ]
  }
}
```

### Hooks to Add Later (Once You Feel the Need)

| Hook              | Trigger                       | What It Does                                    |
| ----------------- | ----------------------------- | ----------------------------------------------- |
| tmux reminder     | PreToolUse on long commands   | Warn if not in tmux for docker/pytest/go test    |
| go vet auto-check | PostToolUse on .go file edits | Run `go vet` after Go file changes               |
| ruff auto-format  | PostToolUse on .py file edits | Run `ruff format` after Python edits             |
| .md blocker       | PreToolUse on Write           | Block random .md creation (allow README/CLAUDE)  |

-----

## Layer 5: Settings — `~/.claude/settings.json`

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1",
    "ENABLE_TOOL_SEARCH": "true"
  },
  "preferences": {
    "autoCompact": false
  },
  "permissions": {
    "allowedTools": [
      "Read",
      "Grep",
      "Glob",
      "LS",
      "WebFetch",
      "TodoRead",
      "TodoWrite"
    ]
  }
}
```

Key decisions:

1. **`DISABLE_AUTOUPDATER`** — If you use YK's system prompt patches. Otherwise remove.
1. **`ENABLE_TOOL_SEARCH`** — Lazy-loads MCP tools. Critical for token efficiency.
1. **`autoCompact: false`** — Manual compaction at phase boundaries (per YK Tip 7 and strategic-compact skill).
1. **`allowedTools`** — Tier 2 baseline: auto-approve all read-only operations. You still approve writes, bash, and git. Expand progressively as trust builds (see Layer 5b).

-----

## Layer 5b: Progressive Autonomy Strategy

Anthropic's research found a clear pattern: experienced Claude Code users shift from approve-every-action to monitor-and-interrupt. Auto-approve usage doubles from ~20% (new users) to 40%+ (experienced), while interrupt rates *also* increase from 5% to 9%. This isn't recklessness — it's a more efficient oversight style.[1]

Design your config to support three escalating trust tiers.

### Tier 1: Default (Interactive Sessions)

Standard Claude Code with manual approval. Use for unfamiliar repos, production-touching work, or anything involving secrets/credentials.

```json
// No special config — Claude Code defaults apply
// You approve each tool call, Claude stops to clarify on ambiguity
```

**Why this works:** On complex tasks, Claude stops to ask clarification 2x more than humans interrupt it. The top reasons Claude stops: presenting choice between approaches (35%), gathering diagnostics (21%), clarifying vague requests (13%). Good CLAUDE.md reduces all three by front-loading context.

### Tier 2: Selective Auto-Approve (`allowedTools`)

For familiar codebases and well-scoped tasks. Configure in `~/.claude/settings.json` or project-level `.claude/settings.json`:

```json
{
  "permissions": {
    "allowedTools": [
      "Read",
      "Grep",
      "Glob",
      "LS",
      "WebFetch",
      "TodoRead",
      "TodoWrite"
    ]
  }
}
```

This auto-approves read-only operations and task tracking. You still approve writes, bash commands, and git operations. Add tools progressively as trust builds:

| Trust Level         | Add to allowedTools                                  |
| ------------------- | ---------------------------------------------------- |
| After ~50 sessions  | `Edit`, `Write` (file modifications)                 |
| After ~100 sessions | `Bash(git diff)`, `Bash(go test)`, `Bash(pytest)`    |
| Project-specific    | `Bash(docker compose)`, `Bash(gh pr create --draft)` |

The 50/100 session numbers come from the research curve — that's roughly where the auto-approve rate inflects upward for most users.

### Tier 3: Container Autonomy (`--dangerously-skip-permissions`)

For long-running research, system prompt patching, CI debugging, or any task where you'd let it run 30-45+ minutes unattended. Always in a container. The research shows 99.9th percentile turn duration at ~45 minutes and growing — containers are the safe way to ride that curve.

```bash
# Container with full autonomy (from YK Tip 20)
alias cdanger='docker exec -it claude-sandbox claude --dangerously-skip-permissions'
```

Appropriate for: Reddit research via Gemini CLI, security audit exploration, log analysis, system prompt experiments, dependency audits.

Never appropriate for: anything touching production, anything with real credentials, anything irreversible.

### Why Claude Stops vs. Why You Interrupt

From the research — the two most common reasons humans interrupt are **providing missing context** (32%) and **Claude being slow/excessive** (17%). Both are addressable through configuration:

| Interrupt Reason            | Config Mitigation                                                   |
| --------------------------- | ------------------------------------------------------------------- |
| Missing context (32%)       | Better project CLAUDE.md, handoff docs, structured notes            |
| Slow/excessive (17%)        | Clearer scope in prompts, strategic compaction, break into subtasks |
| Enough help to proceed (7%) | Not a problem — healthy interrupt                                   |
| Change requirements (5%)    | Use plan mode, present choices before executing                     |

The research also found a "deployment overhang" — models handle more autonomy than they exercise in practice. Anthropic's internal data showed Claude Code's success rate on hard tasks doubled while human interventions per session dropped from 5.4 to 3.3. The bottleneck is often configuration and prompting, not capability.

[1] Anthropic, "Measuring AI agent autonomy in practice," Feb 2026. https://anthropic.com/research/measuring-agent-autonomy

-----

## Layer 6: Project-Level `CLAUDE.md` Templates

Keep project-level files to ~200-400 tokens. Describe what, not how — skills handle the how.

The research shows 35% of Claude's stops are to present approach choices and 13% are to clarify vague requests. Good project CLAUDE.md eliminates both by stating constraints, preferred approaches, and non-obvious context upfront.

### Template: Go CLI Project

```markdown
# Project: [name]

Go CLI tool. Single binary, no daemon.

## Stack
Go 1.22+, cobra for CLI, viper for config, slog for logging.

## Build & Test
go build -o bin/[name] ./cmd/[name]
go test ./... -race -count=1
golangci-lint run

## Structure
cmd/[name]/main.go → internal/ → pkg/ (if shared)

## Preferred Approaches
- Errors: wrap with fmt.Errorf + %w, define sentinels in internal/errors.go
- Config: viper with flags taking precedence. No .env in prod.
- Testing: table-driven. Testcontainers for integration.

## Notes
[Project-specific constraints, API endpoints, deployment target]
```

### Template: Django+DRF API

```markdown
# Project: [name]

Django REST API. Docker Compose for local dev.

## Stack
Python 3.12+, Django 5.x, DRF, PostgreSQL, Celery+Redis, pytest.

## Build & Test
docker compose up -d
pytest --cov=apps -x
ruff check . && ruff format --check .

## Structure
config/settings/ → apps/[domain]/ → core/

## Notes
[Project-specific constraints, external integrations, deployment target]
```

### Template: Docker/DevOps Infrastructure

```markdown
# Project: [name]

Infrastructure config. Docker Swarm + CapRover.

## Stack
Docker Compose, Bash, Prometheus/Grafana/Loki monitoring.

## Deploy
docker stack deploy -c docker-compose.yml [stack-name]

## Notes
[VPS topology, domain routing, secrets management approach]
```

-----

## Layer 7: Aliases & Workflow

Add to `~/.zshrc`:

```bash
alias c='claude'
alias cr='claude -r'
alias cc='claude -c'

# Mode-specific launchers (from longform guide)
alias cdev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'
alias creview='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'
alias csec='claude --system-prompt "$(cat ~/.claude/contexts/security.md)"'

# Container autonomy (Tier 3 — always in Docker, never on host)
alias cdanger='docker exec -it claude-sandbox claude --dangerously-skip-permissions'
```

Create `~/.claude/contexts/` with lean mode-specific system prompts (50-100 tokens each) that set focus without duplicating rules:

```markdown
# ~/.claude/contexts/security.md
Security audit mode. Use security-review and django-security skills.
Check: secrets, injection, auth bypass, CSRF, rate limits, error leaks.
Output: findings table with severity, location, recommendation.
```

-----

## Installation Order

1. Create `~/.claude/CLAUDE.md` (global, ~450 tokens)
1. Copy `rules/common/` (security, git-workflow, testing) from everything-cc, trim
1. Write `rules/common/docker.md`
1. Copy `rules/golang/` and `rules/python/` from everything-cc
1. Copy the 10 must-have skills from everything-cc `skills/` directory
1. Set up `settings.json` with lazy tool loading, manual compact, and Tier 2 `allowedTools`
1. Add the minimal hooks (push warning + strategic compact)
1. Create project-level CLAUDE.md files from templates (include Preferred Approaches section)
1. Set up aliases (including `cdanger` for container Tier 3)
1. Optional: Create `~/.claude/contexts/` for mode-specific launches
1. After ~50 sessions: Review which tools you always approve → add to `allowedTools`
1. After ~100 sessions: Consider installing `agents.md` rule + planner/security-reviewer subagents

### Total Always-Loaded Token Budget

| Component                 | Tokens             |
| ------------------------- | ------------------ |
| System prompt (patched)   | ~10,000            |
| Global CLAUDE.md          | ~450               |
| Rules (all loaded)        | ~2,500             |
| **Total static overhead** | **~12,950**        |
| **Remaining for work**    | **~142,050 (71%)** |

Compare to loading everything-cc's full user-CLAUDE.md + all rules + all agents: easily 8-10k tokens before you type anything. This plan saves ~5-7k tokens of static overhead.

-----

## What Not to Do

1. **Don't gate every action.** The research is clear: requiring approval on every tool call creates friction without proportional safety gains. Use `allowedTools` for progressive trust, reserving manual approval for writes and bash in unfamiliar repos.
1. **Don't run `--dangerously-skip-permissions` outside containers.** The 99.9th percentile autonomous turn is 45+ minutes. That's a lot of unsupervised action on a host machine with real credentials.
1. **Don't install subagents until you need orchestration.** They add token overhead per delegation. Start without them; add planner and security-reviewer when multi-step workflows demand it.
1. **Don't install the everything-cc plugin as a whole.** It bundles TypeScript hooks, React/frontend patterns, and agents you won't use. Cherry-pick files instead. Node/TS rules have been adapted into lean `node/` rules for hook scripts and build tooling — the frontend-heavy content is dropped.
1. **Don't put code examples in rules.** Put them in skills. Rules say *what*; skills say *how*.
1. **Don't enable MCPs you use less than weekly.** Configure them all, enable per-project.
1. **Don't suppress Claude's clarification stops.** They're a feature, not friction. On complex tasks Claude self-limits more than humans interrupt — that calibration is load-bearing for safety. If Claude is stopping too often, improve your CLAUDE.md context rather than telling it to "just do it."
1. **Don't use the everything-cc hooks.json verbatim.** It's TypeScript-centric (prettier, tsc, console.log warnings). Adapt for Go/Python tooling. The hooks in this repo use Node for JSON processing (where Bash would be fragile) but skip the TS-specific linting/formatting hooks.
