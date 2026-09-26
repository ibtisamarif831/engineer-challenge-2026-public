# A023: Recover from malformed stored sessions

- **Status:** Open
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A023 — Malformed stored session data crashes app startup](../functional_audit_report.md#a023--malformed-stored-session-data-crashes-app-startup)
- **Related tickets:** [A015](A015-handle-api-failures-without-crashes-or-lost-work.md).

## Problem and evidence

Set the isolated browser’s user storage value to `{bad` and reload. JSON.parse throws during initial render and #root stays empty. No storage validation or recovery exists.

A damaged or stale local session can lock the user out until they manually clear storage.

## Affected code

[web/src/App.tsx:8–11](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/App.tsx#L8); [web/src/main.tsx:6–10](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/main.tsx#L6).

## Tasks

- [ ] Parse and validate persisted user/token data defensively.
- [ ] Reset invalid session data to a usable login state and handle unavailable browser storage.
- [ ] Preserve valid session restoration and add startup recovery coverage.

## Acceptance criteria

- [ ] Malformed JSON, JSON null, wrong-shaped objects and unavailable storage never blank the application; valid saved sessions still restore.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Parse storage defensively, validate the user/token shape, and reset invalid session data to a usable sign-in screen. Handle inaccessible browser storage and render failures gracefully.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
