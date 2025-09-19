# Repository Guidelines

## Project Structure & Module Organization

- Monorepo managed by pnpm and Turborepo (`pnpm-workspace.yaml` ties apps and packages together).
- Apps: `apps/reader` (Next.js ePub client on port 7127) and `apps/website` (marketing Next.js site on 7117).
- Packages: `packages/internal` (shared React/TS utilities), `packages/tailwind` (Tailwind preset), `packages/epubjs` (vendored reader engine/tests).
- Root configs (`tsconfig*.json`, `turbo.json`, `prettier.config.js`) and Docker tooling govern all workspaces.
- App assets and translations live in their respective `public/` directories; copy `.env.local.example` to `.env.local` per app for secrets.

## Build, Test, and Development Commands

- `pnpm install` — bootstrap dependencies; rerun after updating workspace packages.
- `pnpm dev` — launch all app `dev` scripts in parallel with hot reload.
- `pnpm --filter @flow/reader dev` — focus on a single app during debugging.
- `pnpm build` — run every workspace build; mirror what CI executes before releases.
- `pnpm lint` — aggregate ESLint + Next checks; respects Prettier formatting.
- `pnpm --filter @flow/epubjs test` — execute the Karma/Mocha suite (Chrome headless required).

## Coding Style & Naming Conventions

- TypeScript-first; prefer `.ts`/`.tsx` and share types via `packages/internal`.
- Prettier enforces 2-space indentation, single quotes, trailing commas, and no semicolons (`prettier.config.js`).
- ESLint extends Next.js defaults; fix warnings instead of suppressing unless documented.
- Components use PascalCase, hooks camelCase with a `use` prefix, route files follow path-based kebab-case.

## Testing Guidelines

- UI work relies on manual verification through `pnpm dev`; note smoke steps in PR descriptions until automated tests land.
- Write descriptive test names (e.g., `should render highlights menu`) and keep them deterministic across browsers.

## Commit & Pull Request Guidelines

- Use Conventional Commits (`feat:`, `fix:`, `chore(reader):`) mirroring the existing history/scopes.
- PRs should link issues, summarize UX changes, and attach screenshots or recordings for reader/website tweaks.
- Run `pnpm build`, `pnpm lint`, and targeted tests before opening a PR; call out known gaps or platform caveats.
