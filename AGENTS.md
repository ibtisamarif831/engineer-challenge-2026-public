# Repository Guidelines

## Project Structure & Architecture

Pulse is a small customer-feedback inbox split into two npm workspaces:

- `web/` contains the React + TypeScript single-page app. Start at `src/main.tsx`; UI components are in `src/components/`, and `src/api/` is the browser-to-server boundary, organized by feature (`auth`, `feedback`, `customers`, `users`, and `metrics`). The shared `client.ts` appends bearer tokens, serializes JSON bodies, checks HTTP errors, and decodes JSON or Blob responses. Tokens are passed from React state; feature modules own endpoint paths and API contracts.
- Shared React controls live in `web/src/components/ui/` (`Button`, `Field`, `Input`, `Select`, `Textarea`, `Checkbox`, and `Pagination`). Controls forward native props and refs; `Button` defaults to `type="button"`, so submit buttons must opt in. Use `Field` to label one control and `hideLabel` for visually hidden labels.
- `web/src/navigation/` owns lightweight History API routing and per-user, per-ticket drafts. Inbox URLs use `page`, `status`, and `q`; detail URLs use `/tickets/:id` and retain that query. Search replaces the current history entry; page/filter/ticket changes push entries. Static hosting must serve the SPA entry for ticket paths. Drafts persist in tab-scoped sessionStorage, with an in-memory fallback and unload warning if storage fails; sign-out confirms discard.
- Screen sections live in `components/inbox/` and `components/detail/`; shared feedback badges live in `components/feedback/`. `Brand` and `AppHeader` own shared application branding. Screen containers (`Inbox`, `ItemDetail`, `Login`, and `App`) retain API calls and state; section components receive values and callbacks. Preserve CSS classes and DOM semantics when extracting components.
- `server/` contains the Express + TypeScript API. `src/index.ts` starts the listener; `src/app.ts` composes the app. `src/routes/` maps URLs, `src/controllers/` validates HTTP inputs and sends typed responses, `src/services/` owns business logic and parameterized SQL, and `src/middleware/` handles authentication and JSON errors. `src/validation/` contains small runtime input parsers, `src/types/` contains database/HTTP types, and `src/integrations/llm.ts` calls the summary provider. `src/db.ts` and `src/seed.ts` retain database opening and seeding.
- `shared/types.ts` owns API contracts used by both workspaces; `web/src/types.ts` re-exports them. Keep database-only fields in server row types. Request bodies and external JSON start as `unknown` and must be narrowed before use. Services do not depend on Express.
- SQLite data is stored in `server/pulse.db` (ignored by Git). There is no dedicated test or assets directory in the current repository.

The browser calls the API with JSON and a bearer token; the API reads or updates SQLite and returns JSON. Keep request/response shapes aligned with `shared/types.ts`.

## Build, Test & Development Commands

- `npm install` installs dependencies for both workspaces.
- `npm run dev` starts the API at `localhost:4000` and the Vite app at `localhost:5173`.
- `npm run seed` recreates the SQLite tables and sample data; it deletes existing seeded database contents.
- `npm run build` type-checks and builds the web app. `npm run build --workspace server` type-checks the API.

No test runner or test script is configured. Automated test additions are deferred at the user's request; use the workspace builds for current verification.

## Coding Style & Naming

Follow the existing TypeScript style: two-space indentation, single quotes, no semicolons, and trailing commas where useful. Use PascalCase for React components and filenames (for example, `ItemDetail.tsx`); use camelCase for functions and variables. Keep shared API data shapes in `shared/types.ts` and API calls in `web/src/api/`. No formatter or linter is currently configured.

### Keep Solutions Simple

- Prefer the smallest robust solution that fixes the current problem.
- Reuse existing patterns. Add abstractions, dependencies, infrastructure, or broad refactors only when clearly necessary.
- Keep plans and implementations focused on the current ticket or batch. Avoid speculative requirements and production features beyond the agreed scope.
- Verify the changed behavior with proportionate checks; introduce test infrastructure only when its benefit justifies the complexity.
- Simplicity must still preserve essential security, correctness, and existing data.

### Coding Challenge Remediation Scope

