# A010: Validate writes and enforce data relationships

- **Status:** Open
- **Severity:** Medium
- **Area:** Security
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A010 — Write endpoints persist invalid and orphaned data](../security_best_practices_report.md#a010--write-endpoints-persist-invalid-and-orphaned-data)
- **Related tickets:** [A002](A002-parameterize-all-request-derived-sql.md), [A013](A013-return-consistent-safe-json-api-errors.md), [A021](../functionality/A021-standardize-due-date-storage-display-and-overdue-rules.md).

## Problem and evidence

Assignment accepted owner 99999, priority `banana`, and due date `not-a-date` with 200. Posting a whitespace note returned 201. Posting to nonexistent ticket 99999 created an orphan note; string `"false"` was stored as private=1. A forged nonexistent author was also persisted (A001). Tables declare no foreign keys or enum checks.

Invalid records break display assumptions and undermine author/ticket relationships. Validation in React controls cannot protect direct API calls.

## Affected code

[server/src/index.ts:236–274](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L236); [server/src/seed.ts:26–48](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/seed.ts#L26).

**Security guidance:** EXPRESS-INPUT-001; EXPRESS-INPUT-002.

## Tasks

- [x] Validate assignment and note request shapes, IDs, enums, dates, booleans and bounded nonempty note text.
- [x] Check referenced ticket, owner and author records before writing; return consistent 400/404 errors.
- [ ] Plan cleanup/migration of invalid records before adding database constraints; coordinate date rules with A021.

## Acceptance criteria

- [x] Invalid requests return 400/404 and leave the database unchanged; valid assignments/notes retain the same browser-visible behavior.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Validate request shapes/types, enum values, dates, positive IDs and bounded trimmed note bodies before writes; check referenced rows. Add compatible database integrity constraints after cleaning invalid data. Reject missing resources with 404.

The default Express JSON parser already has a body-size limit; this finding concerns domain validation, not an unlimited HTTP request body.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Server structure/type refactor — 2026-09-26

API enforcement is implemented in validation/inputs.ts and services/feedback.ts. In-memory HTTP checks cover invalid types, unknown owners/tickets/authors, impossible dates, blank/oversized notes, string booleans, unchanged data on failure, and valid assignments/notes. Empty/null dates and unassigned ownership remain supported. Database constraints, migration and existing-data cleanup remain explicitly deferred. Browser visual workflow verification is not claimed; the full ticket stays Open.

Verification before test removal: temporary HTTP checks passed using synthetic in-memory data and mocked providers. Both workspace builds passed. The user subsequently requested removal of test files and the test command; no permanent suite remains. The working database and seed file are preserved.

## API validation and errors API and browser completion — 2026-09-26

API-only scope is complete. Temporary checks rejected malformed query/body types, unsafe IDs, invalid enums/dates, whitespace and oversized notes, string privacy booleans and missing ticket/owner/author references without changing fixture data. Valid assignments, public/private note fields, nullable owners and empty/null dates retain their existing behavior. Invalid/nonexistent summary IDs never reached the mocked provider. Missing authors are also rejected directly by the service; authentication rejects nonexistent users first on HTTP paths.

Browser assignment/note handlers now catch failures and show local alerts. Controlled 503 checks preserved assignment choices, the note draft and the previous displayed data. Keyboard retries succeeded, cleared errors, and persisted after reload/reopen. Desktop/tablet/mobile layouts were checked. Both builds and the 170 HTTP checks passed; all mutation checks used in-memory fixtures and working DB/seed hashes were preserved.

A010 remains Open for database constraints and cleanup/migration of existing invalid records, which are explicitly outside the agreed API scope. No schema changes, cleanup, date-semantics changes or broad client error UX were added.
