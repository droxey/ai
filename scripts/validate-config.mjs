#!/usr/bin/env node

// Validates the structural integrity of the Claude Code configuration.
// Run: node scripts/validate-config.mjs
// Or:  npm run validate

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`  ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.error(`  WARN:  ${msg}`);
  warnings++;
}

function ok(msg) {
  console.log(`  OK:    ${msg}`);
}

// 1. Validate settings.json
console.log("\n[1/5] Validating settings.json");
const settingsPath = path.join(ROOT, "settings.json");
try {
  const raw = fs.readFileSync(settingsPath, "utf8");
  const settings = JSON.parse(raw);

  if (!settings.hooks) {
    warn("No hooks defined in settings.json");
  } else {
    const hookTypes = ["PreToolUse", "PostToolUse"];
    for (const type of hookTypes) {
      const hookGroup = settings.hooks[type];
      if (!hookGroup) continue;
      for (const entry of hookGroup) {
        if (!entry.matcher) error(`${type} hook missing matcher`);
        if (!entry.hooks?.length) error(`${type} hook missing hooks array`);
        if (!entry.description) warn(`${type} hook missing description`);
      }
    }
  }
  ok("settings.json is valid JSON with expected structure");
} catch (e) {
  error(`settings.json: ${e.message}`);
}

// 2. Validate all skill directories have skill.md
console.log("\n[2/5] Validating skills");
const skillsDir = path.join(ROOT, "skills");
if (fs.existsSync(skillsDir)) {
  const skillDirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const dir of skillDirs) {
    const skillFile = path.join(skillsDir, dir.name, "skill.md");
    if (!fs.existsSync(skillFile)) {
      error(`skills/${dir.name}/ missing skill.md`);
    } else {
      const content = fs.readFileSync(skillFile, "utf8");
      if (content.trim().length < 50) {
        warn(`skills/${dir.name}/skill.md seems too short`);
      }
      if (!content.startsWith("# ")) {
        warn(`skills/${dir.name}/skill.md missing top-level heading`);
      }
      ok(`skills/${dir.name}/skill.md exists`);
    }
  }
} else {
  error("skills/ directory not found");
}

// 3. Validate all rule files
console.log("\n[3/5] Validating rules");
const rulesDir = path.join(ROOT, "rules");
if (fs.existsSync(rulesDir)) {
  function walkRules(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkRules(fullPath);
      } else if (entry.name.endsWith(".md")) {
        const content = fs.readFileSync(fullPath, "utf8");
        const relPath = path.relative(ROOT, fullPath);
        if (content.trim().length < 20) {
          warn(`${relPath} seems too short`);
        }
        if (!content.startsWith("# ")) {
          warn(`${relPath} missing top-level heading`);
        }
        ok(`${relPath} valid`);
      }
    }
  }
  walkRules(rulesDir);
} else {
  error("rules/ directory not found");
}

// 4. Validate markdown code blocks have language tags
console.log("\n[4/5] Validating code blocks in markdown files");
function findMarkdownFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

const mdFiles = findMarkdownFiles(ROOT);
for (const file of mdFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(ROOT, file);
  const codeBlockRegex = /^```(\w*)$/gm;
  let match;
  let lineNum = 0;
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/^```\s*$/.test(lines[i])) {
      // Check if this is an opening block (not a closing one)
      const prevBlocks = lines
        .slice(0, i)
        .filter((l) => l.startsWith("```")).length;
      if (prevBlocks % 2 === 0) {
        warn(`${relPath}:${i + 1} code block without language tag`);
      }
    }
  }
}
ok("Code block validation complete");

// 5. Validate internal file references in PLAN.md
console.log("\n[5/5] Validating PLAN.md references");
const planPath = path.join(ROOT, "PLAN.md");
if (fs.existsSync(planPath)) {
  const planContent = fs.readFileSync(planPath, "utf8");
  const dirRefs = planContent.match(
    /(?:skills|rules|hooks|contexts|templates)\/[\w-]+/g
  );
  if (dirRefs) {
    const unique = [...new Set(dirRefs)];
    for (const ref of unique) {
      const fullPath = path.join(ROOT, ref);
      if (!fs.existsSync(fullPath)) {
        // Check if it's a directory reference with a file inside
        const asDir = fullPath;
        const asFile = fullPath + ".md";
        const skillFile = path.join(fullPath, "skill.md");
        if (
          !fs.existsSync(asDir) &&
          !fs.existsSync(asFile) &&
          !fs.existsSync(skillFile)
        ) {
          warn(`PLAN.md references ${ref} but path not found`);
        }
      }
    }
  }
  ok("PLAN.md reference check complete");
} else {
  warn("PLAN.md not found");
}

// Summary
console.log("\n---");
console.log(`Validation complete: ${errors} errors, ${warnings} warnings`);
process.exit(errors > 0 ? 1 : 0);
