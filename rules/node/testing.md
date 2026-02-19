# Node.js Testing

- `vitest` as the default test runner. `jest` only when inheriting existing suites.
- Colocate tests: `foo.test.ts` next to `foo.ts`. No separate `__tests__/` directories.
- Use `describe`/`it` blocks. Name tests after behavior, not implementation.
- `beforeEach` for setup, `afterEach` for teardown. Avoid shared mutable state across tests.
- Mock external services with `msw` (Mock Service Worker) for HTTP. `vi.mock` for modules.
- No `setTimeout` or `sleep` in tests. Use fake timers: `vi.useFakeTimers()`.
- Snapshot tests sparingly — only for stable output like CLI help text or serialized configs.
- `vitest --run --reporter=verbose` as the standard test command.
- For hook scripts: test with fixture JSON piped to stdin, assert on stdout/stderr.
- Coverage: `vitest --coverage`. Same 80% target guideline as other languages.
