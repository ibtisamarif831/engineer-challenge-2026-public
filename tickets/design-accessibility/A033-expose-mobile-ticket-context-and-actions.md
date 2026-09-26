# A033: Expose mobile ticket context and actions

- **Status:** Open
- **Severity:** Medium
- **Area:** Design and accessibility
- **Classification:** Design/UX issue
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A033 — The mobile inbox hides the information needed to triage](../design_accessibility_audit_report.md#a033--the-mobile-inbox-hides-the-information-needed-to-triage)
- **Related tickets:** [A014](../functionality/A014-correct-inbox-pagination-and-filtered-totals.md), [A032](A032-preserve-keyboard-focus-across-ticket-navigation.md).

## Problem and evidence

At 390px the scroll region is 356px wide and the table remains 1080px. The screenshot initially shows customer/channel/priority while message, owner, status, due date and action sit off-screen. The scroll instruction exists only in the accessible region name.

Sighted mobile users have no explicit visible scroll cue and must pan repeatedly to understand or resolve a ticket.

## Affected code

[web/src/styles.css:87](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/styles.css#L87); [web/src/styles.css:422–429](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/styles.css#L422); [web/src/components/inbox/FeedbackTable.tsx:14–26](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/inbox/FeedbackTable.tsx#L14).

## Tasks

- [ ] Choose a visible horizontal-scroll cue with preserved row identity or a compact mobile ticket presentation.
- [ ] Keep message, owner/status, due date and actions discoverable and associated with the right customer.
- [ ] Retain table/region or equivalent accessible semantics and validate keyboard use at 320, 390 and 768 pixels.

## Acceptance criteria

- [ ] At 320/390/768px, a user can discover and associate message/status/due/action with its customer without losing context; keyboard access and semantics remain intact.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Keep the accessible scroll region but add a visible cue and preserve row identity while panning, or present a mobile ticket layout showing the essential triage fields and actions together.

No page-level horizontal overflow was found. Data tables can legitimately require two-dimensional layout, so this is not automatically a [WCAG 1.4.10 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) failure.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
