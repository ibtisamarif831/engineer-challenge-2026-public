# A020: Refresh dependent views after ticket mutations

- **Status:** Done
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A020 — Mutations leave metrics, customer history and filtered rows stale](../functional_audit_report.md#a020--mutations-leave-metrics-customer-history-and-filtered-rows-stale)
- **Related tickets:** [A014](A014-correct-inbox-pagination-and-filtered-totals.md), [A016](A016-poll-the-current-inbox-query-and-update-counts.md), [A019](A019-make-repeated-note-and-status-actions-safe.md), [A022](A022-apply-consistent-date-scopes-to-metrics.md).

## Problem and evidence

Resolving a ticket changed database counts from 57 open/23 resolved to 56/24 while the metrics stayed 57/23. A resolved row remained in the Open filter. Reopening detail changed its badge to Open while the customer history still said resolved.

Agents get contradictory queue and customer-state information after successful actions.

## Affected code

[web/src/components/Inbox.tsx:31–33](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L31); [web/src/components/Inbox.tsx:47–50](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L47); [web/src/components/ItemDetail.tsx:54–56](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L54); [web/src/components/ItemDetail.tsx:69–93](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L69).

## Tasks

- [x] Refresh or coherently update inbox results/counts, metrics and customer history after relevant mutations.
- [x] Remove rows that no longer match the active filter and reconcile page bounds.
- [x] Verify updates from both inbox and detail without requiring a full page reload.

## Acceptance criteria

- [x] Resolve/reopen and change priority/due date from both screens; rows, counts, metrics and history agree without a full reload.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Invalidate/refetch affected query, metrics and customer history after mutations, or update a coherent shared cache. Remove rows that no longer match a filter and reconcile counts/pages.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Resolution and verification (2026-09-26)

- Reused `pulse:ticket-saved` for successful inbox/detail status changes and existing assignment/note saves. Inbox refetches the current query and metrics instead of replacing one row locally. Detail refetches the ticket and related customer history, including when a save finishes after navigating to another ticket.
- Read versions are invalidated synchronously on save; earlier inbox, metrics, detail and related-data reads cannot overwrite the new refresh. Session guards avoid notifying a later login about an earlier session's save.
- Filtered totals drive last-page correction using history replacement. Successful reads remove selections for rows no longer visible.
- Both workspace builds passed. Browser checks used an in-memory mocked API with 11 synthetic tickets; the existing SQLite database and seed were untouched.
- Resolving the selected only row on Open page 2 changed counts from 11/0 to 10/1, removed the row, cleared selection and returned to page 1 of 1 with ten rows.
- Detail reopen updated the ticket badge and customer history to Open; returning to Resolved showed an empty queue and counts 11/0. Saving urgent priority and a past due date updated Urgent/Overdue to 1/1. Resolving from detail updated history to Resolved, removed the ticket from Open + Urgent and changed counts to 10/1/0/0 without reloading the app.

Limitations: verification used mocked API responses, not live database mutations. The broader delayed-response/polling matrix and failure matrix remain in A016/A017/A015; attempted clock-controlled race verification was inconclusive and is not claimed as a pass. Assignment controls exist only in detail. No permanent test runner was added.
