# ai

LLM configuration files. Modular, token-efficient, and portable.

## Claude Code

First integration. See [PLAN.md](PLAN.md) for the full design rationale.

### Structure

```
CLAUDE.md                          # Layer 1: Global config (~450 tokens)
settings.json                      # Layer 5: Settings + hooks
rules/                             # Layer 2: Auto-loaded rules (~2,100 tokens)
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
skills/                            # Layer 3: On-demand skills (0 tokens until invoked)
  security-review/skill.md         #   Security audit workflow + checklist
  docker-patterns/skill.md         #   Multi-stage builds, Compose, Swarm
  golang-patterns/skill.md         #   Go idioms, DI, graceful shutdown
  golang-testing/skill.md          #   Table-driven tests, golden files
  python-patterns/skill.md         #   Django service layer, DRF patterns
  python-testing/skill.md          #   pytest, Factory Boy, fixtures
  django-patterns/skill.md         #   ViewSets, signals, migrations
  django-security/skill.md         #   CSRF, JWT, injection prevention
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

### Installation

Copy or symlink to `~/.claude/`:

```bash
# Clone the repo
git clone https://github.com/droxey/ai.git ~/ai

# Symlink into Claude Code's config directory
ln -sf ~/ai/CLAUDE.md ~/.claude/CLAUDE.md
ln -sf ~/ai/settings.json ~/.claude/settings.json
ln -sf ~/ai/rules ~/.claude/rules
ln -sf ~/ai/skills ~/.claude/skills
ln -sf ~/ai/contexts ~/.claude/contexts
```

For project-level configs, copy a template into your project:

```bash
cp ~/ai/templates/go-cli.md /path/to/project/CLAUDE.md
```

### Shell Aliases

Add to `~/.zshrc`:

```bash
alias c='claude'
alias cr='claude -r'
alias cc='claude -c'
alias cdev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'
alias creview='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'
alias csec='claude --system-prompt "$(cat ~/.claude/contexts/security.md)"'
alias cdanger='docker exec -it claude-sandbox claude --dangerously-skip-permissions'
```

### Token Budget

| Component            | Tokens     |
| -------------------- | ---------- |
| System prompt        | ~10,000    |
| Global CLAUDE.md     | ~450       |
| Rules (all loaded)   | ~2,100     |
| **Static overhead**  | **~12,550**|
| **Available for work** | **~142,450 (71%)** |
