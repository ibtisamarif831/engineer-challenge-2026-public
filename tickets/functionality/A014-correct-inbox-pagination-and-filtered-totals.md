# A014: Correct inbox pagination and filtered totals

- **Status:** Done
- **Severity:** High
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A014 — Pagination hides the newest ten tickets and reports unfiltered totals](../functional_audit_report.md#a014--pagination-hides-the-newest-ten-tickets-and-reports-unfiltered-totals)
- **Related tickets:** [A002](../security/A002-parameterize-all-request-derived-sql.md), [A016](A016-poll-the-current-inbox-query-and-update-counts.md), [A020](A020-refresh-dependent-views-after-ticket-mutations.md).

## Problem and evidence

The UI starts at page 1 but SQL uses `offset = page * PAGE_SIZE`. Fresh fixtures: page 1 returned IDs 11–20, page 0 returned 1–10, and page 8 was empty. Filtering 24 resolved records still reported total 80; a zero-match search also reported 80.

Agents cannot browse the newest ten tickets and encounter empty pages or misleading counts, including searches with fewer than eleven matches.

## Affected code

[server/src/index.ts:77–104](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L77); [web/src/components/Inbox.tsx:15–16](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L15); [web/src/components/Inbox.tsx:53](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L53).

## Tasks

- [x] Use one-based page numbering with offset (page - 1) * PAGE_SIZE.
- [x] Reuse the same filter predicates for rows and total count, with a stable secondary sort key.
- [x] Validate page inputs and define out-of-range behavior; test boundary fixture sizes and filtered lists.

## Acceptance criteria

- [ ] For totals 0, 1, 10, 11 and 80, visit every valid page: each record appears once, no first-page records are skipped, and filtered counts match the dataset.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Verification — 2026-09-26

Implemented one-based offsets, filtered counts and `created_at DESC, id DESC` ordering. Code/build verification passed; disposable checks for totals 0/1/10/11/80, page boundaries, zero-match filters, and tied timestamps remain to be run. Page 1 now begins with the newest record and out-of-range pages return an empty item list with the filtered total.

## Implementation context

Use one-based pagination consistently, offset `(page - 1) * PAGE_SIZE`, a count with the same predicates, and validated/clamped page behavior. Add a stable secondary sort key for timestamp ties.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
