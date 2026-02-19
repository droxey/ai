# Bash Testing

- `bats-core` as the test framework. Install `bats-support` and `bats-assert` helpers.
- Colocate tests: `script.sh` has `script.bats` in the same directory or a `tests/` subdirectory.
- Use `setup()` and `teardown()` functions for temp dirs and fixtures.
- Test exit codes explicitly: `run script.sh --bad-flag; assert_failure`.
- Test stdout and stderr separately: `assert_output --partial "expected"`, `assert_line`.
- Use `load` to import shared helpers: `load test_helper/common`.
- Mock external commands by prepending a test `bin/` to `PATH` with stub scripts.
- No network calls in tests. Use fixture files for input data.
- `bats --tap tests/` as the standard test command. TAP output for CI integration.
- Test edge cases: empty input, missing env vars, permission errors, signals (SIGTERM, SIGINT).
