# Node.js Testing

vitest patterns for hook scripts, CLI tools, and stdin/stdout processors.

## Hook Script Testing

```javascript
// hooks/my-hook.test.mjs
import { describe, it, expect } from "vitest";
import { processInput } from "./my-hook.mjs";

describe("my-hook", () => {
  it("detects target command", () => {
    const input = JSON.stringify({
      tool_input: { command: "target-command --flag" },
    });
    const result = processInput(input);

    expect(result.matched).toBe(true);
    expect(result.output).toBe(input);
  });

  it("passes through non-matching commands", () => {
    const input = JSON.stringify({
      tool_input: { command: "other-command" },
    });
    const result = processInput(input);

    expect(result.matched).toBe(false);
    expect(result.output).toBe(input);
  });

  it("handles malformed JSON gracefully", () => {
    const result = processInput("not json{{{");

    expect(result.matched).toBe(false);
    expect(result.output).toBe("not json{{{");
  });
});
```

## Testable Hook Structure

```javascript
// hooks/example-hook.mjs
// Export pure functions for unit testing.
// Keep the stdin/stdout wiring at the bottom behind a main-module guard.

export function shouldAct(command) {
  return /target-pattern/.test(command);
}

export function processInput(raw) {
  try {
    const input = JSON.parse(raw);
    const cmd = input.tool_input?.command || "";
    return { output: raw, matched: shouldAct(cmd) };
  } catch {
    return { output: raw, matched: false };
  }
}

const isMainModule =
  process.argv[1] && import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => {
    const result = processInput(data);
    if (result.matched) {
      process.stderr.write("[Hook] Warning message\n");
    }
    process.stdout.write(result.output);
  });
}
```

## Fake Timers

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("time-dependent logic", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounces within window", () => {
    vi.setSystemTime(new Date("2026-01-15T10:00:00Z"));
    const now = Date.now();
    const recentAction = now - 60_000; // 1 minute ago

    const result = evaluate({ count: 20, lastAction: recentAction }, now);
    expect(result.shouldAct).toBe(false);
  });
});
```

## File System Mocking

```javascript
import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";

vi.mock("node:fs");

describe("state persistence", () => {
  it("falls back to defaults on read error", () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error("ENOENT");
    });

    const state = loadState();
    expect(state).toEqual({ count: 0, lastAction: 0 });
  });

  it("persists state to disk", () => {
    const state = { count: 5, lastAction: 1000 };
    saveState(state);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(state)
    );
  });
});
```

## CLI Tool Testing

```javascript
import { describe, it, expect } from "vitest";
import { spawn } from "node:child_process";

function runCli(args, stdin = "") {
  return new Promise((resolve) => {
    const proc = spawn("node", ["bin/tool.mjs", ...args], {
      stdio: "pipe",
      timeout: 5000,
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));
    if (stdin) proc.stdin.end(stdin);
    proc.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

describe("cli", () => {
  it("exits 0 on valid input", async () => {
    const { code, stdout } = await runCli(["--flag", "value"]);
    expect(code).toBe(0);
    expect(stdout).toContain("expected output");
  });
});
```

## Conventions

- Colocate tests: `my-hook.test.mjs` next to `my-hook.mjs`.
- Export pure logic functions. Keep stdin/stdout wiring behind main-module guard.
- Test stdin passthrough integrity: output must exactly match input.
- Test all error paths: malformed JSON, missing fields, empty input.
- `vitest --run --reporter=verbose` as CI command.
