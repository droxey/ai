# Bash Patterns

Patterns for shell scripts that glue together Go binaries, Python services, and Docker infrastructure.

## Script Template

```bash
#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

log() { printf '[%s] %s\n' "$(date -Iseconds)" "$*" >&2; }
die() { log "FATAL: $*"; exit 1; }

cleanup() {
    rm -rf "${TMPDIR:-}"
    # kill background jobs if any
    jobs -p | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT

main() {
    # script logic here
    :
}

main "$@"
```

## Argument Parsing

```bash
usage() {
    cat >&2 <<EOF
Usage: ${SCRIPT_NAME} [OPTIONS] <target>

Options:
    -e, --env ENV       Target environment (default: dev)
    -v, --verbose       Enable verbose output
    -h, --help          Show this help
EOF
    exit 1
}

parse_args() {
    local env="dev" verbose=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            -e|--env)     env="${2:?missing env value}"; shift 2 ;;
            -v|--verbose) verbose=true; shift ;;
            -h|--help)    usage ;;
            --)           shift; break ;;
            -*)           die "Unknown option: $1" ;;
            *)            break ;;
        esac
    done

    [[ $# -ge 1 ]] || { log "Error: <target> required"; usage; }
    readonly TARGET="$1"
    readonly ENV="$env"
    readonly VERBOSE="$verbose"
}
```

## Environment Validation

```bash
require_env() {
    local var
    for var in "$@"; do
        [[ -n "${!var:-}" ]] || die "Required env var not set: ${var}"
    done
}

require_commands() {
    local cmd
    for cmd in "$@"; do
        command -v "$cmd" >/dev/null 2>&1 || die "Required command not found: ${cmd}"
    done
}

# Fail fast at startup
require_env DATABASE_URL REDIS_URL
require_commands docker jq curl
```

## Temp Files and Directories

```bash
TMPDIR="$(mktemp -d "${TMPDIR:-/tmp}/${SCRIPT_NAME}.XXXXXXXXXX")"
readonly TMPDIR

# Temp file within managed dir (cleaned by trap)
local output="${TMPDIR}/output.json"
```

## Process Management

```bash
# Run with timeout
if ! timeout 30 docker compose up -d; then
    die "Docker compose failed to start within 30s"
fi

# Parallel execution with wait
pids=()
for svc in api worker scheduler; do
    deploy_service "$svc" &
    pids+=($!)
done

# Wait and collect failures
failures=0
for pid in "${pids[@]}"; do
    wait "$pid" || ((failures++))
done
[[ $failures -eq 0 ]] || die "${failures} service(s) failed to deploy"
```

## Signal Handling

```bash
# Graceful shutdown for wrapper scripts
shutdown=false
trap 'shutdown=true; log "Caught signal, shutting down..."' SIGTERM SIGINT

while [[ "$shutdown" == false ]]; do
    process_next_item || sleep 5
done

log "Clean shutdown complete"
```

## Retry Logic

```bash
retry() {
    local max_attempts="${1:?}"; shift
    local delay="${1:?}"; shift
    local attempt=1

    until "$@"; do
        if ((attempt >= max_attempts)); then
            log "Failed after ${attempt} attempts: $*"
            return 1
        fi
        log "Attempt ${attempt}/${max_attempts} failed, retrying in ${delay}s..."
        sleep "$delay"
        ((attempt++))
        ((delay *= 2))  # exponential backoff
    done
}

# Usage
retry 4 2 curl -sf "https://api.example.com/health"
```

## Safe File Operations

```bash
# Atomic write via temp + rename
write_config() {
    local target="$1" content="$2"
    local tmp="${target}.tmp.$$"
    printf '%s\n' "$content" > "$tmp"
    mv -f "$tmp" "$target"
}

# Safe directory check
[[ -d "$DEPLOY_DIR" ]] || die "Deploy directory does not exist: ${DEPLOY_DIR}"

# Read file with fallback
local config
config="$(cat "$CONFIG_FILE" 2>/dev/null)" || die "Cannot read config: ${CONFIG_FILE}"
```

## When to Stop Using Bash

| Symptom | Switch to |
|---------|-----------|
| JSON processing beyond `jq` one-liners | Go or Python |
| Complex argument parsing (subcommands) | Go (cobra) |
| More than 200 lines | Go or Python |
| Error handling becomes nested conditionals | Go |
| Need unit tests with mocking | Python (pytest) |
| Async operations or HTTP servers | Go or Python |
