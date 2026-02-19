# Testing

- Write tests before or alongside code, not as an afterthought.
- Target 80% coverage as a guideline, not a hard gate. Critical paths need higher coverage.
- Test behavior, not implementation. Tests should survive refactors.
- One assertion per test when practical. Name tests after the behavior they verify.
- Use fixtures and factories over raw object construction. Avoid shared mutable test state.
- Integration tests for boundaries (DB, APIs, file I/O). Unit tests for logic.
- Tests must be deterministic. No sleeping, no time-dependent assertions, no network calls in unit tests.
- Run the full suite before pushing. CI is a safety net, not the first line of defense.
- Flaky tests are bugs. Fix or delete them immediately.
