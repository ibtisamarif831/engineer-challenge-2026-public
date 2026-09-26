# A003: Prevent script execution in notes feedback and summaries

- **Status:** Done
- **Severity:** High
- **Area:** Security
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A003 — Stored notes and other HTML sinks execute untrusted script](../security_best_practices_report.md#a003--stored-notes-and-other-html-sinks-execute-untrusted-script)
- **Related tickets:** [A008](A008-remove-the-frontend-llm-secret-configuration.md), [A011](A011-define-production-origin-header-and-cache-policies.md).

## Problem and evidence

Add a synthetic note containing an image with an `onerror` handler that sets `window.__pulseAuditXss=1`. The marker executed immediately and again after reopening the ticket. A mocked HTML summary also executed a harmless marker. All three sinks use `dangerouslySetInnerHTML` without sanitization.

An attacker-controlled note can run code in another agent’s app session. Browser-stored tokens and customer data are accessible to same-origin script; no exfiltration was performed.

## Affected code

[web/src/components/detail/NotesPanel.tsx:34–40](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/detail/NotesPanel.tsx#L34); [web/src/components/ItemDetail.tsx:132–154](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L132); [server/src/index.ts:268–285](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L268).

**Security guidance:** REACT-XSS-001; REACT-AUTH-001.

## Tasks

- [x] Determine which content needs rich formatting; use plain text where it is unnecessary.
- [x] Remove unsafe HTML sinks or apply one maintained allowlist sanitization policy to every required HTML sink.
- [x] Verify stored/reloaded content and mocked summary output with inert script and URL payloads; coordinate CSP with A011.

## Acceptance criteria

- [x] Handler attributes, script-bearing URLs and active markup remain inert after save/reload in every sink; intended formatting still works.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Render notes, feedback and summaries as text unless rich HTML is required. If required, apply a maintained allowlist sanitizer consistently. Add a compatible CSP as defense in depth, and reconsider persistent token storage.

Notes are a real persisted input path. Summary execution used a mocked provider response; no real model was called. Feedback HTML is source-confirmed because this repo has no feedback-ingestion endpoint.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Content rendering and provider keys verification — 2026-09-26

Feedback, notes and summaries now render through React text interpolation. The shared `.feedback-text` style preserves line breaks/spacing and wraps long words. Unused rich-HTML styling was removed; no sanitizer dependency or rich-text policy was introduced. Existing stored/seed `<strong>` and `<em>` markup intentionally displays literally; stored content was not modified.

Disposable browser checks used feedback and stored notes containing harmless image error handlers and javascript URLs, plus a mocked server-provider summary with the same payload. A new markup note was saved using keyboard navigation, then the page was reloaded and the ticket reopened. All three content paths remained literal before and after reopening/regenerating the summary: no HTML child elements were created, no image/link elements were present in the content, and the DOM execution marker stayed unset. Four displayed text blocks retained newlines and computed pre-wrap styling.

Desktop (1280px), tablet (820px) and mobile (390px) checks found no overflow in any text block, including long unbroken text. Screenshots are local under `output/playwright/b03/`. Both workspace builds passed. All writes used in-memory fixtures; working database/WAL/SHM and seed hashes were unchanged. No real provider call or permanent test framework was added.

A011 deployment CSP and persistent-token-storage redesign remain outside this scope; completion addresses the unsafe HTML sinks, not those separate defenses.
