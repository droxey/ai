import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { loadState, saveState, evaluate } from "./suggest-compact.mjs";

const TEST_STATE_FILE = path.join(
  os.tmpdir(),
  ".claude-compact-state-test.json"
);

describe("suggest-compact", () => {
  beforeEach(() => {
    try {
      fs.unlinkSync(TEST_STATE_FILE);
    } catch {
      // ignore missing file
    }
  });

  afterEach(() => {
    try {
      fs.unlinkSync(TEST_STATE_FILE);
    } catch {
      // ignore missing file
    }
  });

  describe("loadState", () => {
    it("returns default state when file does not exist", () => {
      const state = loadState(TEST_STATE_FILE);
      expect(state).toEqual({ editCount: 0, lastSuggestion: 0 });
    });

    it("loads existing state from file", () => {
      const saved = { editCount: 10, lastSuggestion: 1000 };
      fs.writeFileSync(TEST_STATE_FILE, JSON.stringify(saved));

      const state = loadState(TEST_STATE_FILE);
      expect(state).toEqual(saved);
    });

    it("returns default state when file contains invalid JSON", () => {
      fs.writeFileSync(TEST_STATE_FILE, "not json{{{");

      const state = loadState(TEST_STATE_FILE);
      expect(state).toEqual({ editCount: 0, lastSuggestion: 0 });
    });
  });

  describe("saveState", () => {
    it("persists state to file", () => {
      const state = { editCount: 5, lastSuggestion: 2000 };
      saveState(state, TEST_STATE_FILE);

      const raw = fs.readFileSync(TEST_STATE_FILE, "utf8");
      expect(JSON.parse(raw)).toEqual(state);
    });
  });

  describe("evaluate", () => {
    it("increments edit count below threshold without suggesting", () => {
      const state = { editCount: 0, lastSuggestion: 0 };
      const result = evaluate(state, 1000);

      expect(result.suggest).toBe(false);
      expect(result.state.editCount).toBe(1);
    });

    it("suggests compaction when threshold is reached", () => {
      const state = { editCount: 19, lastSuggestion: 0 };
      const now = Date.now();
      const result = evaluate(state, now);

      expect(result.suggest).toBe(true);
      expect(result.editCount).toBe(20);
      expect(result.state.editCount).toBe(0);
      expect(result.state.lastSuggestion).toBe(now);
    });

    it("suppresses suggestion within debounce window", () => {
      const now = Date.now();
      const recentSuggestion = now - 60 * 1000; // 1 minute ago
      const state = { editCount: 19, lastSuggestion: recentSuggestion };
      const result = evaluate(state, now);

      expect(result.suggest).toBe(false);
      expect(result.state.editCount).toBe(20);
    });

    it("re-enables suggestion after debounce window", () => {
      const now = Date.now();
      const oldSuggestion = now - 6 * 60 * 1000; // 6 minutes ago
      const state = { editCount: 19, lastSuggestion: oldSuggestion };
      const result = evaluate(state, now);

      expect(result.suggest).toBe(true);
      expect(result.state.editCount).toBe(0);
      expect(result.state.lastSuggestion).toBe(now);
    });

    it("resets counter after suggestion", () => {
      const state = { editCount: 25, lastSuggestion: 0 };
      const result = evaluate(state, Date.now());

      expect(result.suggest).toBe(true);
      expect(result.state.editCount).toBe(0);
    });

    it("does not suggest at exactly threshold minus one", () => {
      const state = { editCount: 18, lastSuggestion: 0 };
      const result = evaluate(state, Date.now());

      expect(result.suggest).toBe(false);
      expect(result.state.editCount).toBe(19);
    });
  });
});
