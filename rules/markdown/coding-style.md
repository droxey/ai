# Markdown Style

Markdown drives documentation, rules, skills, and project templates in this config. Consistency matters for token efficiency and readability.

- One sentence per line. Enables clean diffs and easier review.
- ATX headings (`#`) only. No setext (underline) headings. One blank line before headings.
- Heading hierarchy: never skip levels. `#` then `##` then `###`. No orphan `####`.
- Fenced code blocks with language identifier: ` ```go `, ` ```python `, ` ```bash `. No indented code blocks.
- Unordered lists use `-`, not `*` or `+`. Consistent across all files.
- Ordered lists use `1.` for every item (auto-numbering). Prevents renumbering churn.
- Links: prefer `[text](url)` inline. Use reference-style `[text][id]` only when the same URL appears 3+ times.
- No trailing whitespace. No multiple consecutive blank lines.
- Tables: use pipes with header separator. Align for readability when practical.
- Keep lines under 120 characters where possible. Break long URLs onto their own line.
- `markdownlint` (mdl or markdownlint-cli2) for linting. Zero warnings in CI.
- No HTML in markdown unless rendering requires it (e.g., `<details>` for collapsible sections).
