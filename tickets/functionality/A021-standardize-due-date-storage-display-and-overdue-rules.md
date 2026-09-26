# A021: Standardize due-date storage display and overdue rules

- **Status:** Done (migration deferred)
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A021 — Due dates mix timestamps, date-only values and empty strings](../functional_audit_report.md#a021--due-dates-mix-timestamps-date-only-values-and-empty-strings)
- **Related tickets:** [A010](../security/A010-validate-writes-and-enforce-data-relationships.md), [A020](A020-refresh-dependent-views-after-ticket-mutations.md), [A022](A022-apply-consistent-date-scopes-to-metrics.md).

## Problem and evidence

Clearing a NULL due date stored an empty string and increased overdue from 26 to 27. Saving date-only 2026-10-01 displayed 9/30/2026 in America/Los_Angeles, while the date input still showed 2026-10-01. Existing ISO timestamps are truncated when loaded into the editor.

Tickets with no due date become overdue, and users in different timezones see conflicting calendar dates. Saving unrelated assignment changes can also discard time-of-day precision.

## Affected code

[web/src/components/ItemDetail.tsx:49](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L49); [web/src/components/ItemDetail.tsx:84–90](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L84); [web/src/components/inbox/FeedbackTable.tsx:59](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/inbox/FeedbackTable.tsx#L59); [server/src/index.ts:127–129](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L127); [server/src/index.ts:238–240](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L238).

## Tasks

- [x] Document the calendar-date versus timestamp contract, timezone and deadline convention before changing storage.
- [x] Normalize absent dates to NULL and plan a deliberate migration of existing ISO/date-only/empty values.
- [x] Use the same validated representation in the editor, API, table and overdue query.

## Acceptance criteria

- [ ] Check null/clear, past/today/future dates, midnight and UTC−/UTC+ timezones. Calendar dates remain stable and undated tickets never count as overdue.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Verification — 2026-09-26

Due dates now mean calendar dates (`YYYY-MM-DD`) in the business calendar; the date input and table display the stored calendar value without timezone conversion. New writes reject invalid dates, normalize clear/empty values to `NULL`, and preserve date-only precision. Existing ISO/date-only/empty values remain readable through compatible slicing and NULL handling. Overdue queries exclude NULL dates and use the documented date window. Code/build verification passed; disposable timezone and boundary checks remain to be run.

The historical migration of existing mixed values remains intentionally deferred from the agreed scope. Existing ISO timestamps are read compatibly but are not rewritten.

## Implementation context

Define due_at as a calendar date or a timestamp consistently across storage, API, display and overdue rules. Given the date-only control, prefer validated calendar dates, NULL for absence, and a documented business timezone/deadline convention; migrate old values deliberately.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
