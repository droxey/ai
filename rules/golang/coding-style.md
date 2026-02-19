# Go Coding Style

- Follow Effective Go and the Go Code Review Comments wiki.
- Errors are values. Wrap with `fmt.Errorf("context: %w", err)`. Define sentinel errors in `internal/errors.go`.
- No `init()` functions. Explicit initialization in `main()` or constructors.
- Accept interfaces, return structs. Keep interfaces small (1-3 methods).
- Use `slog` for structured logging. No `log.Fatal` outside `main()`.
- `context.Context` is the first parameter. Propagate cancellation.
- No naked returns. No named returns except for documentation in complex signatures.
- Group imports: stdlib, external, internal. `goimports` handles this.
- Prefer table-driven patterns for repetitive logic, not just tests.
- Use `go vet`, `staticcheck`, and `golangci-lint` in CI. Zero warnings policy.
- No global mutable state. Pass dependencies explicitly via structs or function params.
