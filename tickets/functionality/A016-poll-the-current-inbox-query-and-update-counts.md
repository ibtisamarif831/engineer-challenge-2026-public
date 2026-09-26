# A016: Poll the current inbox query and update counts

- **Status:** Open
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A016 — Polling replaces filtered results with the initial query](../functional_audit_report.md#a016--polling-replaces-filtered-results-with-the-initial-query)
- **Related tickets:** [A014](A014-correct-inbox-pagination-and-filtered-totals.md), [A017](A017-prevent-stale-responses-from-replacing-current-results.md).

## Problem and evidence

The interval effect has `[]` dependencies and captures initial page/filter/search/items. With Resolved selected, advancing the browser clock 45 seconds issued status=all and displayed open rows while aria-pressed remained true for Resolved. The interval also omits updating total.

Agents see tickets that contradict their selected query and may act on the wrong queue.

## Affected code

[web/src/components/Inbox.tsx:35–45](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L35).

## Tasks

- [ ] Route polling through the current page/filter/search request path instead of the initial closure.
- [ ] Refresh rows and totals together and remove stale captured-state merging.
- [ ] Clean up intervals and integrate stale-response protection with A017.

## Acceptance criteria

- [ ] Filter, search and paginate, then advance two polling intervals; requests/results/counts continue matching the current query, and unmount clears the timer.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Refresh the current query through a shared request path, with cleanup and stale-response protection. Refresh matching counts and avoid merging against a captured items array.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
