# Project: [name]

Go CLI tool. Single binary, no daemon.

## Stack
Go 1.22+, cobra for CLI, viper for config, slog for logging.

## Build & Test
go build -o bin/[name] ./cmd/[name]
go test ./... -race -count=1
golangci-lint run

## Structure
cmd/[name]/main.go → internal/ → pkg/ (if shared)

## Preferred Approaches
- Errors: wrap with fmt.Errorf + %w, define sentinels in internal/errors.go
- Config: viper with flags taking precedence. No .env in prod.
- Testing: table-driven. Testcontainers for integration.

## Notes
[Project-specific constraints, API endpoints, deployment target]
