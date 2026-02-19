#!/usr/bin/env node

// Hook script: warns before git push commands.
// Reads tool input JSON from stdin, checks for git push,
// writes warning to stderr, passes input through to stdout.

export function shouldWarn(command) {
  return /git push/.test(command);
}

export function processInput(raw) {
  try {
    const input = JSON.parse(raw);
    const cmd = input.tool_input?.command || "";
    const warn = shouldWarn(cmd);
    return { output: raw, warn };
  } catch {
    return { output: raw, warn: false };
  }
}

const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => {
    const result = processInput(data);
    if (result.warn) {
      process.stderr.write("[Hook] Review changes before push\n");
    }
    process.stdout.write(result.output);
  });
}
