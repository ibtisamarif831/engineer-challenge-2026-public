# A004: Remove credential disclosure

- **Status:** Done
- **Severity:** High
- **Area:** Security
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A004 — The users endpoint exposes every plaintext password](../security_best_practices_report.md#a004--the-users-endpoint-exposes-every-plaintext-password)
- **Related tickets:** [A001](A001-verify-authentication-tokens-on-every-protected-route.md), [A010](A010-validate-writes-and-enforce-data-relationships.md).

## Problem and evidence

`SELECT * FROM users` is serialized directly. A normal authenticated request returned a string password field for all three seeded users. Login compares `user.password !== password`; the database stores plaintext. Values are intentionally omitted from the evidence.

Opening assignment data exposes other accounts’ credentials to every caller, compounded by the authentication bypass.

## Affected code

[server/src/index.ts:60–65](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L60); [server/src/index.ts:111–113](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L111); [server/src/seed.ts:9–15](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/seed.ts#L9); [web/src/types.ts:18–24](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/types.ts#L18).

**Security guidance:** REACT-CONFIG-001; least-privilege response projection.

## Tasks

- [x] Return an explicit public-user projection and remove password fields from browser types.
- [x] Keep sample fixtures explicitly development-only.

## Acceptance criteria

- [x] User/login responses expose only public user fields; browser user types exclude credentials and built assets contain no embedded demo passwords. Correct and incorrect demo password checks work.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Return an explicit public user projection and remove password from the browser type. Preserve the existing test-data login and demo password comparison.

Public sample credentials are intentional challenge fixtures. The API disclosure is fixed; this ticket covers that disclosure only.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Server structure/type refactor — 2026-09-26

The disclosure portion is complete: services/users.ts selects id/email/name/role explicitly, login returns the same public projection, and shared/types.ts excludes password from User. Isolated tests verify successful/failed demo login and password-free login/user responses. The ticket originally remained Open for non-demo account requirements; those requirements were subsequently removed by the user scope decision below.

Verification before test removal: temporary HTTP checks passed using synthetic in-memory data and mocked providers. Both workspace builds passed. The user subsequently requested removal of test files and the test command; no permanent suite remains. The working database and seed file are preserved.

## Authentication disclosure regression verification — 2026-09-26

Reverified the existing public projection without further frontend or response-shape changes. All three demo logins returned only id/email/name/role in user objects; the users endpoint returned the same field list. Verified signed token payloads contained only those public fields plus iat/exp. Correct demo passwords succeeded; incorrect passwords and unknown users returned 401. Both builds and disposable browser login/inbox/detail/export checks passed.

A004 is Done under the revised test-data-only scope below; plaintext demo password storage and public challenge credentials are unchanged.

## User scope update — 2026-09-26

The user confirmed that this project will use test data for now and requested removal of real-account migration work. Password hashing/hashed fixtures, account migration/reset paths and real-account credential rotation have been removed from this ticket and the backlog, rather than left as deferred requirements. This is a scope change, not an implementation of those features. Any future real-account work requires a new explicit request. The original audit report remains unchanged.

The completed disclosure checks above satisfy the revised ticket. An additional source/built-asset scan found none of the three seeded password values in web/src or web/dist. No runtime code, credentials, seed data or database contents changed for this scope update.
