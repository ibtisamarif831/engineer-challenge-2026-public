# A019: Make repeated note and status actions safe

- **Status:** Open
- **Severity:** Medium
- **Area:** Functionality
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A019 — Repeated actions produce duplicate notes and reverse status changes](../functional_audit_report.md#a019--repeated-actions-produce-duplicate-notes-and-reverse-status-changes)
- **Related tickets:** [A015](A015-handle-api-failures-without-crashes-or-lost-work.md), [A020](A020-refresh-dependent-views-after-ticket-mutations.md), [A025](A025-align-resolve-responses-with-the-declared-api-contract.md), [A026](../usability-ux/A026-show-accurate-loading-and-save-feedback.md).

## Problem and evidence

Two identical resolve requests toggled a ticket to open and then back to resolved. Double-clicking Add note with responses delayed sent two POSTs and created two DB rows, but the closure-based `setNotes([note, ...notes])` showed only one new note until reload. The button remained enabled while pending.

Retries and ordinary double-clicks duplicate work or undo the intended state; the immediate UI can hide the duplication.

## Affected code

[server/src/index.ts:268–299](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L268); [web/src/components/ItemDetail.tsx:69–100](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L69); [web/src/components/detail/NotesPanel.tsx:32](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/detail/NotesPanel.tsx#L32).

## Tasks

- [ ] Guard note, resolve and related mutation controls while the corresponding request is pending.
- [ ] Send an explicit desired status instead of toggling, and update both API and client contracts.
- [ ] Define note retry/idempotency behavior and use functional state updates so overlapping completions cannot hide notes.

## Acceptance criteria

- [ ] Double-click and replay requests under latency: one intended note appears and persists; repeated “resolve” keeps the item resolved; concurrent completions do not drop notes from the UI.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Use per-action pending guards and functional state updates. Send explicit desired status rather than a toggle, and define retry/idempotency behavior for note creation.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
