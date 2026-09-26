# A026: Show accurate loading and save feedback

- **Status:** In progress
- **Severity:** Medium
- **Area:** Usability and UX
- **Classification:** Current UX issue
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A026 — Loading and successful saves have no clear feedback](../usability_ux_audit_report.md#a026--loading-and-successful-saves-have-no-clear-feedback)
- **Related tickets:** [A015](../functionality/A015-handle-api-failures-without-crashes-or-lost-work.md), [A019](../functionality/A019-make-repeated-note-and-status-actions-safe.md), [A024](../functionality/A024-handle-provider-failures-and-summary-timeouts.md), [A032](../design-accessibility/A032-preserve-keyboard-focus-across-ticket-navigation.md).

## Problem and evidence

With the initial inbox request held pending, the UI announced “No feedback to display / Try another search or status filter” and had no busy indicator. Detail initially renders only Back. Successful assignment save had no status/alert confirmation. Mutating controls provide no pending feedback (A019).

Users cannot tell whether data is empty, still loading or saved, encouraging repeated clicks and unnecessary edits.

## Affected code

[web/src/components/Inbox.tsx:13–29](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L13); [web/src/components/inbox/FeedbackTable.tsx:77–80](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/inbox/FeedbackTable.tsx#L77); [web/src/components/ItemDetail.tsx:75–109](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L75); [web/src/components/Login.tsx:14–23](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Login.tsx#L14).

## Tasks

- [ ] Separate initial loading, refreshing, loaded-empty and error states in inbox/detail.
- [ ] Add per-action pending feedback and concise successful-save confirmation.
- [ ] Give new status messages appropriate accessible semantics and coordinate pending guards with A019.

## Acceptance criteria

- [ ] On slow and successful requests, users can identify the state without guessing; no false empty message appears before completion and save completion is visible.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Introduce distinct initial-loading, refreshing, loaded-empty and error states; show per-action pending state and concise successful-save feedback with appropriate accessible semantics.

This is a usability finding. WCAG 4.1.3 does not require authors to invent new status messages; when messages are added, make them programmatically available. Existing login errors use role=alert and empty results use role=status.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Current implementation

- Added a shared accessible `Loader` component with truthful initial-loading and refreshing labels, a reduced-motion-safe spinner and `role="status"` announcement semantics.
- Applied it to inbox loading/refresh, ticket loading, related ticket data and sign-in. Empty inbox content remains hidden until the request completes successfully.
- Added pending guards and action-specific feedback for inbox status changes, detail status changes, summary generation, assignment saves, note saves and login. Successful assignment/note saves announce a concise confirmation.

## Verification

- [x] `npm run build` (web TypeScript/Vite build) passed.
- [x] `npm run build --workspace server` passed.
- [x] `git diff --check` passed.
- [ ] Browser verification of slow initial/refresh requests, empty results, action retries and mobile/keyboard presentation remains to be performed before marking this ticket Done.
