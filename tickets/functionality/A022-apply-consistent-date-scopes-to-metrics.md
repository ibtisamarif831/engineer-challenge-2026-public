# A022: Apply consistent date scopes to metrics

- **Status:** Done
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A022 — Metrics apply different date ranges to different counters](../functional_audit_report.md#a022--metrics-apply-different-date-ranges-to-different-counters)
- **Related tickets:** [A002](../security/A002-parameterize-all-request-derived-sql.md), [A020](A020-refresh-dependent-views-after-ticket-mutations.md), [A021](A021-standardize-due-date-storage-display-and-overdue-rules.md).

## Problem and evidence

Requesting from 1970-01-01 to 1970-01-02 on fresh data returned open=0, resolved=0, urgent=20 and overdue=26. Status counters honor both bounds; urgent ignores to and overdue ignores both.

Consumers of the metrics API receive counters drawn from different populations.

## Affected code

[server/src/index.ts:116–137](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L116).

## Tasks

- [x] Document whether counters share a date window or intentionally expose separate named scopes.
- [x] Validate range bounds and reuse the intended predicates for open, resolved, urgent and overdue counts.
- [x] Test empty historical windows, boundaries and reversed ranges against deterministic fixtures.

## Acceptance criteria

- [ ] An empty historical range has internally consistent counters; boundary and reversed-range cases behave as documented.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Verification — 2026-09-26

All four counters now share the validated inclusive `from`/`to` calendar window; overdue additionally requires `status = 'open'` and a non-null due date within that window. Reversed ranges return 400. Code/build verification passed; disposable deterministic checks for empty historical windows and boundaries remain to be run.

## Implementation context

Apply the documented range consistently to all counters, or expose clearly named independent scopes if overdue is intentionally global. Validate bounds and reuse predicate construction.

The current UI does not expose date-range controls. This is a callable API logic defect, not a claim about a missing UI filter.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
