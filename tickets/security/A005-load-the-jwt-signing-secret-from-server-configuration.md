# A005: Load the JWT signing secret from server configuration

- **Status:** Done
- **Severity:** High
- **Area:** Security
- **Classification:** Production-readiness gap
- **Audit evidence:** Source-confirmed
- **Source finding:** [A005 — JWT configuration is ignored in favor of a public constant](../security_best_practices_report.md#a005--jwt-configuration-is-ignored-in-favor-of-a-public-constant)
- **Related tickets:** [A001](A001-verify-authentication-tokens-on-every-protected-route.md).

## Problem and evidence

The environment example declares `JWT_SECRET`, but auth.ts exports a literal signing secret and never reads that variable. The literal is not reproduced here.

Changing the documented environment setting does not rotate the signing key. Fixing A001 alone would leave tokens forgeable using the repository constant.

## Affected code

`server/src/config.ts`, `server/src/services/auth.ts`, `server/.env.example`, and README setup instructions (current structure).

**Security guidance:** Server secret configuration.

## Tasks

- [x] Read the signing key from server-only configuration and document local-demo versus production behavior.
- [x] Reject missing or unsafe production configuration and define rotation of the existing public key.
- [x] Coordinate signing and verification changes with A001; verify key changes invalidate old-key tokens.

## Acceptance criteria

- [x] Tokens signed with the old/test key are rejected; changing configured keys changes verification/signing; production startup rejects a missing key.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Load a strong server-only secret from configuration; fail startup when it is missing/unsafe outside an explicit local-demo mode. Rotate the existing key before real deployment.

The current bypass in A001 is independently exploitable. This is a separate configuration defect that must not survive that fix.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Authentication verification — 2026-09-26

`config.ts` loads dotenv and reads JWT_SECRET once. Missing/blank values, the known example/old demo placeholders and values shorter than 32 UTF-8 bytes fail before the listener starts, in every environment. There is no local-demo bypass or hardcoded signing fallback. Signing and verification share the configured key and explicitly allow only HS256; the existing seven-day lifetime remains.

Twelve fresh-process startup checks passed across development and production (missing, empty, whitespace, example placeholder, old demo key and 31-byte values). A fresh process with a different random key rejected the prior token and successfully signed/verified a new login token. Tokens signed using the old public key failed on all protected routes and export. Unexpected database failures returned safe JSON 500. Both workspace builds and the disposable browser smoke check passed.

README documents `openssl rand -hex 32`, setting server/.env, restart and fresh login; the example now leaves JWT_SECRET empty. Existing local .env files were left unchanged; verification used temporary random keys without printing them. Restarting with a configured random key invalidates the old demo-key sessions. No key-management service or account migration was introduced.
