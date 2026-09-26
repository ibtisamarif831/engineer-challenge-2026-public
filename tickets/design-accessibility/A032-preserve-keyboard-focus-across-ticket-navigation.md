# A032: Preserve keyboard focus across ticket navigation

- **Status:** In progress
- **Severity:** Medium
- **Area:** Design and accessibility
- **Classification:** Accessibility usability concern
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A032 — Detail transitions lose focus and do not restore the opening ticket](../design_accessibility_audit_report.md#a032--detail-transitions-lose-focus-and-do-not-restore-the-opening-ticket)
- **Related tickets:** [A026](../usability-ux/A026-show-accurate-loading-and-save-feedback.md), [A028](../usability-ux/A028-preserve-ticket-and-inbox-context-in-urls.md).

## Problem and evidence

Keyboard Enter on the ticket button replaces the inbox with detail and leaves document.activeElement as BODY. Returning with Back also leaves BODY rather than the original ticket. There is no focus handoff or screen-title update. Actual Tab navigation has visible solid 2px focus outlines.

Keyboard and assistive-technology users lose their location and must rediscover where work resumed, especially after opening a ticket deep in a page.

## Affected code

[web/src/components/Inbox.tsx:55–65](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L55); [web/src/components/ItemDetail.tsx:113–123](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L113).

## Tasks

- [x] Focus the appropriate detail heading/container after explicit navigation.
- [x] Restore the opening ticket on return, with a fallback if it is no longer in the current results.
- [ ] Coordinate titles with A028 and avoid moving focus during background refresh; verify with a screen reader.

## Acceptance criteria

- [ ] Open a later ticket with keyboard, return and continue from the same location; verify the experience with a screen reader and no focus trap.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Focus an appropriate detail heading/container after navigation and restore the originating ticket on return, with a fallback if it is no longer visible. Update the page title without forcing focus on background refresh.

This is a demonstrated focus-continuity issue, not a certified WCAG failure. The first Tab after opening reached Back to inbox. Assess meaningful sequence under [WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

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
