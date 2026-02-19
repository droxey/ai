# Bash Coding Style

Bash is glue in this stack. Scripts wire together Go binaries, Python services, and Docker. Keep them short, strict, and shellcheck-clean.

- Start every script with `set -euo pipefail`. No exceptions.
- `shellcheck` on all `.sh` files. Zero warnings policy. Run in CI.
- Quote all variable expansions: `"${var}"`, not `$var`. Unquoted expansion is a bug.
- Use `[[ ]]` for conditionals, not `[ ]`. Handles empty strings and regex safely.
- Functions over inline logic when a block exceeds 10 lines. Declare with `name() {`, not `function name`.
- Local variables in functions: `local var`. Never leak state to the caller.
- Use `readonly` for constants. `readonly LOG_DIR="/var/log/app"`.
- Prefer `printf` over `echo` for formatted output. `echo` behavior varies across shells.
- No `eval`. No unquoted command substitution in conditionals. No parsing `ls` output.
- Trap cleanup: `trap cleanup EXIT`. Clean up temp files, kill background jobs.
- Use `mktemp` for temporary files. Never hardcode `/tmp/myfile`.
- Log to stderr (`>&2`) for diagnostic output. Reserve stdout for data and piping.
- Keep scripts under 200 lines. If longer, it should be a Go CLI or Python script.
