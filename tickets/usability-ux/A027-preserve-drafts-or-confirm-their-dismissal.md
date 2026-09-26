# A027: Preserve drafts or confirm their dismissal

- **Status:** Done
- **Severity:** Medium
- **Area:** Usability and UX
- **Classification:** Current UX issue
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A027 — Leaving detail silently discards unsaved work](../usability_ux_audit_report.md#a027--leaving-detail-silently-discards-unsaved-work)
- **Related tickets:** [A015](../functionality/A015-handle-api-failures-without-crashes-or-lost-work.md), [A028](A028-preserve-ticket-and-inbox-context-in-urls.md).

## Problem and evidence

Enter an unsent note and change priority without saving, choose Back to inbox, then reopen the same ticket. The note is empty and priority reverts, without warning or a retained draft.

Agents lose typed notes and assignment edits during ordinary navigation.

## Affected code

[web/src/components/ItemDetail.tsx:33–37](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L33); [web/src/components/ItemDetail.tsx:115–117](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L115); [web/src/components/Inbox.tsx:55–63](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L55).

## Tasks

- [x] Track dirty note and assignment state per ticket.
- [x] Implement retained drafts or an explicit discard/continue-editing interaction for navigation away.
- [x] Define and test behavior for Back, refresh, sign-out and subsequent reopening.

## Acceptance criteria

- [x] Back, sign-out, refresh and ticket navigation have deliberate dirty-state behavior; saved changes remain persisted and abandoned drafts are never silently confused with saved content.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Track dirty edits and preserve drafts per ticket, or present a clear discard/continue-editing choice. Make successfully saved and unsaved state distinguishable.

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
