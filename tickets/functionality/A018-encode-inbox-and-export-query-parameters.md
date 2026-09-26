# A018: Encode inbox and export query parameters

- **Status:** Done
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A018 — Search and export values are concatenated into URLs without encoding](../functional_audit_report.md#a018--search-and-export-values-are-concatenated-into-urls-without-encoding)
- **Related tickets:** [A006](../security/A006-keep-bearer-tokens-out-of-exports-and-logs.md), [A017](A017-prevent-stale-responses-from-replacing-current-results.md).

## Problem and evidence

Entering `billing&status=resolved#fragment` emitted `...?status=all&q=billing&status=resolved`; the extra status became a second parameter and the fragment was not sent. Export uses the same unsafe concatenation; a # in search can also move the token into the fragment, breaking authentication.

Legitimate searches containing &, #, + or similar URL characters are changed, rejected or exported incorrectly.

## Affected code

[web/src/api.ts:25](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L25); [web/src/api.ts:60–61](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L60).

## Tasks

- [x] Construct inbox/export queries with URL and URLSearchParams.
- [x] Preserve literal special characters and avoid duplicate parameters or accidental URL fragments.
- [x] Coordinate the export URL change with header-based downloads in A006.

## Acceptance criteria

- [x] Round-trip &, #, +, %, Unicode and spaces through inbox and export; the server receives exactly one unchanged query value and exports the matching set.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Build query strings with URL/URLSearchParams. Use header-authenticated downloads as recommended in A006.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## CSV exports verification — 2026-09-26

Inbox and export now construct parameters with URLSearchParams. Fourteen calls through the actual browser API module verified that Authorization stays in headers, URLs contain no token or fragment, and there is exactly one unchanged q/status value. Queries covered `billing&status=resolved#fragment`, `plus+sign`, `percent%value`, Unicode, spaces and apostrophes against an in-memory API. Inbox/export returned the expected matching records (accounting for the separately tracked page-offset defect).

The browser also searched/exported the ampersand/hash case and retried a plus-sign export; both downloaded CSVs contained all 12 matching fixture records. Both builds passed. Existing page counts, wildcard search semantics and stale polling remain separate A014/A016 work; the stale polling behavior was observed during the lengthy browser check and was not changed here.
