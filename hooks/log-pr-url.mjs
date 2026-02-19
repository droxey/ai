#!/usr/bin/env node

// Hook script: extracts and logs PR URL after gh pr create.
// Reads tool output JSON from stdin, checks for gh pr create commands,
// extracts GitHub PR URL from stdout, writes it to stderr.

export function extractPrUrl(stdout) {
  const match = stdout?.match(/https:\/\/github.com[^\s]+/);
  return match ? match[0] : null;
}

export function processInput(raw) {
  try {
    const input = JSON.parse(raw);
    const cmd = input.tool_input?.command || "";
    if (!/gh pr create/.test(cmd)) {
      return { output: raw, prUrl: null };
    }
    const stdout = input.tool_output?.stdout || "";
    const prUrl = extractPrUrl(stdout);
    return { output: raw, prUrl };
  } catch {
    return { output: raw, prUrl: null };
  }
}

const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => {
    const result = processInput(data);
    if (result.prUrl) {
      process.stderr.write(`[Hook] PR created: ${result.prUrl}\n`);
    }
    process.stdout.write(result.output);
  });
}
