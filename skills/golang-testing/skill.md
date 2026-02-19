# Go Testing

Patterns for table-driven tests, testcontainers, and test organization.

## Table-Driven Tests

```go
func TestParseConfig(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    *Config
        wantErr bool
    }{
        {
            name:  "valid yaml",
            input: "port: 8080\nhost: localhost",
            want:  &Config{Port: 8080, Host: "localhost"},
        },
        {
            name:    "empty input",
            input:   "",
            wantErr: true,
        },
        {
            name:    "invalid port",
            input:   "port: -1",
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            got, err := ParseConfig([]byte(tt.input))
            if tt.wantErr {
                require.Error(t, err)
                return
            }
            require.NoError(t, err)
            assert.Equal(t, tt.want, got)
        })
    }
}
```

## Testcontainers

```go
func setupPostgres(t *testing.T) *sql.DB {
    t.Helper()
    ctx := context.Background()

    container, err := postgres.Run(ctx, "postgres:16-alpine",
        postgres.WithDatabase("testdb"),
        postgres.WithUsername("test"),
        postgres.WithPassword("test"),
        testcontainers.WithWaitStrategy(
            wait.ForLog("database system is ready to accept connections").
                WithOccurrence(2).
                WithStartupTimeout(30*time.Second),
        ),
    )
    require.NoError(t, err)
    t.Cleanup(func() { container.Terminate(ctx) })

    connStr, err := container.ConnectionString(ctx, "sslmode=disable")
    require.NoError(t, err)

    db, err := sql.Open("postgres", connStr)
    require.NoError(t, err)
    t.Cleanup(func() { db.Close() })

    return db
}
```

## HTTP Handler Tests

```go
func TestGetUser(t *testing.T) {
    // Arrange
    svc := &mockUserService{
        user: &User{ID: "123", Name: "Alice"},
    }
    handler := NewUserHandler(svc)

    // Act
    req := httptest.NewRequest("GET", "/users/123", nil)
    rec := httptest.NewRecorder()
    handler.ServeHTTP(rec, req)

    // Assert
    assert.Equal(t, http.StatusOK, rec.Code)
    var got User
    json.NewDecoder(rec.Body).Decode(&got)
    assert.Equal(t, "Alice", got.Name)
}
```

## Test Helpers

```go
func newTestLogger(t *testing.T) *slog.Logger {
    t.Helper()
    return slog.New(slog.NewTextHandler(io.Discard, nil))
}

func mustReadFixture(t *testing.T, path string) []byte {
    t.Helper()
    data, err := os.ReadFile(filepath.Join("testdata", path))
    require.NoError(t, err)
    return data
}
```

## Golden Files

```go
func TestRenderTemplate(t *testing.T) {
    got := renderTemplate(input)
    golden := filepath.Join("testdata", t.Name()+".golden")

    if *update {
        os.WriteFile(golden, []byte(got), 0644)
    }
    want, _ := os.ReadFile(golden)
    assert.Equal(t, string(want), got)
}
```

## Property-Based Tests (Rapid)

```go
import "pgregory.net/rapid"

func TestParseConfigRoundTrip(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        port := rapid.IntRange(1, 65535).Draw(t, "port")
        host := rapid.StringMatching(`[a-z]{1,20}`).Draw(t, "host")

        cfg := &Config{Port: port, Host: host}
        data, err := cfg.Marshal()
        require.NoError(t, err)

        parsed, err := ParseConfig(data)
        require.NoError(t, err)
        assert.Equal(t, cfg, parsed)
    })
}

func TestNormalizePath(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        path := rapid.String().Draw(t, "path")
        result := NormalizePath(path)
        assert.NotEmpty(t, result)
    })
}
```

Use `rapid` for round-trip properties, idempotency checks, and functions that must be total (never panic). Prefer over `testing/quick` for better shrinking and generation.

## Benchmark Tests

```go
func BenchmarkParseConfig(b *testing.B) {
    input := mustReadFixture(b, "large-config.yaml")
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        ParseConfig(input)
    }
}

func BenchmarkGetUser(b *testing.B) {
    db := setupPostgres(b)
    seedUsers(b, db, 1000)
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        GetUserByID(db, "test-id-500")
    }
}
```

Run `go test -bench=. -benchmem ./...` in CI. Compare against baselines with `benchstat`.

## Conventions

- `testdata/` directory for fixtures, golden files, and test configs.
- `_test.go` suffix. `_integration_test.go` with build tag for slow tests.
- `go test -race -count=1 -timeout=60s ./...` as CI command.
- `go test -bench=. -benchmem ./...` for performance regression checks.
- Use `require` for preconditions (fail fast), `assert` for verifications (collect all).
