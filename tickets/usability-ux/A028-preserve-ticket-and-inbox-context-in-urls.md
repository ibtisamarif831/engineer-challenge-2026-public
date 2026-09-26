# A028: Preserve ticket and inbox context in URLs

- **Status:** Done
- **Severity:** Medium
- **Area:** Usability and UX
- **Classification:** Current UX issue
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A028 — Ticket navigation is not represented in the URL](../usability_ux_audit_report.md#a028--ticket-navigation-is-not-represented-in-the-url)
- **Related tickets:** [A027](A027-preserve-drafts-or-confirm-their-dismissal.md), [A029](A029-make-customer-history-entries-readable-and-navigable.md), [A032](../design-accessibility/A032-preserve-keyboard-focus-across-ticket-navigation.md).

## Problem and evidence

Opening detail leaves the URL at `/` and the title Pulse. Refresh restores the session but returns to Inbox. selectedId, query, filter and page exist only in component state.

Agents cannot bookmark/share a ticket location or recover their exact working context after refresh; browser history has no app detail entry.

## Affected code

[web/src/components/Inbox.tsx:19](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L19); [web/src/components/Inbox.tsx:55–65](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L55).

## Tasks

- [x] Represent ticket selection and relevant inbox page/filter/search state in the URL.
- [x] Handle direct URLs and invalid/missing IDs with usable recovery.
- [x] Support refresh and browser Back/Forward with meaningful titles; coordinate focus behavior with A032.

## Acceptance criteria

- [x] Direct ticket URLs, refresh, browser Back/Forward and returning to a filtered page restore the intended context and a meaningful document title.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Represent ticket selection and relevant inbox context in URL state, handle invalid/missing IDs, and preserve query context through back/forward navigation.

Observed refresh/URL behavior is confirmed. No external collaboration/share feature or multi-tenant requirement is assumed.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Navigation, drafts, history and focus — implementation and verification — 2026-09-26

- Implemented `/tickets/:id` routes and inbox `page/status/q` query state with native History API, real ticket/history anchors, popstate handling and route-specific titles. Search replaces the current entry; filters, pages and ticket transitions push entries. Invalid paths/IDs and missing records have recovery controls. Direct login keeps the requested URL.
- Per-user/per-ticket assignment and note drafts use sessionStorage for this tab and survive navigation and refresh. Draft notices and explicit discard are visible. Sign-out asks before clearing all drafts. Inaccessible storage uses memory plus an unload warning; no draft text goes in URLs. Save completion clears only the submitted draft object, preserving edits made in flight, and notifies a newly mounted detail view to refresh. Session generations prevent old saves from clearing another login's drafts.
- History links include ticket IDs, dates and ellipsized inert text previews. The existing eight-ticket limit is disclosed; no new view-all API was added. Full ticket messages remain literal React text.
- Ticket headings receive focus once per entry; inbox return restores the original ticket link, falling back to its heading. Origin metadata is stored in browser history entries. Background polling leaves existing rows mounted and ignores superseded loads.

### Verified

Web TypeScript/Vite build and `git diff --check` passed. Browser used isolated localhost:5180 with mocked API responses and a synthetic user; the working database/seed were not modified. Checked page-2 Open/search context, keyboard opening ticket 12, heading focus/title/URL, unsaved High priority and note, history link to ticket 13, browser Back, refresh, Back to inbox, and Forward. Draft and query context survived; inbox focus returned to ticket 12. Checked confirmed sign-out then direct-ticket login with cleared drafts; cancellation branch with fixture `confirm=false` retained login and draft. Assignment save retained the note draft; note save cleared it and showed the saved note. Checked missing ticket 999 and invalid `/tickets/nope` recovery. Inspected history links at 390/768/1280 widths. Local fixture/evidence lives under ignored `output/playwright/b09/`; no test runner or dependency added.

### Remaining gates

Actual screen-reader announcement testing is unverified (A032). Storage-denial/unload prompts and reordered in-flight mutation/navigation responses need broader integration checks. Mutation idempotency, full polling reconciliation and metrics checks remain tracked in A016/A017/A019/A020. At the time of these checks, API pagination/count defects remained tracked in A014. Static-host SPA fallback must be configured when deployment is selected.
