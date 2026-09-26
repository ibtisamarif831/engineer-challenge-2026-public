# Repository Guidelines

## Project Structure & Architecture

Pulse is a small customer-feedback inbox split into two npm workspaces:

- `web/` contains the React + TypeScript single-page app. Start at `src/main.tsx`; UI components are in `src/components/`, and `src/api.ts` is the browser-to-server boundary.
- `server/` contains the Express + TypeScript API. `src/index.ts` defines routes, `src/db.ts` opens SQLite, `src/auth.ts` handles request authentication, `src/llm.ts` generates summaries, and `src/seed.ts` creates and seeds the database.
- SQLite data is stored in `server/pulse.db` (ignored by Git). There is no dedicated test or assets directory in the current repository.

The browser calls the API with JSON and a bearer token; the API reads or updates SQLite and returns JSON. Keep request/response shapes aligned with `web/src/types.ts`.

## Build, Test & Development Commands

- `npm install` installs dependencies for both workspaces.
- `npm run dev` starts the API at `localhost:4000` and the Vite app at `localhost:5173`.
- `npm run seed` recreates the SQLite tables and sample data; it deletes existing seeded database contents.
- `npm run build` type-checks and builds the web app. `npm run build --workspace server` type-checks the API.

No test runner or test script is configured. When adding tests, document the chosen runner and command here.

## Coding Style & Naming

Follow the existing TypeScript style: two-space indentation, single quotes, no semicolons, and trailing commas where useful. Use PascalCase for React components and filenames (for example, `ItemDetail.tsx`); use camelCase for functions and variables. Keep shared API data shapes in `web/src/types.ts` and API calls in `web/src/api.ts`. No formatter or linter is currently configured.

## Security & Configuration

Copy `server/.env.example` and `web/.env.example` to local `.env` files; never commit secrets. Treat the seeded credentials and current auth setup as development-only. Use parameterized SQL for new queries, especially when incorporating request data.

## Commits, Pull Requests & Guide Maintenance

Use Conventional Commits for every commit (for example, `feat: add feedback filters`, `fix: correct inbox pagination`, or `docs: update contributor guide`). Keep commits focused. Pull requests should explain the behavior change, note relevant routes or UI flows, and include screenshots for visible changes; mention any manual verification performed.

Update this guide when project structure, commands, conventions, or important implementation findings change. Keep repository-specific exploratory notes actionable and concise so future contributors can use them without rereading the whole codebase.
