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

## Conventions

- `testdata/` directory for fixtures, golden files, and test configs.
- `_test.go` suffix. `_integration_test.go` with build tag for slow tests.
- `go test -race -count=1 -timeout=60s ./...` as CI command.
- Use `require` for preconditions (fail fast), `assert` for verifications (collect all).
