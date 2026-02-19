# Node.js Coding Style

Node is last resort in this stack. These rules apply when Node is unavoidable — hook scripts, build tooling, or inheriting an existing Node project.

- ES modules (`import`/`export`) over CommonJS. Use `.mjs` extension or `"type": "module"` in package.json.
- `const` by default. `let` only when reassignment is necessary. Never `var`.
- `async`/`await` over raw Promises. Never mix callbacks and promises.
- Structured error handling: wrap with context, never swallow. Use `Error.cause` for chaining.
- No `console.log` in production. Use a structured logger (`pino` or `winston`).
- Validate all external input with `zod` at system boundaries.
- Use `node:` prefix for built-in modules: `import fs from 'node:fs/promises'`.
- Prefer `node:fs/promises` over callback-based `fs`.
- No global mutable state. Pass dependencies explicitly.
- `prettier` for formatting, `eslint` for linting. Single config, no conflicts.
- Pin dependencies. Use `package-lock.json`. Audit with `npm audit` before releases.
- TypeScript when the project warrants it. Plain JS for scripts and hooks.
