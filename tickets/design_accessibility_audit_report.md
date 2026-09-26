# Pulse design and accessibility audit

## Executive summary

The corporate theme is consistent, readable and responsive in the tested layouts. Five axe-core WCAG scans produced no automatic violations. Manual inspection found focus-continuity and mobile-triage concerns; neither is presented as a certified WCAG failure. The accessibility assessment is bounded by the browser and assistive-technology limits below.

Audit date: **2026-09-26**. Revision: **12566cc3f2291269cede31274c15471d6b971212**. Initial tracked working tree: clean.

Scope: all 31 application source files, HTML/configuration examples, manifests, lockfile, API contracts and documented workflows. Tests used an isolated temporary copy, synthetic seeded records, separate local ports and fake/mocked LLM responses. No application source, public interfaces, dependencies or existing database were changed. [Whole-app overview](app_audit_report.md) contains coverage, environment and limitations.

Severity reflects impact under the stated conditions, not a claim that this development-only repository is publicly deployed. **Runtime-confirmed** means observed behavior; **source-confirmed** means a traced code/configuration path; **requires verification** identifies an unresolved policy, deployment or exploit prerequisite. IDs are stable across all reports.

## Current findings

### Medium severity

#### A032 — Detail transitions lose focus and do not restore the opening ticket

**Medium · Runtime-confirmed · Accessibility usability concern**

**Location / affected flow:** [web/src/components/Inbox.tsx:55–65](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L55); [web/src/components/ItemDetail.tsx:113–123](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L113).

**Evidence and reproduction:** Keyboard Enter on the ticket button replaces the inbox with detail and leaves document.activeElement as BODY. Returning with Back also leaves BODY rather than the original ticket. There is no focus handoff or screen-title update. Actual Tab navigation has visible solid 2px focus outlines.

**Impact:** Keyboard and assistive-technology users lose their location and must rediscover where work resumed, especially after opening a ticket deep in a page.

**Expected behavior / recommended fix:** Focus an appropriate detail heading/container after navigation and restore the originating ticket on return, with a fallback if it is no longer visible. Update the page title without forcing focus on background refresh.

**Verification:** Open a later ticket with keyboard, return and continue from the same location; verify the experience with a screen reader and no focus trap.

**Limits / context:** This is a demonstrated focus-continuity issue, not a certified WCAG failure. The first Tab after opening reached Back to inbox. Assess meaningful sequence under [WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

#### A033 — The mobile inbox hides the information needed to triage

**Medium · Runtime-confirmed · Design/UX issue**

**Location / affected flow:** [web/src/styles.css:87](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/styles.css#L87); [web/src/styles.css:422–429](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/styles.css#L422); [web/src/components/inbox/FeedbackTable.tsx:14–26](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/inbox/FeedbackTable.tsx#L14).

**Evidence and reproduction:** At 390px the scroll region is 356px wide and the table remains 1080px. The screenshot initially shows customer/channel/priority while message, owner, status, due date and action sit off-screen. The scroll instruction exists only in the accessible region name.

**Impact:** Sighted mobile users have no explicit visible scroll cue and must pan repeatedly to understand or resolve a ticket.

**Expected behavior / recommended fix:** Keep the accessible scroll region but add a visible cue and preserve row identity while panning, or present a mobile ticket layout showing the essential triage fields and actions together.

**Verification:** At 320/390/768px, a user can discover and associate message/status/due/action with its customer without losing context; keyboard access and semantics remain intact.

**Limits / context:** No page-level horizontal overflow was found. Data tables can legitimately require two-dimensional layout, so this is not automatically a [WCAG 1.4.10 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) failure.

## Accessibility verification

Benchmark: WCAG 2.2 AA. Chrome 154.0.8037.58, axe-core 4.13.0; scans selected WCAG 2 A/AA, 2.1 AA and 2.2 AA tags.

| Screen | Automated result | Manual context |
| --- | --- | --- |
| Login | 0 violations, 13 passing rules | Email/password labels, native required/email semantics, password autocomplete, error alert |
| Inbox at 1440px | 0 violations, 23 passing rules | Caption, scoped table headings, labeled scroll region, pressed filter state, keyboard ticket buttons |
| Inbox at 320px | 0 violations, 24 passing rules; 40 contrast nodes need review | Off-screen table content limits automated contrast inspection; same desktop tokens were checked separately |
| Detail at 1440px | 0 violations, 22 passing rules | Labeled assignment controls, note textarea and checkbox, heading hierarchy |
| Detail at 320px | 0 violations, 22 passing rules | Single-column layout, wrapped metadata, no document-wide horizontal overflow |

Actual Tab navigation showed solid 2px outlines on filters, search, export, the scroll region and ticket buttons. Enter opened the ticket; no focus trap was observed. A mouse/programmatic-focus-only probe did not activate `:focus-visible`; that was a test-mode distinction, not a missing keyboard outline. The checkbox’s small graphic sits inside a much larger clickable label row, so its 16px graphic is not treated as a target-size failure. [WCAG target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Calculated text contrast from the actual CSS palette: body on white **12.67:1**, muted on white **6.23:1**, muted on canvas **5.75:1**, action blue on white **5.86:1**, and tested status/priority text pairs **5.50–7.25:1**. Control border against its white interior is **3.05:1**. Disabled-control contrast is not treated as an active-control failure. These sampled calculations complement, rather than replace, the scan.

Status announcements need careful interpretation: the existing empty state has `role=status` and credential error has `role=alert`. Missing loading/save feedback is A026. WCAG 4.1.3 does not require creating new messages or announcing all new content; when explicit progress/result messages are introduced, provide appropriate semantics. [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## Responsive and visual checks

- Inspected inbox/detail at **1440, 768, 390 and 320 CSS pixels**. Document width equaled viewport width in every measured state. Table overflow remains contained in its region.
- Detail uses two columns on desktop, one main column plus two side panels at tablet width, and stacked panels/controls on mobile. Metrics use two columns on mobile; main buttons measured 40px on desktop and 44px on mobile.
- Reduced-motion emulation produced `0s, 0s` transitions. The palette, typography, borders, spacing and badge styles remain consistent across reviewed screenshots.
- A CSS 200% zoom approximation had no page-wide overflow. Native browser zoom shortcuts did not change the headless viewport/DPR, so **real browser zoom was not verified**. The 320px reflow check is recorded independently.
- The mobile history panel places Internal notes far down the page; consider promoting the note composer if note-taking is the primary task. This is an optional design improvement, not an additional counted defect.

## Screenshots and limitations

Evidence under `output/playwright/` includes `inbox-{1440,768,390,320}.png`, `detail-{1440,768,390,320}.png`, `keyboard-focus.png`, `pending-inbox.png`, `search-crash.png` and `inbox-css-zoom-200.png`. These files are local ignored artifacts; textual evidence is retained in this report for portability.

No VoiceOver/NVDA session, Safari/Firefox run, physical touchscreen test, high-contrast/forced-colors test or formal WCAG conformance certification was performed. Full assistive-technology announcement behavior remains unverified. No proven standards failure should be inferred from the two usability concerns alone.
