# A001: Verify authentication tokens on every protected route

- **Status:** Done
- **Severity:** Critical
- **Area:** Security
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A001 — Authentication accepts forged and expired tokens](../security_best_practices_report.md#a001--authentication-accepts-forged-and-expired-tokens)
- **Related tickets:** [A005](A005-load-the-jwt-signing-secret-from-server-configuration.md), [A006](A006-keep-bearer-tokens-out-of-exports-and-logs.md), [A010](A010-validate-writes-and-enforce-data-relationships.md).

## Problem and evidence

Both authentication paths use `jwt.decode(token)`. A token signed with an unrelated audit key, `exp: 1`, and nonexistent user ID returned HTTP 200 and three users. Export also accepted a forged expired token. Missing and syntactically malformed tokens returned 401.

Anyone who can reach the API can impersonate users, read customer information, export notes, and perform protected writes without valid credentials.

## Affected code

`server/src/services/auth.ts`, `server/src/middleware/authenticate.ts`, and `server/src/routes/index.ts` (current structure; audit locations were pre-refactor).

**Security guidance:** REACT-AUTHZ-001; JWT signature/claims verification.

## Tasks

- [x] Replace decode-only authentication with a shared signature/expiry/claim verifier, including export.
- [x] Resolve the authenticated identity against an existing eligible database user.
- [x] Coordinate configured signing keys with A005 and add negative authentication cases.

## Acceptance criteria

- [x] All protected reads/writes and export reject wrong signatures, expiry, missing/invalid identity and malformed tokens; valid credentials retain intended access.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Use one shared verifier for every protected route and export; enforce an allowed signature algorithm, expiry, claim types, and an existing eligible user. Resolve authoritative identity from the database. Address A005 at the same time.

The README declares development-only authentication, but this is an executable bypass, not just a missing production feature. Decode does not verify signatures: [jsonwebtoken documentation](https://github.com/auth0/node-jsonwebtoken#jwtdecodetoken--options).

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Authentication verification — 2026-09-26

Implemented a shared HS256 signature/expiry verifier with required finite expiry, positive safe-integer identity and string profile claims. Both middleware paths resolve the current public user from a parameterized database lookup. User existence is the eligibility rule for this demo; no role/account-state policy was added. Token failures return safe JSON 401; database failures retain safe 500 handling.

Temporary in-memory checks passed: 243 HTTP requests covering every protected route, all three demo logins, invalid credentials, header/query export and precedence, 18 invalid-token cases, malformed expiry claims, authoritative identity changes and deleted users. Rejected writes left fixture tables unchanged. Wrong/old signatures, unsigned tokens, expiry, wrong algorithms, missing expiry/identity, unsafe IDs, invalid profile fields, future nbf and nonexistent users were rejected. Both workspace builds passed.

Browser smoke checks passed with a separate in-memory fixture: login, inbox, ticket detail, fake summary and CSV download. The downloaded CSV contained all 25 fixture rows. Screenshot: `output/playwright/b01/browser-smoke.png` (local, ignored). Checks used the connected browser after the CLI launcher could not reach npm.

Working database/WAL/SHM and seed-file hashes were unchanged during API checks. No permanent tests, dependencies, seed edits, migrations or real-provider calls were added. Export query-token transport remains intentionally deferred to A006.
