# A020: Refresh dependent views after ticket mutations

- **Status:** Open
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

- [ ] Refresh or coherently update inbox results/counts, metrics and customer history after relevant mutations.
- [ ] Remove rows that no longer match the active filter and reconcile page bounds.
- [ ] Verify updates from both inbox and detail without requiring a full page reload.

## Acceptance criteria

- [ ] Resolve/reopen and change priority/due date from both screens; rows, counts, metrics and history agree without a full reload.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Invalidate/refetch affected query, metrics and customer history after mutations, or update a coherent shared cache. Remove rows that no longer match a filter and reconcile counts/pages.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
