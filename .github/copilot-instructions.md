# Copilot Instructions

## What This Repo Is

A modular, token-efficient configuration system for Claude Code (and other LLM tools).
Not a software project — no build system, no tests, no CI.
The "code" is Markdown rules, skill docs, JSON settings, and Node.js hook scripts.

The target stack for generated configurations: Go=CLI, Python=APIs (Django+DRF), Bash=glue, Node=last resort.

**Baseline versions when writing rules, templates, or skills:**

- Go 1.24+ — use `log/slog`, `slices`/`maps` stdlib packages, `crypto/rand.Text()`,
  range-over-func iterators (1.23+). Loop variable semantics fixed in 1.22 (no closure capture bugs).
- Python 3.12+ — use `uv` for dependency management, Pydantic v2,
  `ruff` for lint+format (replaces black+isort+flake8), `tomllib` stdlib, PEP 695 type aliases.
- Django 5.x / DRF 3.15+ — `LoginRequiredMiddleware` available, async views supported,
  `QuerySet.aiterator()` for async ORM.
- Node 22 LTS — only for hook scripts and build tooling; not a primary target.

## Architecture

Seven layers, each with a distinct role:

| Layer | Path              | Token cost | When loaded       |
| ----- | ----------------- | ---------- | ----------------- |
| 1     | `CLAUDE.md`       | ~450       | Always (global)   |
| 2     | `rules/`          | ~2,500     | Always (auto)     |
| 3     | `skills/`         | 0          | On demand only    |
| 4     | Hooks             | 0          | Event-driven      |
| 5     | `settings.json`   | N/A        | Config only       |
| 6     | `templates/`      | 0          | Copied per project|
| 7     | `contexts/`       | ~50-100    | Per launch alias  |

**Key constraint**: Rules load every session — keep them small.
Skills load on demand — size is less constrained.
Never put code examples in rules; put them in skills.

## Key Conventions

### Rules vs. Skills Split

- `rules/` — what to do. Short, declarative, no examples.
- `skills/` — how to do it. Reference patterns, code snippets, workflows. Only invoked when needed.

### Adding New Content

- New language: `rules/<language>/coding-style.md` + `rules/<language>/testing.md`,
  optionally `skills/<language>-patterns/skill.md`
- New skill: `skills/<skill-name>/skill.md`
- New project template: `templates/<name>.md` — keep to 200-400 tokens,
  state constraints and preferred approaches, let skills handle implementation details

### Templates

Project-level `CLAUDE.md` starters live in `templates/`. They contain `[name]` placeholders.
Pattern: stack → build & test commands → structure → preferred approaches → notes.

### Hooks

Hook scripts in `settings.json` use inline Node.js (not separate files) except for
`skills/strategic-compact/suggest-compact.js`. Node is used for JSON processing where Bash
would be fragile. Active hooks:

- PreToolUse `Bash` — warn before `git push`
- PreToolUse `Edit|Write` — suggest compaction after file edits
- PostToolUse `Bash` — log PR URL after `gh pr create`

### settings.json Permissions

`allowedTools` is a progressive trust list — read-only ops auto-approved by default.
Expand after ~50 sessions to include `Edit`/`Write`;
after ~100 sessions to include targeted Bash commands.
`autoCompact: false` — manual compaction at phase boundaries only.

### Commit Style

Conventional commits per `rules/common/git-workflow.md`:
`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
Append `!` for breaking changes (`feat!:`, `fix(auth)!:`).
Use `BREAKING CHANGE:` footer for detail.
Scope in parens when useful: `feat(hooks): add ruff post-edit trigger`.
Draft PRs by default; squash merge to main.

### Go Rules and Templates

Prefer `log/slog` over any third-party logger.
Use `crypto/rand.Text()` for random strings (Go 1.22+, replaces manual hex encoding).
Use `slices.Contains`, `maps.Keys` etc. from stdlib before reaching for `golang.org/x` helpers.
Errors: wrap with `fmt.Errorf("context: %w", err)`; define sentinels in `internal/errors.go`;
never use `panic` for normal error flow.
`context.Context` is always the first parameter.
Lint with `golangci-lint`; zero warnings.

### Python Rules and Templates

Use `uv` for all dependency/env management (`uv add`, `uv run`, `uv sync`).
`ruff check` + `ruff format` replace all other lint/format tools.
Type hints on all signatures; use `from __future__ import annotations` for forward refs.
Pydantic v2 for structured data (v1 `@validator` → v2 `@field_validator`).
Run `mypy` or `pyright` for static analysis in CI.

### Django Rules and Templates

Django 5.x `LoginRequiredMiddleware` replaces per-view `@login_required` for full-site auth.
Never use `raw()` or string-interpolated SQL; use parameterized queries or ORM.
CSRF middleware must remain enabled; only exempt views explicitly with documented justification.
Use `django-environ` or `python-decouple` for settings;
never import `os.environ` directly in settings files.

### Voice for Generated Content

Terse, direct, active voice. Short paragraphs, bullet lists, tables over prose.
Lowercase in informal contexts (commits, inline comments).
Match existing tone — don't over-formalize educational content.

## Markdown

All `.md` files in this repo must pass `markdownlint-cli2` with the config at `.markdownlint.yaml`.

Lint command:

```bash
markdownlint-cli2 "**/*.md" "#node_modules"
```

Config (`.markdownlint.yaml`):

```yaml
default: true
MD013:
  line_length: 120
  code_blocks: false
  tables: false
MD024:
  siblings_only: true
