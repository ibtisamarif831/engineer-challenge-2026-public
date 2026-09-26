# A031: Distinguish login connectivity errors from bad credentials

- **Status:** Open
- **Severity:** Low
- **Area:** Usability and UX
- **Classification:** Current UX issue
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A031 — Login reports network failures as bad credentials](../usability_ux_audit_report.md#a031--login-reports-network-failures-as-bad-credentials)
- **Related tickets:** [A015](../functionality/A015-handle-api-failures-without-crashes-or-lost-work.md), [A026](A026-show-accurate-loading-and-save-feedback.md).

## Problem and evidence

Abort the login request to simulate no connectivity while entering valid test credentials. The alert says Invalid email or password, exactly as for an actual 401.

Users may keep changing valid credentials instead of recognizing a connectivity or server problem.

## Affected code

[web/src/components/Login.tsx:14–22](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Login.tsx#L14); [web/src/api.ts:8–16](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L8).

## Tasks

- [ ] Preserve a generic non-enumerating error for genuine invalid credentials.
- [ ] Show accurate retryable messages for network/server failures and retain the email field.
- [ ] Announce errors through the existing alert region and verify retry behavior.

## Acceptance criteria

- [ ] 401 remains a generic credential error; offline and 5xx produce accurate retryable messages announced by the existing alert region.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Distinguish invalid credentials from network/server failures while keeping authentication errors non-enumerating. Offer a retry and retain the email field.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## UI error handling update — 2026-09-26

Implemented feature API client errors, root/workspace render boundaries, scoped load/action alerts, read retries, session-expiry guidance, and distinct login credential/connectivity messages. Failed status updates retain the last confirmed state; failed note/assignment saves retain entered text. Inbox polling now uses the guarded current-query load path.

Verification: web TypeScript/Vite build and diff whitespace check passed. A temporary browser fixture verified a 500 inbox error, keyboard retry to successful rows, a failed resolve retaining Open status, visible summary failure, and render-crash fallback. Inspected error layouts at 390/768/1280 viewport widths. No working database changes or permanent test infrastructure.

Status remains Open: full 401/404/429/500/non-JSON/network acceptance matrix, login-specific browser checks, runtime success-payload validation, and complete session recovery remain unverified or deferred.
