<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Package manager

- Use **bun** for installing packages (`bun add`, `bun install`, `bun remove`).
- Use **npm** only for the build (`npm run build`).
- Use **bun** for every other command (`bun run dev`, `bun run lint`, `bun test`, etc.).

# After editing files

- Do not run `npm run build` to validate each individual change. Use the targeted checks below for the modified scope.
- Before pushing changes to GitHub, run `npm run build`.
- After editing any `.ts` or `.tsx` file, always run these checks for the modified file scope:
  - Format: `bunx prettier --write <modified-files>`
  - Lint: `bunx eslint <modified-files>`
  - Typecheck: `bunx tsc --noEmit`
- Whole-project scripts are also available: `bun run format`, `bun run lint`, `bun run typecheck`.
