# A015: Handle API failures without crashes or lost work

- **Status:** Open
- **Severity:** High
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A015 — HTTP failures enter success paths, causing blank screens and lost drafts](../functional_audit_report.md#a015--http-failures-enter-success-paths-causing-blank-screens-and-lost-drafts)
- **Related tickets:** [A013](../security/A013-return-consistent-safe-json-api-errors.md), [A019](A019-make-repeated-note-and-status-actions-safe.md), [A023](A023-recover-from-malformed-stored-sessions.md), [A024](A024-handle-provider-failures-and-summary-timeouts.md), [A026](../usability-ux/A026-show-accurate-loading-and-save-feedback.md), [A031](../usability-ux/A031-distinguish-login-connectivity-errors-from-bad-credentials%28deferred%29.md).

## Problem and evidence

Every API helper except login parses JSON without checking `res.ok`. Apostrophe search and a mocked 401 blanked #root with `undefined.map`. A missing detail item also blanked the app. A mocked failed assignment replaced the name/message with blanks and rendered Invalid Date. A failed note cleared the draft and added an empty “Shared” item; a failed resolve stayed optimistically resolved without an alert.

Routine server errors can crash the entire UI, misrepresent saved state or discard work. Network failures can leave stale rows under a new search with no error.

## Affected code

[web/src/api.ts:19–120](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L19); [web/src/components/Inbox.tsx:21–25](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L21); [web/src/components/Inbox.tsx:47–50](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L47); [web/src/components/ItemDetail.tsx:42–100](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L42).

## Tasks

- [ ] Centralize response-status and response-shape handling, including JSON and non-JSON errors.
- [ ] Implement recoverable 401, missing-item 404 and scoped retryable error states across reads and mutations.
- [ ] Preserve drafts on failure and reconcile or roll back optimistic updates; add a render-error fallback.

## Acceptance criteria

- [ ] Inject 401/404/429/500, HTML error bodies and network failures into each flow. No blank app, false success or lost draft; recovery/retry remains available.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Centralize HTTP/error-shape handling; map 401 to recoverable session flow, 404 to a missing-item screen, and other failures to scoped errors. Update state only after success or roll back optimistic changes; retain drafts. Add a final render-error boundary as a fallback.

A002 explains the apostrophe-triggered server failure; this is the independent browser handling defect. See browser-evidence.json, extra-evidence.json and missing-detail-evidence.json.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## UI error handling update — 2026-09-26

Implemented feature API client errors, root/workspace render boundaries, scoped load/action alerts, read retries, session-expiry guidance, and distinct login credential/connectivity messages. Failed status updates retain the last confirmed state; failed note/assignment saves retain entered text. Inbox polling now uses the guarded current-query load path.

Verification: web TypeScript/Vite build and diff whitespace check passed. A temporary browser fixture verified a 500 inbox error, keyboard retry to successful rows, a failed resolve retaining Open status, visible summary failure, and render-crash fallback. Inspected error layouts at 390/768/1280 viewport widths. No working database changes or permanent test infrastructure.

Status remains Open: full 401/404/429/500/non-JSON/network acceptance matrix, login-specific browser checks, runtime success-payload validation, and complete session recovery remain unverified or deferred.
