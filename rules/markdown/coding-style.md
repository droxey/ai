# Markdown Style

Markdown drives documentation, rules, skills, and project templates in this config. Consistency matters for token efficiency and readability.

- CommonMark as the baseline. GitHub-Flavored Markdown (GFM) extensions (tables, admonitions, task lists) are allowed but must be flagged as GFM-only when portability matters.
- One sentence per line. Enables clean diffs and easier review.
- ATX headings (`#`) only. No setext (underline) headings. One blank line before headings.
- Heading hierarchy: never skip levels. `#` then `##` then `###`. No orphan `####`.
- Fenced code blocks with language identifier. No indented code blocks. Nest fences by increasing backtick count on the outer fence (4+ wrapping 3).
- Unordered lists use `-`, not `*` or `+`. Consistent across all files.
- Ordered lists use `1.` for every item (auto-numbering). Prevents renumbering churn.
- Links: prefer `[text](url)` inline. Use reference-style `[text][id]` only when the same URL appears 3+ times.
- No trailing whitespace. No multiple consecutive blank lines.
- Tables: use pipes with header separator. Align for readability when practical. GFM extension.
- Keep lines under 120 characters where possible. Break long URLs onto their own line.
- `markdownlint` recommended for linting. Configure `.markdownlint.json` per project to disable inapplicable rules.
- Prefer pure markdown. HTML (`<details>`, `<summary>`) only when no markdown equivalent exists.
