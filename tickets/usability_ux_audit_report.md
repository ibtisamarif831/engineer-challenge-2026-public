# Pulse usability and UX audit

## Executive summary

The core happy paths are understandable, but users receive little feedback during work and can lose drafts or context. This report separates observed UX problems from missing product policy. Crashes, stale data and failed-save consequences are owned by the functional report rather than counted twice.

Audit date: **2026-09-26**. Revision: **12566cc3f2291269cede31274c15471d6b971212**. Initial tracked working tree: clean.

Scope: all 31 application source files, HTML/configuration examples, manifests, lockfile, API contracts and documented workflows. Tests used an isolated temporary copy, synthetic seeded records, separate local ports and fake/mocked LLM responses. No application source, public interfaces, dependencies or existing database were changed. [Whole-app overview](app_audit_report.md) contains coverage, environment and limitations.

Severity reflects impact under the stated conditions, not a claim that this development-only repository is publicly deployed. **Runtime-confirmed** means observed behavior; **source-confirmed** means a traced code/configuration path; **requires verification** identifies an unresolved policy, deployment or exploit prerequisite. IDs are stable across all reports.

## Current findings

### Medium severity

#### A026 — Loading and successful saves have no clear feedback

**Medium · Runtime-confirmed · Current UX issue**

**Location / affected flow:** [web/src/components/Inbox.tsx:13–29](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L13); [web/src/components/inbox/FeedbackTable.tsx:77–80](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/inbox/FeedbackTable.tsx#L77); [web/src/components/ItemDetail.tsx:75–109](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L75); [web/src/components/Login.tsx:14–23](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Login.tsx#L14).

**Evidence and reproduction:** With the initial inbox request held pending, the UI announced “No feedback to display / Try another search or status filter” and had no busy indicator. Detail initially renders only Back. Successful assignment save had no status/alert confirmation. Mutating controls provide no pending feedback (A019).

**Impact:** Users cannot tell whether data is empty, still loading or saved, encouraging repeated clicks and unnecessary edits.

**Expected behavior / recommended fix:** Introduce distinct initial-loading, refreshing, loaded-empty and error states; show per-action pending state and concise successful-save feedback with appropriate accessible semantics.

**Verification:** On slow and successful requests, users can identify the state without guessing; no false empty message appears before completion and save completion is visible.

**Limits / context:** This is a usability finding. WCAG 4.1.3 does not require authors to invent new status messages; when messages are added, make them programmatically available. Existing login errors use role=alert and empty results use role=status.

#### A027 — Leaving detail silently discards unsaved work

**Medium · Runtime-confirmed · Current UX issue**

**Location / affected flow:** [web/src/components/ItemDetail.tsx:33–37](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L33); [web/src/components/ItemDetail.tsx:115–117](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L115); [web/src/components/Inbox.tsx:55–63](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L55).

**Evidence and reproduction:** Enter an unsent note and change priority without saving, choose Back to inbox, then reopen the same ticket. The note is empty and priority reverts, without warning or a retained draft.

**Impact:** Agents lose typed notes and assignment edits during ordinary navigation.

**Expected behavior / recommended fix:** Track dirty edits and preserve drafts per ticket, or present a clear discard/continue-editing choice. Make successfully saved and unsaved state distinguishable.

**Verification:** Back, sign-out, refresh and ticket navigation have deliberate dirty-state behavior; saved changes remain persisted and abandoned drafts are never silently confused with saved content.

#### A028 — Ticket navigation is not represented in the URL

**Medium · Runtime-confirmed · Current UX issue**

**Location / affected flow:** [web/src/components/Inbox.tsx:19](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L19); [web/src/components/Inbox.tsx:55–65](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L55).

**Evidence and reproduction:** Opening detail leaves the URL at `/` and the title Pulse. Refresh restores the session but returns to Inbox. selectedId, query, filter and page exist only in component state.

**Impact:** Agents cannot bookmark/share a ticket location or recover their exact working context after refresh; browser history has no app detail entry.

**Expected behavior / recommended fix:** Represent ticket selection and relevant inbox context in URL state, handle invalid/missing IDs, and preserve query context through back/forward navigation.

**Verification:** Direct ticket URLs, refresh, browser Back/Forward and returning to a filtered page restore the intended context and a meaningful document title.

**Limits / context:** Observed refresh/URL behavior is confirmed. No external collaboration/share feature or multi-tenant requirement is assumed.

#### A030 — Private versus Shared notes have no defined audience

**Medium · Runtime-confirmed behavior; intended policy requires verification · Unresolved product/security requirement**

**Location / affected flow:** [web/src/components/detail/NotesPanel.tsx:27–40](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/detail/NotesPanel.tsx#L27); [server/src/index.ts:255–285](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L255); [server/src/index.ts:158–159](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L158).

**Evidence and reproduction:** Notes expose a Private checkbox and Private/Shared badges. The list endpoint returns all notes regardless of the flag or caller; CSV aggregates all notes. An agent could read/export the seeded private note authored by the manager. Neither README nor code defines the intended audience.

**Impact:** An agent may interpret Private as author-only even though other agents and exports receive it; the label does not establish a reliable confidentiality expectation.

**Expected behavior / recommended fix:** Define whether privacy means author-only, team-only, or hidden from customers. Then enforce any actual restrictions server-side and make the UI/export wording explicit. If all notes are internal with identical access, remove the misleading distinction.

**Verification:** Agreed access/export cases are tested for each role/audience and the visible explanation matches actual behavior.

**Limits / context:** This is not labeled a proven authorization bypass: a shared internal inbox may legitimately expose all notes to agents. The repository provides no customer-facing notes view or formal role policy.

### Low severity

#### A029 — Customer history truncates messages without a way to read the ticket

**Low · Runtime-confirmed · Current UX issue**

**Location / affected flow:** [web/src/components/detail/CustomerPanel.tsx:16–23](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/detail/CustomerPanel.tsx#L16); [server/src/index.ts:213–219](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L213).

**Evidence and reproduction:** History slices messages to 48 characters inside non-interactive spans, without an ellipsis, date or ticket link. Desktop/tablet/mobile screenshots show words cut mid-word and no way to open the entry.

**Impact:** The customer context panel presents incomplete evidence and forces the agent to rediscover a ticket elsewhere.

**Expected behavior / recommended fix:** Provide a keyboard-accessible ticket link and date/identifier, indicate truncation, and show a safe text preview. Add a “view all” path only if the eight-record cap needs to be discoverable.

**Verification:** Every displayed history entry can be identified and opened with keyboard/mouse; truncation is clear and HTML is not shown as raw preview text.

#### A031 — Login reports network failures as bad credentials

**Low · Runtime-confirmed · Current UX issue**

**Location / affected flow:** [web/src/components/Login.tsx:14–22](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Login.tsx#L14); [web/src/api.ts:8–16](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L8).

**Evidence and reproduction:** Abort the login request to simulate no connectivity while entering valid test credentials. The alert says Invalid email or password, exactly as for an actual 401.

**Impact:** Users may keep changing valid credentials instead of recognizing a connectivity or server problem.

**Expected behavior / recommended fix:** Distinguish invalid credentials from network/server failures while keeping authentication errors non-enumerating. Offer a retry and retain the email field.

**Verification:** 401 remains a generic credential error; offline and 5xx produce accurate retryable messages announced by the existing alert region.

## Cross-category consequences

Do not count these again as separate UX defects: incorrect totals/skipped results (**A014**), crashes and silent failed saves (**A015**), polling/race inconsistencies (**A016–A017**), duplicate actions (**A019**), stale metrics/history (**A020**), and invisible summary errors (**A024**). Their fixes should be reviewed in the UI, not only at the API level.

The existing clear labels, standard controls, inline credential-error alert, explicit empty-results text, status words alongside colors and single-ticket keyboard activation are useful foundations to retain. No user interviews or timed usability study were conducted; priority is based on observed task impact rather than measured user sentiment.
