# Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Scope in parens when useful: `feat(auth): add JWT refresh`
- One logical change per commit. Atomic commits over kitchen-sink commits.
- Draft PRs by default. Mark ready only after CI passes and self-review.
- Branch naming: `feat/short-description`, `fix/issue-number`, `chore/cleanup-name`
- Trunk-based development. Short-lived branches. Rebase before merge.
- Never force-push to main/master. Force-push only on personal feature branches.
- Squash merge to main for clean history. Keep detailed commits on feature branches.
- Tag releases with semver. Annotated tags for production releases.