MD033: false  # allow inline HTML (Docsify badges/anchors)
MD041: false  # not all files start with H1 (e.g., _sidebar.md)
```

**GFM rules enforced:**

- ATX headings (`#`) only — no setext (`===` / `---`).
  Headings increment by one level at a time (MD001).
- One blank line before and after every heading (MD022).
- One blank line before and after every fenced code block (MD031).
- Fenced code blocks always carry a language identifier (MD040):
  `bash`, `python`, `go`, `yaml`, `json`, `markdown`, `dockerfile`, `text`.
- Unordered lists use `-` consistently, 2-space indent for nesting (MD004, MD007).
- No trailing spaces (MD009). No hard tabs (MD010). No multiple consecutive blank lines (MD012).
- No `$` prefix on shell commands that produce no output (MD014) —
  omit the `$` so the block is copy-pasteable.
- Bare URLs must be wrapped in `<>` or formatted as `[label](url)`.

**Nested code fences** (CommonMark 0.31.2 §4.5): the outer fence must use more backticks
than any fence inside it. Use 4 backticks for any fence that wraps a 3-backtick block:

````markdown
Outer fence (4 backticks) wrapping an inner fence:

```python
print("hello")
```
````

When writing skills or templates that include Markdown examples with code fences,
always use 4+ backtick outer fences to prevent the parser from closing early.

**Docsify conventions:**

- `_sidebar.md` for navigation; `_coverpage.md` for landing page.
- `{docsify-ignore}` excludes a heading from the sidebar;
  `{docsify-ignore-all}` excludes the entire file.
- `index.html` must set `loadSidebar: true` and `subMaxLevel: 2`.
- Relative links only between docs; no absolute paths.

## Docker

**Dockerfile style** (from `github.com/droxey/dockerfiles`):

- Banner comment block at top, title centered between dashes:

```text
# ---------------------------------------------------------------------------- #
#                               Image Title Here                               #
# ---------------------------------------------------------------------------- #
```

- `LABEL DESCRIPTION` and `LABEL MAINTAINER` immediately after `FROM`
- `ENV` for runtime-configurable values; `ARG` for build-time args
- Comment above each logical `RUN` block describing what it does
- `ADD` for remote URLs; `COPY` for local files
- `WORKDIR` set before `ENTRYPOINT`/`CMD`
- `CMD` in exec form: `CMD ["executable", "param1"]`

**Base images**: Alpine preferred for minimal images.
Pin to minor version in production (`alpine:3.21`, not `alpine:latest`).
For Debian-based images, use `-slim` variants.

**Multi-stage builds**: use named stages (`FROM golang:1.24-alpine AS builder`).
Copy only the final artifact into a minimal prod stage (e.g., `scratch` or `alpine`).
Build tools stay in the builder stage, out of the final image.
Target a specific stage with `docker build --target <stage>`.

**`apt-get`**: chain `update` + `install` in one `RUN`, use `--no-install-recommends`,
sort packages alphanumerically, and clean up in the same layer:

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        package-a \
        package-b \
    && rm -rf /var/lib/apt/lists/*
```

**Piped commands**: prefix with `set -o pipefail &&` so failures mid-pipe don't silently succeed:

```dockerfile
RUN set -o pipefail && curl -fsSL https://example.com/script.sh | bash
```

**`.dockerignore`**: always include one.
Exclude `.git`, local env files, and anything not needed in the build context.

**Compose**: use `compose.yaml` (preferred filename, not `docker-compose.yml`).
Use `docker compose` (v2, no hyphen).
For production overrides, use a separate `compose.production.yaml` merged at deploy time:

```bash
docker compose -f compose.yaml -f compose.production.yaml up -d
```

Production services get `restart: always`. No bind mounts for code in production —
code lives inside the image.

**CapRover**: every deployable repo needs a `captain-definition` at the root:

```json
{ "schemaVersion": 2, "dockerfilePath": "./Dockerfile" }
```

For image-based deploys: `{ "schemaVersion": 2, "imageName": "registry.example.com/app:tag" }`

Deploy commands:

```bash
caprover deploy -a appname           # from current directory
caprover deploy -i image:tag -a app  # specific image
```

Pre-deploy checklist: `captain-definition` at root, Dockerfile builds locally first,
all env vars set in CapRover dashboard (never baked into image),
healthcheck endpoint exposed, named volumes for persistent state,
TLS via CapRover's built-in Let's Encrypt.

**Auto-deploy via webhook**: in CapRover app settings, configure repo + branch + credentials,
then copy the generated webhook URL into GitHub → Settings → Webhooks
(content type `application/json`, push event only).
Every push to the tracked branch triggers a build.
Prefer this over manual `caprover deploy` for any branch that maps to a running environment.

## Contexts

Lean system prompts (~50-100 tokens) that focus a session without duplicating rules:

- `contexts/dev.md` — development focus
- `contexts/review.md` — code review focus
- `contexts/security.md` — security audit focus
- `contexts/teach.md` — educational content creation

GitHub Copilot also supports **path-specific instructions**
(`.github/instructions/NAME.instructions.md`) that apply only when Copilot is working
on files matching a path glob.
Use these for language- or directory-scoped guidance that would be noise in the repo-wide file.

## Autonomy Model

Three tiers:

1. **Tier 1**: Manual approval — unfamiliar repos, production-touching work
2. **Tier 2**: `allowedTools` auto-approve read-only ops — familiar codebases
3. **Tier 3**: `--dangerously-skip-permissions` inside a container only — never on host

Never run Tier 3 outside a sandboxed container. Never grant access to production credentials.
