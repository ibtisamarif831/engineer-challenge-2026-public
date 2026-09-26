# Pulse security best-practices audit

## Executive summary

Two critical flaws were reproduced against synthetic data: forged tokens bypass authentication, and request-controlled SQL can read unrelated records and update the entire queue. Stored note XSS and plaintext-password disclosure are also confirmed. Fix these before trusting this app with non-demo data. Production configuration gaps are separated below; the README explicitly calls this a development-only challenge.

Audit date: **2026-09-26**. Revision: **12566cc3f2291269cede31274c15471d6b971212**. Initial tracked working tree: clean.

Scope: all 31 application source files, HTML/configuration examples, manifests, lockfile, API contracts and documented workflows. Tests used an isolated temporary copy, synthetic seeded records, separate local ports and fake/mocked LLM responses. No application source, public interfaces, dependencies or existing database were changed. [Whole-app overview](app_audit_report.md) contains coverage, environment and limitations.

Severity reflects impact under the stated conditions, not a claim that this development-only repository is publicly deployed. **Runtime-confirmed** means observed behavior; **source-confirmed** means a traced code/configuration path; **requires verification** identifies an unresolved policy, deployment or exploit prerequisite. IDs are stable across all reports.

## Current findings

### Critical severity

#### A001 — Authentication accepts forged and expired tokens

**Critical · Runtime-confirmed · Current defect**

**Rule:** REACT-AUTHZ-001; JWT signature/claims verification.

