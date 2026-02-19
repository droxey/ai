#!/usr/bin/env node

// Hook script: suggests compaction at logical phase transitions.
// Reads tool input from stdin, tracks edit count in a state file,
// and suggests compaction after sustained editing phases.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const DEFAULT_STATE_FILE = path.join(os.tmpdir(), ".claude-compact-state.json");
const EDIT_THRESHOLD = 20;
const DEBOUNCE_MS = 5 * 60 * 1000;

export function loadState(stateFile = DEFAULT_STATE_FILE) {
  try {
    return JSON.parse(fs.readFileSync(stateFile, "utf8"));
  } catch {
    return { editCount: 0, lastSuggestion: 0 };
  }
}

export function saveState(state, stateFile = DEFAULT_STATE_FILE) {
  fs.writeFileSync(stateFile, JSON.stringify(state));
}

export function evaluate(state, now = Date.now()) {
  const updated = { ...state, editCount: state.editCount + 1 };
  const timeSinceLast = now - updated.lastSuggestion;

  if (updated.editCount >= EDIT_THRESHOLD && timeSinceLast > DEBOUNCE_MS) {
    return {
      state: { editCount: 0, lastSuggestion: now },
      suggest: true,
      editCount: updated.editCount,
    };
  }

  return { state: updated, suggest: false, editCount: updated.editCount };
}

const isMainModule =
  process.argv[1] && import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => {
    const state = loadState();
    const result = evaluate(state);

    if (result.suggest) {
      process.stderr.write(
        `[Compact] You've made ${result.editCount} edits. Consider compacting if you're transitioning phases.\n`
      );
    }

    saveState(result.state);
    process.stdout.write(data);
  });
}
