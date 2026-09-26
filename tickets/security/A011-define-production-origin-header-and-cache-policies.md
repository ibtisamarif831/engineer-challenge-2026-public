# A011: Define production origin header and cache policies

- **Status:** Open
- **Severity:** Low
- **Area:** Security
- **Classification:** Production-readiness gap
- **Audit evidence:** Runtime-confirmed locally; deployment requires verification
- **Source finding:** [A011 — Production browser and response protections are unspecified](../security_best_practices_report.md#a011--production-browser-and-response-protections-are-unspecified)
- **Related tickets:** [A003](A003-prevent-script-execution-in-notes-feedback-and-summaries.md), [A006](A006-keep-bearer-tokens-out-of-exports-and-logs.md).

## Problem and evidence

The local API returned wildcard CORS and no CSP, nosniff or explicit cache policy on the tested protected response. No deployment/edge policy appears in the repository.

An eventual deployment lacks a documented boundary for allowed frontend origins, framing and sensitive-response caching; missing defense-in-depth increases consequences of other flaws.

## Affected code

[server/src/index.ts:9–11](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L9); [web/index.html:1–12](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/index.html#L1); [web/vite.config.ts:1–6](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/vite.config.ts#L1).

**Security guidance:** EXPRESS-CORS-001; REACT-HEADERS-001.

## Tasks

- [ ] Identify the actual frontend/API deployment origins and where edge/server policies are owned.
- [ ] Configure narrow CORS, appropriate frontend security headers and sensitive-response caching rules.
- [ ] Inspect runtime deployment headers and verify allowed-origin, framing and cache behavior without breaking local development.

## Acceptance criteria

- [ ] Inspect headers on the real frontend shell and protected API/export responses; allowed-origin behavior works and unintended origins are excluded.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Define the actual deployment origins and configure CORS narrowly. Set appropriate browser policies at the frontend host and response/cache policies at the API, validating compatibility before enforcement.

Wildcard CORS does not by itself grant a foreign site a bearer token, and this app does not use cookie authentication. Edge settings are unknown. Local HTTP is not reported as a TLS vulnerability; no HSTS rollout is prescribed.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Implementation progress — 2026-09-26

- Added `CORS_ORIGINS`, a comma-separated explicit-origin server setting. Local development defaults to the two localhost Vite origins; production must set the deployed frontend origin(s). Wildcard `*` configuration is rejected at startup.
- API responses now send `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, and `Cache-Control: no-store`. CORS allows only configured origins and the required `Authorization`/`Content-Type` headers.
- `npm run build`, `npm run build --workspace server`, and `git diff --check` passed.

Remaining: the actual frontend/API deployment origins and edge-owned frontend headers are not available in this repository, so real deployment header inspection and final acceptance remain open.