- Implement one agreed batch at a time. The security batch plan is in `tickets/security-batches.md`; related tickets may share a fix, but nearby findings do not automatically expand the batch.
- Preserve `server/src/seed.ts`, sample credentials, seeded content, and the existing database. Do not reseed the working database or introduce data cleanup/schema migrations for these batches. Use disposable databases for mutation checks.
- Work with test data only for now. A004 covers credential disclosure; real-account password hashing, account migration/reset paths and credential rotation were removed from the ticket backlog at the user’s request. Do not reintroduce them without a new explicit request.
- Keep the existing demo login and bearer-token architecture. Fix token verification, signing-key configuration, and credential disclosure without adding password hashing (including Argon2/bcrypt), registration, password reset, refresh tokens, a session service, or new role/privacy policies unless separately requested.
- Enforce request types and referenced-record existence in the API using small helpers and parameterized SQL. Do not introduce an ORM, generic validation framework, or database-constraint migration for this scope.
- Separate current defects from deployment preparation. Do not add hosting infrastructure, distributed rate limiting, or production-only policies without an agreed need.
- When only part of a ticket is in scope (especially A010), record completed checks and explicitly deferred requirements. Keep the ticket/index status aligned and do not mark the original ticket fully Done while its requirements remain deferred. Preserve the original audit reports.

## Design System

- `web/src/styles.css` is the source of truth for the light corporate theme. Define palette primitives (`--palette-*`) and semantic colors (`--color-*`) in `:root`; component rules consume semantic tokens rather than raw colors.
- Reuse the `--space-*`, `--font-*`, `--radius-*`, sizing, border, focus, and motion tokens. Media query breakpoints remain literal because CSS variables do not work in media queries.
- Use shared `.button` variants, `.input`, `.field`, `.panel`, and status/priority badges. Layout selectors control placement rather than overriding component colors. Keep visible text alongside status colors.
- Preserve visible keyboard focus and reduced-motion behavior. Below 960px ticket details stack; below 640px controls wrap and metrics use two columns. The ticket table scrolls within its labeled region.
- Validate visual changes at desktop, tablet, and mobile widths, plus keyboard navigation and existing workflows. Browser screenshots may be stored under `output/playwright/`; no browser test runner is configured.

## Existing Workflow Findings

- Inbox pagination currently skips the first ten records (`offset = page * PAGE_SIZE` in the API) and returns an unfiltered total. Treat inaccurate page counts as an API issue, not a table styling issue.
- Detail screens are keyed by ticket ID, focus their heading on entry, and restore the originating inbox link (or inbox heading) on return. Background polling preserves mounted rows and does not move focus. History previews use text from an inert HTML document; full feedback continues to display stored markup literally.
- UI API failures use scoped alerts and read retries; assignment/note drafts survive request failures and status changes apply after success. Root/workspace React error boundaries provide render-crash fallbacks. Session expiry prompts manual sign-out/sign-in; complete response-shape validation and the full failure matrix remain in A015/B06.
- Feedback, notes and summaries render as React text using `.feedback-text` for preserved whitespace and wrapping. Stored HTML is displayed literally; retain seed content. Provider keys belong only in server configuration, never browser variables or request headers.
- Inbox polling shares the guarded load/error path and follows the current filter/search/page; previous-query responses are ignored. Complete polling/mutation synchronization and metrics refresh requirements remain tracked in A016/A017/A020.
- The 2026-09-26 audit is indexed in `app_audit_report.md`, with separate security, functional, UX, and design/accessibility reports. Findings are a snapshot of revision `12566cc`; verify whether each issue still exists before acting on it.
- Audit evidence and screenshots are local, ignored files under `output/playwright/`. Security and state-changing reproductions used a disposable seeded copy; do not run those probes or reseed a database that must be retained. No permanent test runner was added.
- Audit remediation tasks live in `tickets/`, grouped into `security/`, `functionality/`, `usability-ux/`, and `design-accessibility/`. Start with `tickets/README.md`; preserve finding IDs A001–A033 and update ticket/index statuses together as work is verified.

## Security & Configuration

Copy `server/.env.example` and `web/.env.example` to local `.env` files; never commit secrets. Treat the seeded credentials and current auth setup as development-only. Use parameterized SQL for new queries, especially when incorporating request data.

`server/src/config.ts` loads and validates `JWT_SECRET` once at startup. Generate a local key with `openssl rand -hex 32`; missing, placeholder or shorter-than-32-byte secrets prevent API startup in every environment. Signing and verification use HS256, and authentication resolves the current public user from the database. Key changes require a restart and fresh login. CSV export uses the same header authentication as other routes; query tokens are no longer accepted. Inbox/export queries use URLSearchParams. Exported formula-like text and leading control characters are apostrophe-prefixed; stored values are unchanged. Spreadsheet-application testing is excluded at the user's request, so A007's import criterion remains unverified.

## Commits, Pull Requests & Guide Maintenance

Use Conventional Commits for every commit (for example, `feat: add feedback filters`, `fix: correct inbox pagination`, or `docs: update contributor guide`). Keep commits focused. Pull requests should explain the behavior change, note relevant routes or UI flows, and include screenshots for visible changes; mention any manual verification performed.

Update this guide when project structure, commands, conventions, or important implementation findings change. Keep repository-specific exploratory notes actionable and concise so future contributors can use them without rereading the whole codebase.
