# A013: Return consistent safe JSON API errors

- **Status:** Done
- **Severity:** Low
- **Area:** Security
- **Classification:** Production-readiness gap
- **Audit evidence:** Runtime-confirmed locally; production requires verification
- **Source finding:** [A013 — Unhandled route errors return development HTML stack traces](../security_best_practices_report.md#a013--unhandled-route-errors-return-development-html-stack-traces)
- **Related tickets:** [A010](A010-validate-writes-and-enforce-data-relationships.md), [A015](../functionality/A015-handle-api-failures-without-crashes-or-lost-work.md).

## Problem and evidence

Malformed metrics/export query values and a nonnumeric notes ID returned 500 `text/html` bodies containing the local server source path. There is no final JSON error middleware.

If run with development settings outside localhost, internals are exposed; even when stack traces are hidden, HTML errors violate the browser’s expected JSON contract.

## Affected code

[server/src/index.ts:60–75](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L60); [server/src/index.ts:116–139](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L116); [server/src/index.ts:141–205](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L141); [server/src/index.ts:255–266](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L255); [server/src/index.ts:320–323](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L320).

**Security guidance:** EXPRESS-ERROR-001.

## Tasks

- [x] Validate malformed query/body/path inputs before database access.
- [x] Add centralized JSON error handling and safe logging for otherwise unhandled route errors.
- [x] Document production startup settings and verify that neither mode exposes stack traces or internal paths in API responses.

## Acceptance criteria

- [x] Malformed requests have appropriate 400/404 responses; unexpected failures return safe JSON in both modes with no paths, SQL or stack traces.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Validate inputs and install a centralized API error handler returning a consistent, non-sensitive JSON envelope. Configure production mode at deployment and keep detailed logs redacted.

Express development stack traces are expected locally. Production stack exposure was not tested or assumed. No API process crash was observed.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Server structure/type refactor — 2026-09-26

Central JSON middleware handles HttpError, JSON parser failures (including 413), synchronous route failures and asynchronous summary failures. Logging emits only a generic failure label. In-memory HTTP checks exercised malformed queries/bodies, missing records, oversized bodies, a deliberately missing table and rejected mocked summaries in both Express development and production modes; error bodies contain no SQL, source paths or stack traces. server/README.md documents NODE_ENV=production startup selection. No hosted deployment was performed.

Verification before test removal: temporary HTTP checks passed using synthetic in-memory data and mocked providers. Both workspace builds passed. The user subsequently requested removal of test files and the test command; no permanent suite remains. The working database and seed file are preserved.

## API validation and errors regression verification — 2026-09-26

Existing middleware was reverified in development and production using disposable fixtures. Malformed input returned JSON 400, missing resources 404, malformed JSON 400 and oversized JSON 413. A deliberately missing table and a rejecting mocked summary provider returned generic JSON 500 without SQL, paths or stack traces. Captured application error logs contained only `API request failed`, without sensitive test details. Both builds passed. No server error-handling changes or new infrastructure were needed; no hosted deployment is claimed.
