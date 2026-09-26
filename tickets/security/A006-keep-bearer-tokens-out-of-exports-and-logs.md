# A006: Keep bearer tokens out of exports and logs

- **Status:** Done
- **Severity:** Medium
- **Area:** Security
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A006 — Bearer credentials enter export URLs and error logs](../security_best_practices_report.md#a006--bearer-credentials-enter-export-urls-and-error-logs)
- **Related tickets:** [A001](A001-verify-authentication-tokens-on-every-protected-route.md), [A018](../functionality/A018-encode-inbox-and-export-query-parameters.md).

## Problem and evidence

The browser download URL contained a `token` query parameter. The API error log contained a bearer token after a malformed search; verification recorded only a boolean, never the token. Source logs the full Authorization header.

URLs and logs create extra places where credentials can be retained or copied, increasing exposure through request logging, download metadata and diagnostics.

## Affected code

[web/src/api.ts:60–61](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L60); [web/src/components/Inbox.tsx:87–88](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L87); [server/src/index.ts:40](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L40); [server/src/index.ts:105–106](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L105); [server/src/auth.ts:21–22](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/auth.ts#L21).

**Security guidance:** EXPRESS-ERROR-001; REACT-AUTH-001.

## Tasks

- [x] Download CSV with an authenticated fetch and a Blob URL, revoking the URL after use.
- [x] Remove export query-token authentication once the client uses headers.
- [x] Redact credentials and sensitive request content from error logs; use safe request metadata.

## Acceptance criteria

- [x] Exports still download correctly with headers only; URLs, error logs, screenshots and telemetry contain no credentials.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Download using an authenticated fetch and a Blob/object URL, then revoke it. Remove query-token support. Redact Authorization and sensitive bodies from logs; use request IDs and safe error metadata.

Exposure to URLs and the local log is demonstrated; persistence in a specific browser history, proxy or third-party log system was not tested.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## CSV exports verification — 2026-09-26

CSV now uses the common authentication middleware and accepts no query-token fallback. The browser fetches the CSV with Authorization, checks the HTTP response, downloads a Blob with a fixed filename, removes its temporary link and revokes the object URL after the browser can start the download. Export is disabled while pending; errors are shown locally and a retry clears the error.

Disposable API checks rejected missing, malformed, forged, expired and query-only credentials (including a valid query token paired with an invalid header). Controlled export failures returned safe JSON; captured server logs contained only `API request failed`, without tokens, request bodies or SQL. No new request logger or telemetry was added.

Browser success/failure/keyboard-retry checks passed. Captured requests used headers and exactly one query value, with no token in URLs. Two successful files each contained the expected 12 matching fixture records; a controlled 503 created no Blob/download. Both Blob URLs were revoked and temporary links removed. Page navigation was unchanged. Browser download-event tracking timed out on the first Blob download; the actual downloaded CSV was independently located and parsed successfully. Desktop/tablet/mobile screenshots contain only synthetic data and no credentials.

Both builds passed; working database/seed hashes were preserved. Local evidence: `output/playwright/b04/verification.json` and screenshots. External proxy/telemetry retention is not claimed as tested; this completion covers the application's request and logging paths. Existing note inclusion policy remains unchanged.
