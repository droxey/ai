#!/usr/bin/env node

// Hook script: suggests compaction at logical phase transitions.
// Reads tool input from stdin, tracks edit count, and suggests
// compaction after sustained editing phases.

const fs = require("fs");
const path = require("path");
const os = require("os");

const STATE_FILE = path.join(os.tmpdir(), ".claude-compact-state.json");
const EDIT_THRESHOLD = 20;

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { editCount: 0, lastSuggestion: 0 };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const state = loadState();
  state.editCount++;

  const now = Date.now();
  const timeSinceLast = now - state.lastSuggestion;
  const fiveMinutes = 5 * 60 * 1000;

  if (state.editCount >= EDIT_THRESHOLD && timeSinceLast > fiveMinutes) {
    process.stderr.write(
      "[Compact] You've made " +
        state.editCount +
        " edits. Consider compacting if you're transitioning phases.\n"
    );
    state.editCount = 0;
    state.lastSuggestion = now;
  }

  saveState(state);
  process.stdout.write(data);
});
