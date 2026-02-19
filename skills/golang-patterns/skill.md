# Go Patterns

Idiomatic Go patterns for CLI tools and services.

## Project Layout

```
cmd/appname/main.go     # Entry point, wiring only
internal/
  config/config.go      # Viper config loading
  errors/errors.go      # Sentinel errors
  domain/               # Business logic (no external deps)
  handler/              # HTTP/gRPC handlers
  repository/           # Data access
  service/              # Orchestration layer
pkg/                    # Shared libraries (if truly reusable)
```

## Error Handling

```go
// Define sentinels
var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
)

// Wrap with context at each layer
func (s *Service) GetUser(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.Find(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }
    return user, nil
}

// Check at boundaries
if errors.Is(err, repository.ErrNotFound) {
    http.Error(w, "user not found", http.StatusNotFound)
    return
}
```

## Dependency Injection

```go
// Constructor with explicit deps
type Server struct {
    logger *slog.Logger
    db     *sql.DB
    cache  Cache  // Interface, not concrete type
}

func NewServer(logger *slog.Logger, db *sql.DB, cache Cache) *Server {
    return &Server{logger: logger, db: db, cache: cache}
}
```

## Configuration

```go
// Viper with flag precedence
func Load() (*Config, error) {
    viper.SetConfigName("config")
    viper.AddConfigPath(".")
    viper.AutomaticEnv()

    // Flags override everything
    pflag.String("port", "8080", "server port")
    pflag.Parse()
    viper.BindPFlags(pflag.CommandLine)

    if err := viper.ReadInConfig(); err != nil {
        if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
            return nil, fmt.Errorf("read config: %w", err)
        }
    }

    var cfg Config
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, fmt.Errorf("unmarshal config: %w", err)
    }
    return &cfg, nil
}
```

## Graceful Shutdown

```go
ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
defer stop()

srv := &http.Server{Addr: ":8080", Handler: mux}
go func() { srv.ListenAndServe() }()

<-ctx.Done()
shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
srv.Shutdown(shutdownCtx)
```

## Concurrency

- Use `errgroup.Group` for parallel tasks with shared error handling.
- Channels for communication, mutexes for state. Never both on the same resource.
- Always select with `ctx.Done()` to respect cancellation.
- Buffer channels when the producer shouldn't block. Document buffer size rationale.
