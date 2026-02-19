import { describe, it, expect } from "vitest";
import { shouldWarn, processInput } from "./warn-git-push.mjs";

describe("warn-git-push", () => {
  describe("shouldWarn", () => {
    it("returns true for git push", () => {
      expect(shouldWarn("git push origin main")).toBe(true);
    });

    it("returns true for git push with flags", () => {
      expect(shouldWarn("git push -u origin feature")).toBe(true);
    });

    it("returns false for git status", () => {
      expect(shouldWarn("git status")).toBe(false);
    });

    it("returns false for git diff", () => {
      expect(shouldWarn("git diff HEAD~1")).toBe(false);
    });

    it("returns false for git pull", () => {
      expect(shouldWarn("git pull origin main")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(shouldWarn("")).toBe(false);
    });
  });

  describe("processInput", () => {
    it("warns on git push command in tool input", () => {
      const input = JSON.stringify({
        tool_input: { command: "git push origin main" },
      });
      const result = processInput(input);

      expect(result.warn).toBe(true);
      expect(result.output).toBe(input);
    });

    it("does not warn on non-push commands", () => {
      const input = JSON.stringify({
        tool_input: { command: "git status" },
      });
      const result = processInput(input);

      expect(result.warn).toBe(false);
      expect(result.output).toBe(input);
    });

    it("passes through input unmodified", () => {
      const input = JSON.stringify({
        tool_input: { command: "git push -u origin feature" },
      });
      const result = processInput(input);

      expect(result.output).toBe(input);
    });

    it("handles missing tool_input gracefully", () => {
      const input = JSON.stringify({ other: "data" });
      const result = processInput(input);

      expect(result.warn).toBe(false);
      expect(result.output).toBe(input);
    });

    it("handles missing command gracefully", () => {
      const input = JSON.stringify({ tool_input: {} });
      const result = processInput(input);

      expect(result.warn).toBe(false);
      expect(result.output).toBe(input);
    });

    it("handles malformed JSON gracefully", () => {
      const input = "not valid json{{{";
      const result = processInput(input);

      expect(result.warn).toBe(false);
      expect(result.output).toBe(input);
    });

    it("handles empty string gracefully", () => {
      const result = processInput("");

      expect(result.warn).toBe(false);
      expect(result.output).toBe("");
    });
  });
});
