# A029: Make customer history entries readable and navigable

- **Status:** Done
- **Severity:** Low
- **Area:** Usability and UX
- **Classification:** Current UX issue
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A029 — Customer history truncates messages without a way to read the ticket](../usability_ux_audit_report.md#a029--customer-history-truncates-messages-without-a-way-to-read-the-ticket)
- **Related tickets:** [A028](A028-preserve-ticket-and-inbox-context-in-urls.md).

## Problem and evidence

History slices messages to 48 characters inside non-interactive spans, without an ellipsis, date or ticket link. Desktop/tablet/mobile screenshots show words cut mid-word and no way to open the entry.

The customer context panel presents incomplete evidence and forces the agent to rediscover a ticket elsewhere.

## Affected code

[web/src/components/detail/CustomerPanel.tsx:16–23](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/detail/CustomerPanel.tsx#L16); [server/src/index.ts:213–219](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L213).

## Tasks

- [x] Add keyboard-accessible ticket navigation and dates or identifiers to history entries.
- [x] Use safe text previews and visibly indicate truncation rather than cutting words silently.
- [x] Decide whether the eight-record history limit needs an explicit view-all path; integrate detail navigation with A028.

## Acceptance criteria

- [x] Every displayed history entry can be identified and opened with keyboard/mouse; truncation is clear and HTML is not shown as raw preview text.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Provide a keyboard-accessible ticket link and date/identifier, indicate truncation, and show a safe text preview. Add a “view all” path only if the eight-record cap needs to be discoverable.

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
