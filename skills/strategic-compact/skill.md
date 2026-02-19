# Strategic Compaction

Proactive context management to maximize usable working context.

## When to Compact

Compact at natural phase transitions, not arbitrary token thresholds:

1. **Research → Plan**: After gathering information, before writing implementation plan.
2. **Plan → Implement**: After plan is approved, before writing code.
3. **Implement → Test**: After initial implementation, before test writing/debugging.
4. **Debug → Next Feature**: After resolving a bug, before moving to next task.
5. **Any → Handoff**: Before ending a session that will continue later.

## How to Compact

1. Summarize key decisions and context into a concise handoff note.
2. Include: current state, next steps, blockers, file paths touched.
3. Use `/compact` with a summary of what to preserve.

## Handoff Document Template

```markdown
## Session Handoff — [date]

### What was done
- [Completed task 1]
- [Completed task 2]

### Current state
- [Branch name, last commit]
- [What's working, what's not]

### Next steps
- [ ] [Task 1]
- [ ] [Task 2]

### Key decisions
- [Decision 1: chose X because Y]
- [Decision 2: chose A over B because C]

### Files touched
- `path/to/file.go` — [what changed]
- `path/to/other.py` — [what changed]
```

## Anti-Patterns

- Don't compact mid-debug. You lose stack trace context.
- Don't compact right after reading a large file. Summarize it first.
- Don't rely on auto-compact — it triggers at 80% capacity with no phase awareness.
- Don't start a new feature without compacting the previous one's context.
