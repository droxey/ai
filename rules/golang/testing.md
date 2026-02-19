# Go Testing

- Table-driven tests as the default pattern. Each case: name, input, expected, assertion.
- Use `t.Run()` for subtests. Enables selective execution and clear failure messages.
- `t.Helper()` on all test helper functions. Better error location reporting.
- `t.Parallel()` on independent tests. Catch shared state bugs early.
- Testcontainers for integration tests (Postgres, Redis, etc.). No mocking databases.
- Use `httptest.NewServer` for HTTP client testing. `httptest.NewRecorder` for handler testing.
- Golden files for complex output comparisons. Update with `-update` flag.
- Test error paths explicitly. Verify error wrapping with `errors.Is` and `errors.As`.
- No `time.Sleep` in tests. Use channels, `t.Deadline()`, or `testify/assert.Eventually`.
- `go test -race -count=1 ./...` as the standard test command. Always race-detect.
- `pgregory.net/rapid` for property-based tests. Prefer over `testing/quick` for better shrinking.
- `go test -bench=. -benchmem ./...` for performance regressions. Compare with `benchstat`.
