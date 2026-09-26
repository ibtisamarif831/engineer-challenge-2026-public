# A025: Align resolve responses with the declared API contract

- **Status:** Done
- **Severity:** Low
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A025 — Resolve responses do not match their declared FeedbackItem contract](../functional_audit_report.md#a025--resolve-responses-do-not-match-their-declared-feedbackitem-contract)
- **Related tickets:** [A019](A019-make-repeated-note-and-status-actions-safe.md).

## Problem and evidence

The resolve route returns `{ ...row, status }`, while read/assignment routes use serializeFeedback. A successful resolve response lacked customer_name, customer_email and assignee_name even though toggleResolve promises FeedbackItem.

Current screens mask the mismatch by ignoring the response or using only status, but a caller that uses the promised object loses display fields.

## Affected code

[server/src/index.ts:292–300](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L292); [web/src/api.ts:38–43](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L38); [web/src/types.ts:1–16](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/types.ts#L1).

## Tasks

- [x] Choose a serialized FeedbackItem response or an intentionally narrower status response.
- [x] Align the server implementation, API helper type and consumers with that single contract.
- [x] Add contract checks for successful read, assignment and resolve responses.

## Acceptance criteria

- [x] Contract checks compare successful read, assignment and resolve results to their declared types; consumers need no unsafe assumptions.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Return the same serialized item shape as other item endpoints, or deliberately define and use a narrower mutation response type across both boundaries.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Server structure/type refactor — 2026-09-26

Read, assignment and resolve now return the shared FeedbackItem contract through services/feedback.ts serialization. web/src/api.ts consumes shared types. In-memory API checks assert required field names and representative values across read/assignment and both resolve/reopen directions, including customer and assignee display fields. Both workspace builds pass. Toggle semantics/idempotency remain separate A019 work.

Verification before test removal: temporary HTTP checks passed using synthetic in-memory data and mocked providers. Both workspace builds passed. The user subsequently requested removal of test files and the test command; no permanent suite remains. The working database and seed file are preserved.
