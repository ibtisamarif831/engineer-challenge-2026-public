# A030: Define and enforce note privacy expectations

- **Status:** Needs decision
- **Severity:** Medium
- **Area:** Usability and UX
- **Classification:** Unresolved product/security requirement
- **Audit evidence:** Runtime-confirmed behavior; intended policy requires verification
- **Source finding:** [A030 — Private versus Shared notes have no defined audience](../usability_ux_audit_report.md#a030--private-versus-shared-notes-have-no-defined-audience)
- **Related tickets:** [A001](../security/A001-verify-authentication-tokens-on-every-protected-route.md), [A006](../security/A006-keep-bearer-tokens-out-of-exports-and-logs.md), [A010](../security/A010-validate-writes-and-enforce-data-relationships.md).

## Problem and evidence

Notes expose a Private checkbox and Private/Shared badges. The list endpoint returns all notes regardless of the flag or caller; CSV aggregates all notes. An agent could read/export the seeded private note authored by the manager. Neither README nor code defines the intended audience.

An agent may interpret Private as author-only even though other agents and exports receive it; the label does not establish a reliable confidentiality expectation.

## Affected code

[web/src/components/detail/NotesPanel.tsx:27–40](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/detail/NotesPanel.tsx#L27); [server/src/index.ts:255–285](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L255); [server/src/index.ts:158–159](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L158).

## Tasks

- [ ] Decide whether Private means author-only, team-only or hidden from customers, and document the intended role/audience matrix.
- [ ] Decide whether exports include restricted notes and make the wording explicit.
- [ ] Implement corresponding server-side access/export rules, or remove the distinction if both flags intentionally have identical access.

## Acceptance criteria

- [ ] Agreed access/export cases are tested for each role/audience and the visible explanation matches actual behavior.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Define whether privacy means author-only, team-only, or hidden from customers. Then enforce any actual restrictions server-side and make the UI/export wording explicit. If all notes are internal with identical access, remove the misleading distinction.

This is not labeled a proven authorization bypass: a shared internal inbox may legitimately expose all notes to agents. The repository provides no customer-facing notes view or formal role policy.

Resolve the audience/export policy before implementing restrictions. Existing cross-agent access is not, by itself, a proven authorization defect.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
