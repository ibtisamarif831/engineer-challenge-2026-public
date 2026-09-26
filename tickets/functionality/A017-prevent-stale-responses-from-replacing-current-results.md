# A017: Prevent stale responses from replacing current results

- **Status:** Open
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A017 — Older search responses can overwrite newer results](../functional_audit_report.md#a017--older-search-responses-can-overwrite-newer-results)
- **Related tickets:** [A016](A016-poll-the-current-inbox-query-and-update-counts.md), [A018](A018-encode-inbox-and-export-query-parameters.md).

## Problem and evidence

Using controlled responses, query `slow` was held, query `fast` completed, then slow was released. The input remained fast but the displayed customer was slow. No cancellation or request-version check protects `setItems`.

Normal network timing makes the list inconsistent with the search field or selected filter.

## Affected code

[web/src/components/Inbox.tsx:21–29](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L21).

## Tasks

- [ ] Cancel superseded requests or gate state updates by the current query/request version.
- [ ] Apply the guard to rows, totals and loading/error state for search, filters, pagination and polling.
- [ ] Optionally debounce typing for efficiency while keeping race protection independent of debounce.

## Acceptance criteria

- [ ] Delay and reorder search/filter/page responses in both directions; only the latest active query can update rows, totals and loading state.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Abort superseded requests or ignore responses whose query/version is no longer current. Debounce text entry for request efficiency; debounce alone does not resolve races.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