**Location / affected flow:** [server/src/auth.ts:6–20](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/auth.ts#L6); [server/src/index.ts:37–53](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L37).

**Evidence and reproduction:** Both authentication paths use `jwt.decode(token)`. A token signed with an unrelated audit key, `exp: 1`, and nonexistent user ID returned HTTP 200 and three users. Export also accepted a forged expired token. Missing and syntactically malformed tokens returned 401.

**Impact:** Anyone who can reach the API can impersonate users, read customer information, export notes, and perform protected writes without valid credentials.

**Expected behavior / recommended fix:** Use one shared verifier for every protected route and export; enforce an allowed signature algorithm, expiry, claim types, and an existing eligible user. Resolve authoritative identity from the database. Address A005 at the same time.

**Verification:** All protected reads/writes and export reject wrong signatures, expiry, missing/invalid identity and malformed tokens; valid credentials retain intended access.

**Limits / context:** The README declares development-only authentication, but this is an executable bypass, not just a missing production feature. Decode does not verify signatures: [jsonwebtoken documentation](https://github.com/auth0/node-jsonwebtoken#jwtdecodetoken--options).

#### A002 — Request data can alter SQL predicates and update all feedback

**Critical · Runtime-confirmed · Current defect**

**Rule:** EXPRESS-INJECT-001.

**Location / affected flow:** [server/src/index.ts:77–103](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L77); [server/src/index.ts:116–129](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L116); [server/src/index.ts:145–164](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L145); [server/src/index.ts:236–261](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L236).

**Evidence and reproduction:** String interpolation reaches feedback filters, metrics ranges, export filters, assignment values/ID, and notes ID. In the isolated DB, a status value `open' OR 1=1 --` returned all 80 records; notes ID `99999 OR 1=1` returned four unrelated notes. An assignment priority `urgent', due_at = NULL WHERE 1=1 --` changed all 80 rows to urgent. Ordinary apostrophes also trigger 500s.

**Impact:** An API caller can read outside requested predicates and corrupt the entire feedback queue; A001 makes these paths accessible without legitimate authentication.

**Expected behavior / recommended fix:** Parameterize every request-derived SQL value, validate integer IDs and enum/range inputs, and construct only fixed SQL clauses. Do not rely on escaping quotes or reject legitimate apostrophes. Keep update predicates fixed.

**Verification:** Repeat the harmless predicate/mass-update probes only on disposable fixtures: no unrelated rows change, invalid values return 400, and names such as O’Brien work.

**Limits / context:** Read and write injection were demonstrated. No OS-command execution, stacked statements, or filesystem access is claimed. Metrics/export interpolation is source-confirmed; malformed-quote failures were observed there.

### High severity

#### A003 — Stored notes and other HTML sinks execute untrusted script

**High · Runtime-confirmed · Current defect**

**Rule:** REACT-XSS-001; REACT-AUTH-001.

**Location / affected flow:** [web/src/components/detail/NotesPanel.tsx:34–40](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/detail/NotesPanel.tsx#L34); [web/src/components/ItemDetail.tsx:132–154](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L132); [server/src/index.ts:268–285](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L268).

**Evidence and reproduction:** Add a synthetic note containing an image with an `onerror` handler that sets `window.__pulseAuditXss=1`. The marker executed immediately and again after reopening the ticket. A mocked HTML summary also executed a harmless marker. All three sinks use `dangerouslySetInnerHTML` without sanitization.

**Impact:** An attacker-controlled note can run code in another agent’s app session. Browser-stored tokens and customer data are accessible to same-origin script; no exfiltration was performed.

**Expected behavior / recommended fix:** Render notes, feedback and summaries as text unless rich HTML is required. If required, apply a maintained allowlist sanitizer consistently. Add a compatible CSP as defense in depth, and reconsider persistent token storage.

**Verification:** Handler attributes, script-bearing URLs and active markup remain inert after save/reload in every sink; intended formatting still works.

**Limits / context:** Notes are a real persisted input path. Summary execution used a mocked provider response; no real model was called. Feedback HTML is source-confirmed because this repo has no feedback-ingestion endpoint.

#### A004 — The users endpoint exposes every plaintext password

**High · Runtime-confirmed · Current defect**

**Rule:** REACT-CONFIG-001; least-privilege response projection.

**Location / affected flow:** [server/src/index.ts:60–65](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L60); [server/src/index.ts:111–113](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L111); [server/src/seed.ts:9–15](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/seed.ts#L9); [web/src/types.ts:18–24](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/types.ts#L18).

**Evidence and reproduction:** `SELECT * FROM users` is serialized directly. A normal authenticated request returned a string password field for all three seeded users. Login compares `user.password !== password`; the database stores plaintext. Values are intentionally omitted from the evidence.

**Impact:** Opening assignment data exposes other accounts’ credentials to every caller, compounded by the authentication bypass.

**Expected behavior / recommended fix:** Return an explicit public user projection and remove password from the browser type. For any non-demo accounts, store password hashes with a suitable password-hashing algorithm and verify them on login; rotate exposed credentials if real accounts ever used this code.

**Verification:** User/login JSON and frontend bundles contain no passwords or password hashes; correct and incorrect password checks work with hashed fixtures.

**Limits / context:** Public sample credentials are intentional challenge fixtures. Returning all passwords is still a current disclosure; production password storage is the related readiness requirement.

### Medium severity

#### A006 — Bearer credentials enter export URLs and error logs

**Medium · Runtime-confirmed · Current defect**

**Rule:** EXPRESS-ERROR-001; REACT-AUTH-001.

**Location / affected flow:** [web/src/api.ts:60–61](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L60); [web/src/components/Inbox.tsx:87–88](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L87); [server/src/index.ts:40](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L40); [server/src/index.ts:105–106](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L105); [server/src/auth.ts:21–22](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/auth.ts#L21).

**Evidence and reproduction:** The browser download URL contained a `token` query parameter. The API error log contained a bearer token after a malformed search; verification recorded only a boolean, never the token. Source logs the full Authorization header.

**Impact:** URLs and logs create extra places where credentials can be retained or copied, increasing exposure through request logging, download metadata and diagnostics.

**Expected behavior / recommended fix:** Download using an authenticated fetch and a Blob/object URL, then revoke it. Remove query-token support. Redact Authorization and sensitive bodies from logs; use request IDs and safe error metadata.

**Verification:** Exports still download correctly with headers only; URLs, error logs, screenshots and telemetry contain no credentials.

**Limits / context:** Exposure to URLs and the local log is demonstrated; persistence in a specific browser history, proxy or third-party log system was not tested.

#### A007 — CSV quoting leaves spreadsheet formulas active

**Medium · Runtime-confirmed · Current defect**

**Rule:** CSV/formula injection.

**Location / affected flow:** [server/src/index.ts:56–57](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L56); [server/src/index.ts:181–204](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L181).

**Evidence and reproduction:** The seeded `=HYPERLINK(...)` message was exported with the formula prefix intact inside a quoted cell. csvCell doubles quotes but does not neutralize formula-leading text.

**Impact:** A spreadsheet application may interpret customer-controlled text as a formula when an agent opens an export.

**Expected behavior / recommended fix:** Apply a documented spreadsheet-safe text encoding to untrusted cells, including dangerous prefixes and leading control characters. Preserve proper CSV escaping and test the intended spreadsheet import path.

**Verification:** Export malicious-prefix, tab/newline, quote and multiline fixtures; they import as literal text while ordinary CSV values remain intact.

**Limits / context:** Formula text in the file is confirmed; a spreadsheet was not opened and formula execution is not claimed. See [OWASP CSV injection](https://community.owasp.org/attacks/CSV_Injection).

#### A009 — The installed dependency tree has outstanding advisories

**Medium · Source-confirmed; exploit reachability requires verification · Current dependency risk**

**Rule:** EXPRESS-DEPS-001; REACT-SUPPLY-001.

**Location / affected flow:** [package-lock.json:1554](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/package-lock.json#L1554); [package-lock.json:2128](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/package-lock.json#L2128); [package-lock.json:2963](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/package-lock.json#L2963).

**Evidence and reproduction:** Live npm audit reported nine affected package entries (five high, four moderate). With `--omit=dev`, only three moderate entries remain: Express 4.22.2, body-parser 1.20.5 and qs 6.15.3. Counts include propagated dependency effects, not nine distinct app exploits.

**Impact:** The runtime parser chain carries known upstream risks; build-tool advisories add maintenance exposure but are not evidence of browser/runtime compromise.

**Expected behavior / recommended fix:** Review the qs advisories and update the runtime parser dependency chain to patched compatible versions through a reviewed lockfile change. Triage developer-tool updates separately; rerun builds and malformed-query tests.

**Verification:** Run both audits after changes, record any accepted advisories and their reachability analysis, and pass API/browser regressions.

**Limits / context:** No advisory exploit or load test was run. The invalid body-parser limit prerequisite is absent (default JSON limit is used); qs comma parsing is not explicitly enabled. Do not equate npm severity with proven app exposure. See the dependency appendix.

#### A010 — Write endpoints persist invalid and orphaned data

**Medium · Runtime-confirmed · Current defect**

**Rule:** EXPRESS-INPUT-001; EXPRESS-INPUT-002.

**Location / affected flow:** [server/src/index.ts:236–274](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L236); [server/src/seed.ts:26–48](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/seed.ts#L26).

**Evidence and reproduction:** Assignment accepted owner 99999, priority `banana`, and due date `not-a-date` with 200. Posting a whitespace note returned 201. Posting to nonexistent ticket 99999 created an orphan note; string `"false"` was stored as private=1. A forged nonexistent author was also persisted (A001). Tables declare no foreign keys or enum checks.

**Impact:** Invalid records break display assumptions and undermine author/ticket relationships. Validation in React controls cannot protect direct API calls.

**Expected behavior / recommended fix:** Validate request shapes/types, enum values, dates, positive IDs and bounded trimmed note bodies before writes; check referenced rows. Add compatible database integrity constraints after cleaning invalid data. Reject missing resources with 404.

**Verification:** Invalid requests return 400/404 and leave the database unchanged; valid assignments/notes retain the same browser-visible behavior.

**Limits / context:** The default Express JSON parser already has a body-size limit; this finding concerns domain validation, not an unlimited HTTP request body.

## Production-readiness gaps

### High severity

#### A005 — JWT configuration is ignored in favor of a public constant

**High · Source-confirmed · Production-readiness gap**

**Rule:** Server secret configuration.

**Location / affected flow:** [server/src/auth.ts:4](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/auth.ts#L4); [server/.env.example:1](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/.env.example#L1); [server/src/index.ts:68–71](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L68).

**Evidence and reproduction:** The environment example declares `JWT_SECRET`, but auth.ts exports a literal signing secret and never reads that variable. The literal is not reproduced here.

**Impact:** Changing the documented environment setting does not rotate the signing key. Fixing A001 alone would leave tokens forgeable using the repository constant.

**Expected behavior / recommended fix:** Load a strong server-only secret from configuration; fail startup when it is missing/unsafe outside an explicit local-demo mode. Rotate the existing key before real deployment.

**Verification:** Tokens signed with the old/test key are rejected; changing configured keys changes verification/signing; production startup rejects a missing key.

**Limits / context:** The current bypass in A001 is independently exploitable. This is a separate configuration defect that must not survive that fix.

### Medium severity

#### A008 — The frontend offers a public build-time slot for an LLM secret

**Medium · Source-confirmed · Production-readiness gap**

**Rule:** REACT-CONFIG-001.

**Location / affected flow:** [web/src/config.ts:1–2](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/config.ts#L1); [web/src/api.ts:110–120](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L110); [web/.env.example:2](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/.env.example#L2); [server/src/llm.ts:6–11](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/llm.ts#L6).

**Evidence and reproduction:** `VITE_OPENAI_API_KEY` is read by browser code and sent as `x-llm-key`; the server ignores that header and uses its own environment key. The current local frontend setting was checked as empty without printing its value.

**Impact:** If someone fills this apparent configuration option with a real secret, it becomes downloadable in client code and visible in requests.

**Expected behavior / recommended fix:** Remove the frontend secret variable and custom key header; document only the server-side key. Inspect released bundles and rotate any key that was ever published.

**Verification:** A synthetic secret sentinel never appears in browser assets or requests; fake and server-backed summaries still work.

**Limits / context:** No current real-key exposure was found. Severity is conditional on configuration. [Vite documents client exposure of VITE-prefixed values](https://vite.dev/guide/env-and-mode#env-variables).

#### A012 — Login and live summarization lack application abuse controls

**Medium · Source-confirmed · Production-readiness gap**

**Rule:** EXPRESS-AUTH-001; EXPRESS-DOS-001.

**Location / affected flow:** [server/src/index.ts:60–75](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L60); [server/src/index.ts:307–317](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L307); [server/src/llm.ts:7–18](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/llm.ts#L7).

**Evidence and reproduction:** No login throttle, summary quota/concurrency cap, input/output token budget or application-level provider timeout is configured. Repeated summary clicks remain enabled. A mocked hanging provider call had no AbortSignal and stayed pending until the audit’s 150 ms cutoff.

**Impact:** Public deployment could permit credential guessing and repeated paid or long-lived provider calls. Fake-summary mode does not incur provider costs.

**Expected behavior / recommended fix:** Choose user/IP limits and summary budgets appropriate to the deployment; enforce server-side concurrency/timeouts and bounded model input/output. Reflect retryable errors and pending state in the UI.

**Verification:** Bounded tests verify rate-limit responses, concurrency/budget enforcement and deadline cancellation; failed calls do not leave controls stuck.

**Limits / context:** No brute-force, load test or paid call was performed. Gateway controls may exist outside the repo. Provider response handling is separately covered by A024.

### Low severity

#### A011 — Production browser and response protections are unspecified

**Low · Runtime-confirmed locally; deployment requires verification · Production-readiness gap**

**Rule:** EXPRESS-CORS-001; REACT-HEADERS-001.

**Location / affected flow:** [server/src/index.ts:9–11](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L9); [web/index.html:1–12](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/index.html#L1); [web/vite.config.ts:1–6](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/vite.config.ts#L1).

**Evidence and reproduction:** The local API returned wildcard CORS and no CSP, nosniff or explicit cache policy on the tested protected response. No deployment/edge policy appears in the repository.

**Impact:** An eventual deployment lacks a documented boundary for allowed frontend origins, framing and sensitive-response caching; missing defense-in-depth increases consequences of other flaws.

**Expected behavior / recommended fix:** Define the actual deployment origins and configure CORS narrowly. Set appropriate browser policies at the frontend host and response/cache policies at the API, validating compatibility before enforcement.

**Verification:** Inspect headers on the real frontend shell and protected API/export responses; allowed-origin behavior works and unintended origins are excluded.

**Limits / context:** Wildcard CORS does not by itself grant a foreign site a bearer token, and this app does not use cookie authentication. Edge settings are unknown. Local HTTP is not reported as a TLS vulnerability; no HSTS rollout is prescribed.

#### A013 — Unhandled route errors return development HTML stack traces

**Low · Runtime-confirmed locally; production requires verification · Production-readiness gap**

**Rule:** EXPRESS-ERROR-001.

**Location / affected flow:** [server/src/index.ts:60–75](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L60); [server/src/index.ts:116–139](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L116); [server/src/index.ts:141–205](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L141); [server/src/index.ts:255–266](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L255); [server/src/index.ts:320–323](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L320).

**Evidence and reproduction:** Malformed metrics/export query values and a nonnumeric notes ID returned 500 `text/html` bodies containing the local server source path. There is no final JSON error middleware.

**Impact:** If run with development settings outside localhost, internals are exposed; even when stack traces are hidden, HTML errors violate the browser’s expected JSON contract.

**Expected behavior / recommended fix:** Validate inputs and install a centralized API error handler returning a consistent, non-sensitive JSON envelope. Configure production mode at deployment and keep detailed logs redacted.

**Verification:** Malformed requests have appropriate 400/404 responses; unexpected failures return safe JSON in both modes with no paths, SQL or stack traces.

**Limits / context:** Express development stack traces are expected locally. Production stack exposure was not tested or assumed. No API process crash was observed.

## Dependency appendix

`npm audit --json` and `npm audit --omit=dev --json` completed against the live npm advisory service. No audit fix or package update was run. The initial sandbox DNS attempt failed; the permitted network-enabled retry succeeded.

| Installed package | Version | npm severity | Placement / triage |
| --- | --- | --- | --- |
| express | 4.22.2 | Moderate | API runtime; propagated qs effect |
| body-parser | 1.20.5 | Moderate overall | API runtime; qs effect plus low-severity invalid-limit advisory; app uses default limit |
| qs | 6.15.3 | Moderate | API query parser; inspect applicability of each upstream prerequisite |
| baseline-browser-mapping | 2.10.40 | Moderate | Development/browser-target tooling |
| browserslist | 4.28.4 | High | Development/build tooling; not an exposed app endpoint |
| concurrently | 9.2.3 | High | Development launcher; propagated shell-quote effect |
| shell-quote | 1.8.4 | High | Development command parsing |
| nanoid | 3.3.15 | High | Development dependency in this lockfile |
| postcss | 8.5.15 | High | CSS build tooling |

Runtime references: [qs isBuffer advisory](https://github.com/ljharb/qs/security/advisories/GHSA-4mjr-xmp4-gh2g), [qs comma-parsing advisory](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx), and [body-parser invalid-limit advisory](https://github.com/advisories/GHSA-v422-hmwv-36x6). Full package-level metadata and advisory URLs are preserved in `output/playwright/npm-audit-all.json` and `npm-audit-runtime.json`.

## Passed checks and boundaries

- All eleven protected route/method probes rejected a missing token with 401. Malformed non-JWT text was also rejected. These checks do not mitigate A001.
- Login, item lookup, customer lookup, note creation and status updates use parameter binding in the specific statements reviewed; this does not protect the interpolated statements in A002.
- Local `.env` and SQLite files are ignored by Git. The frontend key slot was empty; no real secret was copied into the audit artifacts.
- No uploads, redirects based on user-controlled destinations, shell execution, service worker, postMessage handler or third-party client script was found in application source. SSRF was not found: the LLM URL is fixed.
- Classic cookie-based CSRF does not apply to the current bearer-header design. Local HTTP, sequential IDs and shared access within an internal inbox are not automatically reported as vulnerabilities.
- Private-note and role requirements need product clarification (A030 in the UX report). Prompt quality/instruction-following was not evaluated with a live model.
- Full live deployment, gateway settings, rate/load limits, session revocation policy, real spreadsheet execution, and advisory exploitation were not verified. No destructive or high-volume tests were run outside the disposable fixtures.

Fix order: A001/A005 and A002 first; A003/A004 next; then credential handling, validation, exports and dependency triage. Review the production gaps before any real deployment. No fixes were applied by this audit.
