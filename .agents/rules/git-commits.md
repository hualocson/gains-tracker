# Git commit rules

## Atomic commits

Each commit is **one logical change** — a single, self-contained unit of work.

- **One concern per commit.** Do not mix unrelated changes (e.g. a bug fix and a
  refactor, or a feature and a dependency bump) in the same commit. If a change
  description needs the word "and", it is probably two commits.
- **Each commit must stand on its own.** Every commit must independently pass
  lint and typecheck:
  - `bun run lint`
  - `bun run typecheck`
    Never commit a state that is knowingly broken. Run `npm run build` before
    pushing (see `AGENTS.md`).
- **Split by hunk when a file spans concerns.** If one file contains changes
  belonging to two logical commits, stage the relevant hunks separately
  (`git add -p`, or stage controlled file states) so each commit is clean.
- **Order commits so history builds forward.** A reviewer reading commits
  top-to-bottom should see the change assembled in a sensible sequence, each
  step compiling.

## Commit messages

Follow **Conventional Commits**: `<type>: <summary>`.

- Types in use: `feat`, `fix`, `refactor`, `docs`, `chore`, `build`, `test`.
- Summary is lowercase, imperative, and concise — describe the change, not the
  process. Skip trailing punctuation.
- Add a body only when the _why_ is not obvious from the summary.

Examples:

```
feat: add weight-entry chart to progress screen
fix: exclude sw.js from auth middleware so the PWA service worker registers
chore: switch package manager to bun
```
