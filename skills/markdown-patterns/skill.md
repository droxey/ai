# Markdown Patterns

Patterns for documentation, rules, skills, and project templates in this configuration.

## Rule File Structure

Rules are terse, always-loaded, and budget-conscious. Target 10-15 bullet points, under 500 tokens.

```markdown
# [Language] [Topic]

Optional one-line context sentence.

- First rule. Most important.
- Second rule. Builds on first.
- ...
- Last rule. Standard command or summary.
```

No code blocks in rules. No headings beyond `#`. Rules say *what*; skills say *how*.

## Skill File Structure

Skills are on-demand reference material. Code examples welcome. Target 50-120 lines.

```markdown
# [Skill Name]

One-line description of what this skill covers.

## Section Name

Explanation paragraph.

\```language
// code example
\```

## Another Section

- Bullet points for guidelines
- Tables for comparison data
```

## Project Template Structure

Templates are project-level CLAUDE.md starters. Target 200-400 tokens.

```markdown
# Project: [name]

One-line description. Stack summary.

## Stack
Language version, framework, key dependencies.

## Build & Test
build-command
test-command
lint-command

## Structure
Brief layout: entry-point -> internal -> shared

## Preferred Approaches
- Constraint 1
- Constraint 2

## Notes
[Project-specific context]
```

## Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| data     | data     | data     |
| data     | data     | data     |
```

Align columns for source readability. Use tables for structured comparisons, audit findings, and token budgets.

## Collapsible Sections

```markdown
<details>
<summary>Click to expand</summary>

Long content that doesn't need to be visible by default.
Useful for verbose logs, full configs, or optional context.

</details>
```

Use sparingly. Prefer concise content over hidden content.

## Admonitions (GitHub-Flavored)

```markdown
> [!NOTE]
> Informational context that supplements the main content.

> [!WARNING]
> Critical information about potential pitfalls or breaking changes.

> [!TIP]
> Optional advice for better results.
```

Supported in GitHub: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`.

## Link Patterns

```markdown
<!-- Inline: default for most links -->
See [PLAN.md](PLAN.md) for the full strategy.

<!-- Reference-style: when same URL appears 3+ times -->
The [research][autonomy] shows that [effective oversight][autonomy] improves outcomes.

[autonomy]: https://anthropic.com/research/measuring-agent-autonomy
```

## Badge Patterns

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
```

Use badges in README.md only. Keep to 3-5 maximum. Order: license, CI status, version, coverage.

## Token-Efficient Writing

- Front-load the important information. Models read top-down.
- One concept per bullet. Compound bullets waste tokens on both halves.
- Avoid filler: "It is important to note that" -> just state the fact.
- Use code identifiers in backticks: `shellcheck`, `pytest`, `go vet`.
- Prefer bullet lists over prose for instructions. Bullets parse faster.
- Skip obvious context. If the heading says "Go Testing", don't start bullets with "When testing Go code...".
