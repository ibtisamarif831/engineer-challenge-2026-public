# A012: Bound login and summarization abuse

- **Status:** Open
- **Severity:** Medium
- **Area:** Security
- **Classification:** Production-readiness gap
- **Audit evidence:** Source-confirmed
- **Source finding:** [A012 — Login and live summarization lack application abuse controls](../security_best_practices_report.md#a012--login-and-live-summarization-lack-application-abuse-controls)
- **Related tickets:** [A024](../functionality/A024-handle-provider-failures-and-summary-timeouts.md), [A026](../usability-ux/A026-show-accurate-loading-and-save-feedback.md).

## Problem and evidence

No login throttle, summary quota/concurrency cap, input/output token budget or application-level provider timeout is configured. Repeated summary clicks remain enabled. A mocked hanging provider call had no AbortSignal and stayed pending until the audit’s 150 ms cutoff.

Public deployment could permit credential guessing and repeated paid or long-lived provider calls. Fake-summary mode does not incur provider costs.

## Affected code

[server/src/index.ts:60–75](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L60); [server/src/index.ts:307–317](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L307); [server/src/llm.ts:7–18](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/llm.ts#L7).

**Security guidance:** EXPRESS-AUTH-001; EXPRESS-DOS-001.

## Tasks

- [ ] Choose and document login throttles, per-user summary quotas, concurrency limits and model budgets for deployment.
- [ ] Enforce server-side limits and provider cancellation; coordinate the shared timeout path with A024.
- [ ] Expose retryable limit responses and test with bounded synthetic requests rather than a load attack.

## Acceptance criteria

- [ ] Bounded tests verify rate-limit responses, concurrency/budget enforcement and deadline cancellation; failed calls do not leave controls stuck.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Choose user/IP limits and summary budgets appropriate to the deployment; enforce server-side concurrency/timeouts and bounded model input/output. Reflect retryable errors and pending state in the UI.

No brute-force, load test or paid call was performed. Gateway controls may exist outside the repo. Provider response handling is separately covered by A024.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
