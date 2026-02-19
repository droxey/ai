# Markdown Patterns

Patterns for documentation, rules, skills, and project templates in this configuration. CommonMark baseline; GFM extensions noted where used.

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

Use 4+ backticks on the outer fence when nesting code blocks inside markdown examples:

````markdown
# [Skill Name]

One-line description of what this skill covers.

## Section Name

Explanation paragraph.

```language
// code example
```

## Another Section

- Bullet points for guidelines
- Tables for comparison data
````

For deeper nesting (a skill showing how to write a skill that contains code), increase the outer fence to 5+ backticks. Each nesting level adds one backtick to the wrapper.

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

## Tables (GFM)

Tables are a GFM extension. Not rendered in strict CommonMark parsers.

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| data     | data     | data     |
| data     | data     | data     |
```

Align columns for source readability. Use tables for structured comparisons, audit findings, and token budgets.

## Collapsible Sections (HTML)

Not markdown -- raw HTML. Works on GitHub, most renderers, and Claude Code output. Use when the content is optional or verbose.

```html
<details>
<summary>Click to expand</summary>

Long content here. Blank line after summary tag is required for
markdown rendering inside the details block.

</details>
```

Use sparingly. Prefer concise content over hidden content.

## Admonitions (GFM-Only)

GitHub-specific syntax. Renders as styled callout boxes on GitHub. Falls back to plain blockquotes elsewhere.

```markdown
> [!NOTE]
> Informational context that supplements the main content.

> [!WARNING]
> Critical information about potential pitfalls or breaking changes.
```

Supported types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`. Not part of CommonMark.

## Link Patterns

```markdown
<!-- Inline: default for most links -->
See [PLAN.md](PLAN.md) for the full strategy.

<!-- Reference-style: when same URL appears 3+ times -->
The [research][autonomy] shows that [effective oversight][autonomy] improves outcomes.

[autonomy]: https://anthropic.com/research/measuring-agent-autonomy
```

## Nested Fences

The key rule: outer fence must use strictly more backticks than any inner fence.

- 3 backticks for code with no inner fences (most cases)
- 4 backticks when wrapping markdown that contains 3-backtick blocks
- 5 backticks when wrapping examples that themselves contain 4-backtick blocks
- Tildes (`~~~`) also work but mixing fence styles reduces readability

This matters most in skills that document other skills or show markdown templates containing code examples.

## Token-Efficient Writing

- Front-load the important information. Models read top-down.
- One concept per bullet. Compound bullets waste tokens on both halves.
- Avoid filler: "It is important to note that" -> just state the fact.
- Use code identifiers in backticks: `shellcheck`, `pytest`, `go vet`.
- Prefer bullet lists over prose for instructions. Bullets parse faster.
- Skip obvious context. If the heading says "Go Testing", don't start bullets with "When testing Go code...".
