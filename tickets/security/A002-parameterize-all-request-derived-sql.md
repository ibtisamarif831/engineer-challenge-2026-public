# A002: Parameterize all request-derived SQL

- **Status:** Done
- **Severity:** Critical
- **Area:** Security
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A002 — Request data can alter SQL predicates and update all feedback](../security_best_practices_report.md#a002--request-data-can-alter-sql-predicates-and-update-all-feedback)
- **Related tickets:** [A010](A010-validate-writes-and-enforce-data-relationships.md), [A014](../functionality/A014-correct-inbox-pagination-and-filtered-totals.md), [A022](../functionality/A022-apply-consistent-date-scopes-to-metrics.md).

## Problem and evidence

String interpolation reaches feedback filters, metrics ranges, export filters, assignment values/ID, and notes ID. In the isolated DB, a status value `open' OR 1=1 --` returned all 80 records; notes ID `99999 OR 1=1` returned four unrelated notes. An assignment priority `urgent', due_at = NULL WHERE 1=1 --` changed all 80 rows to urgent. Ordinary apostrophes also trigger 500s.

An API caller can read outside requested predicates and corrupt the entire feedback queue; A001 makes these paths accessible without legitimate authentication.

## Affected code

[server/src/index.ts:77–103](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L77); [server/src/index.ts:116–129](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L116); [server/src/index.ts:145–164](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L145); [server/src/index.ts:236–261](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L236).

**Security guidance:** EXPRESS-INJECT-001.

## Tasks

- [x] Replace interpolated request values in feedback, metrics, export, assignment and notes queries with bound parameters.
- [x] Validate IDs and construct filter clauses from fixed SQL fragments; retain legitimate apostrophe searches.
- [x] Add disposable-fixture checks proving unrelated records cannot be read or updated through injected predicates.

## Acceptance criteria

- [x] Repeat the harmless predicate/mass-update probes only on disposable fixtures: no unrelated rows change, invalid values return 400, and names such as O’Brien work.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Parameterize every request-derived SQL value, validate integer IDs and enum/range inputs, and construct only fixed SQL clauses. Do not rely on escaping quotes or reject legitimate apostrophes. Keep update predicates fixed.

Read and write injection were demonstrated. No OS-command execution, stacked statements, or filesystem access is claimed. Metrics/export interpolation is source-confirmed; malformed-quote failures were observed there.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Server structure/type refactor — 2026-09-26

All request-derived SQL values are bound in services/feedback.ts, services/metrics.ts and the other extracted services. Fixed filter fragments are shared by inbox/export. API tests cover predicate/mass-update strings, unchanged unrelated rows, malformed IDs/dates and apostrophe searches. No database schema or content was changed.

Verification before test removal: temporary HTTP checks passed using synthetic in-memory data and mocked providers. Both workspace builds passed. The user subsequently requested removal of test files and the test command; no permanent suite remains. The working database and seed file are preserved.

## API validation and errors regression verification — 2026-09-26

Existing parameterized SQL was reverified in 170 temporary HTTP checks across development/production. Predicate/mass-update strings in status, metric dates, IDs and priority were rejected; injection-looking search text returned no unrelated rows. Ordinary O'Brien searches succeeded for inbox and export. Invalid writes left fixture tables unchanged, and valid assignment updates left unrelated feedback rows unchanged. Both workspace builds passed. Checks used disposable in-memory databases; no SQL code changes were necessary.
