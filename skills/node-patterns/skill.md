# Node.js Patterns

Patterns for the cases where Node is unavoidable: hook scripts, CLI tooling, build automation.

## Hook Scripts

Hook scripts receive JSON on stdin and must write to stdout/stderr. This is the primary Node use case in this config.

```javascript
#!/usr/bin/env node

// Pattern: stdin JSON processor for Claude Code hooks
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(data);
    const toolName = input.tool_name || "";
    const command = input.tool_input?.command || "";

    // Your hook logic here
    if (/dangerous-pattern/.test(command)) {
      process.stderr.write("[Hook] Warning message for the user\n");
    }
  } catch {
    // Silently pass through on parse errors
  }
  process.stdout.write(data);
});
```

## CLI Tool Structure

```
bin/tool-name.mjs           # Entry point with shebang
lib/
  config.mjs                # Config loading (env vars, flags)
  commands/                  # One file per subcommand
  utils.mjs                 # Shared utilities
package.json                # "type": "module", "bin" field
```

## Error Handling

```javascript
// Wrap errors with context using Error.cause
async function fetchConfig(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    throw new Error(`fetch config from ${url}`, { cause: err });
  }
}
```

## Process Management

```javascript
import { spawn } from "node:child_process";

function runCommand(cmd, args, { timeout = 30_000 } = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "pipe", timeout });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${cmd} exited with ${code}: ${stderr}`));
    });
    proc.on("error", reject);
  });
}
```

## Configuration

```javascript
// Config precedence: flags > config file > .env > env vars
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function loadConfig() {
  const defaults = { port: 3000, logLevel: "info" };
  const envOverrides = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    logLevel: process.env.LOG_LEVEL,
  };
  // Remove undefined values
  const env = Object.fromEntries(
    Object.entries(envOverrides).filter(([, v]) => v !== undefined)
  );
  return { ...defaults, ...env };
}
```

## When to Use Node vs. Bash

| Use Case | Preference | Reason |
|----------|-----------|--------|
| Hook scripts (JSON processing) | Node | Bash JSON parsing is fragile |
| Simple file operations | Bash | Fewer moving parts |
| CLI with subcommands | Go | Better binary distribution |
| Build automation | Bash | Shell pipelines are native |
| Complex async orchestration | Node | Async/await beats background jobs |
| One-off scripts | Bash | No dependency overhead |
