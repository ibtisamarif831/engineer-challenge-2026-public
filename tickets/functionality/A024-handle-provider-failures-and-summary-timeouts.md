# A024: Handle provider failures and summary timeouts

- **Status:** Open
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed with mocked provider failures
- **Source finding:** [A024 — Summarization failures are opaque and provider calls lack a deadline](../functional_audit_report.md#a024--summarization-failures-are-opaque-and-provider-calls-lack-a-deadline)
- **Related tickets:** [A008](../security/A008-remove-the-frontend-llm-secret-configuration.md), [A012](../security/A012-bound-login-and-summarization-abuse%20%28defferred%29.md), [A015](A015-handle-api-failures-without-crashes-or-lost-work.md), [A026](../usability-ux/A026-show-accurate-loading-and-save-feedback.md).

## Problem and evidence

Mocked 429 and malformed provider responses caused `Cannot read properties of undefined (reading 0)` because choices is accessed unconditionally. A mocked non-resolving fetch received no AbortSignal. The UI silently swallowed a 429 summary response and displayed no error. A nonexistent feedback ID returns 500 rather than 404.

Agents cannot distinguish waiting, quota/network failure and completion; provider failures become generic server failures and may hold requests open.

## Affected code

[server/src/llm.ts:7–21](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/llm.ts#L7); [server/src/index.ts:307–316](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L307); [web/src/components/ItemDetail.tsx:75–80](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L75).

## Tasks

- [x] Check feedback existence before calling the provider.
- [ ] Validate provider status and response shape, add deadline cancellation, and map failures to stable API errors.
- [ ] Display pending/success/retryable failure states and stop swallowing summary errors; coordinate limits with A012.

## Acceptance criteria

- [ ] Fake success, mocked provider 401/429/500, malformed/empty choices, disconnect and timeout all settle to the right UI state without a real external call.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Check resource existence and provider status/schema, configure a deadline with cancellation, and return stable actionable errors. Show pending, success and retryable failure states; avoid swallowing exceptions.

The 150 ms mock cutoff demonstrated a pending call and absence of an application signal, not the provider’s eventual network timeout. No live-model quality or prompt-injection resistance claim is made.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Server structure/type refactor — 2026-09-26

Summary input/resource validation now returns 400/404 before the provider call. integrations/llm.ts now narrows unknown provider JSON. The HTTP checks exercised injected summary success and rejection; the adapter-specific malformed-response checks were removed before execution when the user deferred tests, so those paths are source-reviewed only. Provider HTTP-status mapping, deadline/cancellation, limits and UI recovery remain deferred; the original ticket stays Open.

Verification before test removal: temporary HTTP checks passed using synthetic in-memory data and mocked providers. Both workspace builds passed. The user subsequently requested removal of test files and the test command; no permanent suite remains. The working database and seed file are preserved.
