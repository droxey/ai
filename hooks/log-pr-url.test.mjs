import { describe, it, expect } from "vitest";
import { extractPrUrl, processInput } from "./log-pr-url.mjs";

describe("log-pr-url", () => {
  describe("extractPrUrl", () => {
    it("extracts PR URL from stdout", () => {
      const url = extractPrUrl(
        "Creating PR...\nhttps://github.com/org/repo/pull/42\nDone."
      );
      expect(url).toBe("https://github.com/org/repo/pull/42");
    });

    it("returns null when no URL present", () => {
      expect(extractPrUrl("no url here")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(extractPrUrl("")).toBeNull();
    });

    it("returns null for undefined", () => {
      expect(extractPrUrl(undefined)).toBeNull();
    });

    it("returns null for null", () => {
      expect(extractPrUrl(null)).toBeNull();
    });

    it("extracts first URL when multiple present", () => {
      const url = extractPrUrl(
        "https://github.com/org/repo/pull/1 and https://github.com/org/repo/pull/2"
      );
      expect(url).toBe("https://github.com/org/repo/pull/1");
    });
  });

  describe("processInput", () => {
    it("extracts PR URL from gh pr create output", () => {
      const input = JSON.stringify({
        tool_input: { command: "gh pr create --title 'test'" },
        tool_output: {
          stdout: "https://github.com/org/repo/pull/42",
        },
      });
      const result = processInput(input);

      expect(result.prUrl).toBe("https://github.com/org/repo/pull/42");
      expect(result.output).toBe(input);
    });

    it("returns null for non-PR commands", () => {
      const input = JSON.stringify({
        tool_input: { command: "gh issue list" },
        tool_output: {
          stdout: "https://github.com/org/repo/issues/1",
        },
      });
      const result = processInput(input);

      expect(result.prUrl).toBeNull();
    });

    it("returns null when gh pr create has no URL in output", () => {
      const input = JSON.stringify({
        tool_input: { command: "gh pr create --draft" },
        tool_output: { stdout: "Error: something went wrong" },
      });
      const result = processInput(input);

      expect(result.prUrl).toBeNull();
    });

    it("handles missing tool_output gracefully", () => {
      const input = JSON.stringify({
        tool_input: { command: "gh pr create" },
      });
      const result = processInput(input);

      expect(result.prUrl).toBeNull();
    });

    it("handles missing stdout gracefully", () => {
      const input = JSON.stringify({
        tool_input: { command: "gh pr create" },
        tool_output: {},
      });
      const result = processInput(input);

      expect(result.prUrl).toBeNull();
    });

    it("passes through input unmodified", () => {
      const input = JSON.stringify({
        tool_input: { command: "gh pr create" },
        tool_output: {
          stdout: "https://github.com/org/repo/pull/99",
        },
      });
      const result = processInput(input);

      expect(result.output).toBe(input);
    });

    it("handles malformed JSON gracefully", () => {
      const input = "broken json{{{";
      const result = processInput(input);

      expect(result.prUrl).toBeNull();
      expect(result.output).toBe(input);
    });

    it("handles empty string gracefully", () => {
      const result = processInput("");

      expect(result.prUrl).toBeNull();
      expect(result.output).toBe("");
    });
  });
});
