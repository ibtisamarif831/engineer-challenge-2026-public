# Pulse functionality and reliability audit

## Executive summary

Both workspace builds pass, but runtime behavior is unreliable under ordinary inputs, failed requests and concurrent actions. The most urgent defects are skipped tickets and unchecked error responses that blank the app or discard work. Lower-priority contract and date-range inconsistencies are recorded separately.

Audit date: **2026-09-26**. Revision: **12566cc3f2291269cede31274c15471d6b971212**. Initial tracked working tree: clean.

Scope: all 31 application source files, HTML/configuration examples, manifests, lockfile, API contracts and documented workflows. Tests used an isolated temporary copy, synthetic seeded records, separate local ports and fake/mocked LLM responses. No application source, public interfaces, dependencies or existing database were changed. [Whole-app overview](app_audit_report.md) contains coverage, environment and limitations.

Severity reflects impact under the stated conditions, not a claim that this development-only repository is publicly deployed. **Runtime-confirmed** means observed behavior; **source-confirmed** means a traced code/configuration path; **requires verification** identifies an unresolved policy, deployment or exploit prerequisite. IDs are stable across all reports.

## Current findings

### High severity

#### A014 — Pagination hides the newest ten tickets and reports unfiltered totals

**High · Runtime-confirmed · Current defect**

**Location / affected flow:** [server/src/index.ts:77–104](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L77); [web/src/components/Inbox.tsx:15–16](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L15); [web/src/components/Inbox.tsx:53](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L53).

**Evidence and reproduction:** The UI starts at page 1 but SQL uses `offset = page * PAGE_SIZE`. Fresh fixtures: page 1 returned IDs 11–20, page 0 returned 1–10, and page 8 was empty. Filtering 24 resolved records still reported total 80; a zero-match search also reported 80.

**Impact:** Agents cannot browse the newest ten tickets and encounter empty pages or misleading counts, including searches with fewer than eleven matches.

**Expected behavior / recommended fix:** Use one-based pagination consistently, offset `(page - 1) * PAGE_SIZE`, a count with the same predicates, and validated/clamped page behavior. Add a stable secondary sort key for timestamp ties.

**Verification:** For totals 0, 1, 10, 11 and 80, visit every valid page: each record appears once, no first-page records are skipped, and filtered counts match the dataset.

#### A015 — HTTP failures enter success paths, causing blank screens and lost drafts

**High · Runtime-confirmed · Current defect**

**Location / affected flow:** [web/src/api.ts:19–120](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L19); [web/src/components/Inbox.tsx:21–25](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L21); [web/src/components/Inbox.tsx:47–50](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L47); [web/src/components/ItemDetail.tsx:42–100](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L42).

**Evidence and reproduction:** Every API helper except login parses JSON without checking `res.ok`. Apostrophe search and a mocked 401 blanked #root with `undefined.map`. A missing detail item also blanked the app. A mocked failed assignment replaced the name/message with blanks and rendered Invalid Date. A failed note cleared the draft and added an empty “Shared” item; a failed resolve stayed optimistically resolved without an alert.

**Impact:** Routine server errors can crash the entire UI, misrepresent saved state or discard work. Network failures can leave stale rows under a new search with no error.

**Expected behavior / recommended fix:** Centralize HTTP/error-shape handling; map 401 to recoverable session flow, 404 to a missing-item screen, and other failures to scoped errors. Update state only after success or roll back optimistic changes; retain drafts. Add a final render-error boundary as a fallback.

**Verification:** Inject 401/404/429/500, HTML error bodies and network failures into each flow. No blank app, false success or lost draft; recovery/retry remains available.

**Limits / context:** A002 explains the apostrophe-triggered server failure; this is the independent browser handling defect. See browser-evidence.json, extra-evidence.json and missing-detail-evidence.json.

### Medium severity

#### A016 — Polling replaces filtered results with the initial query

**Medium · Runtime-confirmed · Current defect**

**Location / affected flow:** [web/src/components/Inbox.tsx:35–45](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L35).

**Evidence and reproduction:** The interval effect has `[]` dependencies and captures initial page/filter/search/items. With Resolved selected, advancing the browser clock 45 seconds issued status=all and displayed open rows while aria-pressed remained true for Resolved. The interval also omits updating total.

**Impact:** Agents see tickets that contradict their selected query and may act on the wrong queue.

**Expected behavior / recommended fix:** Refresh the current query through a shared request path, with cleanup and stale-response protection. Refresh matching counts and avoid merging against a captured items array.

**Verification:** Filter, search and paginate, then advance two polling intervals; requests/results/counts continue matching the current query, and unmount clears the timer.

#### A017 — Older search responses can overwrite newer results

**Medium · Runtime-confirmed · Current defect**

**Location / affected flow:** [web/src/components/Inbox.tsx:21–29](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L21).

**Evidence and reproduction:** Using controlled responses, query `slow` was held, query `fast` completed, then slow was released. The input remained fast but the displayed customer was slow. No cancellation or request-version check protects `setItems`.

**Impact:** Normal network timing makes the list inconsistent with the search field or selected filter.

**Expected behavior / recommended fix:** Abort superseded requests or ignore responses whose query/version is no longer current. Debounce text entry for request efficiency; debounce alone does not resolve races.

**Verification:** Delay and reorder search/filter/page responses in both directions; only the latest active query can update rows, totals and loading state.

#### A018 — Search and export values are concatenated into URLs without encoding

**Medium · Runtime-confirmed · Current defect**

**Location / affected flow:** [web/src/api.ts:25](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L25); [web/src/api.ts:60–61](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L60).

**Evidence and reproduction:** Entering `billing&status=resolved#fragment` emitted `...?status=all&q=billing&status=resolved`; the extra status became a second parameter and the fragment was not sent. Export uses the same unsafe concatenation; a # in search can also move the token into the fragment, breaking authentication.

**Impact:** Legitimate searches containing &, #, + or similar URL characters are changed, rejected or exported incorrectly.

**Expected behavior / recommended fix:** Build query strings with URL/URLSearchParams. Use header-authenticated downloads as recommended in A006.

**Verification:** Round-trip &, #, +, %, Unicode and spaces through inbox and export; the server receives exactly one unchanged query value and exports the matching set.

#### A019 — Repeated actions produce duplicate notes and reverse status changes

**Medium · Runtime-confirmed · Current defect**

**Location / affected flow:** [server/src/index.ts:268–299](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L268); [web/src/components/ItemDetail.tsx:69–100](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L69); [web/src/components/detail/NotesPanel.tsx:32](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/detail/NotesPanel.tsx#L32).

**Evidence and reproduction:** Two identical resolve requests toggled a ticket to open and then back to resolved. Double-clicking Add note with responses delayed sent two POSTs and created two DB rows, but the closure-based `setNotes([note, ...notes])` showed only one new note until reload. The button remained enabled while pending.

**Impact:** Retries and ordinary double-clicks duplicate work or undo the intended state; the immediate UI can hide the duplication.

**Expected behavior / recommended fix:** Use per-action pending guards and functional state updates. Send explicit desired status rather than a toggle, and define retry/idempotency behavior for note creation.

**Verification:** Double-click and replay requests under latency: one intended note appears and persists; repeated “resolve” keeps the item resolved; concurrent completions do not drop notes from the UI.

#### A020 — Mutations leave metrics, customer history and filtered rows stale

**Medium · Runtime-confirmed · Current defect**

**Location / affected flow:** [web/src/components/Inbox.tsx:31–33](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L31); [web/src/components/Inbox.tsx:47–50](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/Inbox.tsx#L47); [web/src/components/ItemDetail.tsx:54–56](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L54); [web/src/components/ItemDetail.tsx:69–93](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L69).

**Evidence and reproduction:** Resolving a ticket changed database counts from 57 open/23 resolved to 56/24 while the metrics stayed 57/23. A resolved row remained in the Open filter. Reopening detail changed its badge to Open while the customer history still said resolved.

**Impact:** Agents get contradictory queue and customer-state information after successful actions.

**Expected behavior / recommended fix:** Invalidate/refetch affected query, metrics and customer history after mutations, or update a coherent shared cache. Remove rows that no longer match a filter and reconcile counts/pages.

**Verification:** Resolve/reopen and change priority/due date from both screens; rows, counts, metrics and history agree without a full reload.

#### A021 — Due dates mix timestamps, date-only values and empty strings

**Medium · Runtime-confirmed · Current defect**

**Location / affected flow:** [web/src/components/ItemDetail.tsx:49](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L49); [web/src/components/ItemDetail.tsx:84–90](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L84); [web/src/components/inbox/FeedbackTable.tsx:59](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/inbox/FeedbackTable.tsx#L59); [server/src/index.ts:127–129](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L127); [server/src/index.ts:238–240](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L238).

**Evidence and reproduction:** Clearing a NULL due date stored an empty string and increased overdue from 26 to 27. Saving date-only 2026-10-01 displayed 9/30/2026 in America/Los_Angeles, while the date input still showed 2026-10-01. Existing ISO timestamps are truncated when loaded into the editor.

**Impact:** Tickets with no due date become overdue, and users in different timezones see conflicting calendar dates. Saving unrelated assignment changes can also discard time-of-day precision.

**Expected behavior / recommended fix:** Define due_at as a calendar date or a timestamp consistently across storage, API, display and overdue rules. Given the date-only control, prefer validated calendar dates, NULL for absence, and a documented business timezone/deadline convention; migrate old values deliberately.

**Verification:** Check null/clear, past/today/future dates, midnight and UTC−/UTC+ timezones. Calendar dates remain stable and undated tickets never count as overdue.

#### A022 — Metrics apply different date ranges to different counters

**Medium · Runtime-confirmed · Current defect**

**Location / affected flow:** [server/src/index.ts:116–137](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L116).

**Evidence and reproduction:** Requesting from 1970-01-01 to 1970-01-02 on fresh data returned open=0, resolved=0, urgent=20 and overdue=26. Status counters honor both bounds; urgent ignores to and overdue ignores both.

**Impact:** Consumers of the metrics API receive counters drawn from different populations.

**Expected behavior / recommended fix:** Apply the documented range consistently to all counters, or expose clearly named independent scopes if overdue is intentionally global. Validate bounds and reuse predicate construction.

**Verification:** An empty historical range has internally consistent counters; boundary and reversed-range cases behave as documented.

**Limits / context:** The current UI does not expose date-range controls. This is a callable API logic defect, not a claim about a missing UI filter.

#### A023 — Malformed stored session data crashes app startup

**Medium · Runtime-confirmed · Current defect**

**Location / affected flow:** [web/src/App.tsx:8–11](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/App.tsx#L8); [web/src/main.tsx:6–10](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/main.tsx#L6).

**Evidence and reproduction:** Set the isolated browser’s user storage value to `{bad` and reload. JSON.parse throws during initial render and #root stays empty. No storage validation or recovery exists.

**Impact:** A damaged or stale local session can lock the user out until they manually clear storage.

**Expected behavior / recommended fix:** Parse storage defensively, validate the user/token shape, and reset invalid session data to a usable sign-in screen. Handle inaccessible browser storage and render failures gracefully.

**Verification:** Malformed JSON, JSON null, wrong-shaped objects and unavailable storage never blank the application; valid saved sessions still restore.

#### A024 — Summarization failures are opaque and provider calls lack a deadline

**Medium · Runtime-confirmed with mocked provider failures · Current defect**

**Location / affected flow:** [server/src/llm.ts:7–21](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/llm.ts#L7); [server/src/index.ts:307–316](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L307); [web/src/components/ItemDetail.tsx:75–80](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/components/ItemDetail.tsx#L75).

**Evidence and reproduction:** Mocked 429 and malformed provider responses caused `Cannot read properties of undefined (reading 0)` because choices is accessed unconditionally. A mocked non-resolving fetch received no AbortSignal. The UI silently swallowed a 429 summary response and displayed no error. A nonexistent feedback ID returns 500 rather than 404.

**Impact:** Agents cannot distinguish waiting, quota/network failure and completion; provider failures become generic server failures and may hold requests open.

**Expected behavior / recommended fix:** Check resource existence and provider status/schema, configure a deadline with cancellation, and return stable actionable errors. Show pending, success and retryable failure states; avoid swallowing exceptions.

**Verification:** Fake success, mocked provider 401/429/500, malformed/empty choices, disconnect and timeout all settle to the right UI state without a real external call.

**Limits / context:** The 150 ms mock cutoff demonstrated a pending call and absence of an application signal, not the provider’s eventual network timeout. No live-model quality or prompt-injection resistance claim is made.

### Low severity

#### A025 — Resolve responses do not match their declared FeedbackItem contract

**Low · Runtime-confirmed · Current defect**

**Location / affected flow:** [server/src/index.ts:292–300](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L292); [web/src/api.ts:38–43](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L38); [web/src/types.ts:1–16](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/types.ts#L1).

**Evidence and reproduction:** The resolve route returns `{ ...row, status }`, while read/assignment routes use serializeFeedback. A successful resolve response lacked customer_name, customer_email and assignee_name even though toggleResolve promises FeedbackItem.

**Impact:** Current screens mask the mismatch by ignoring the response or using only status, but a caller that uses the promised object loses display fields.

**Expected behavior / recommended fix:** Return the same serialized item shape as other item endpoints, or deliberately define and use a narrower mutation response type across both boundaries.

**Verification:** Contract checks compare successful read, assignment and resolve results to their declared types; consumers need no unsafe assumptions.

## Related findings and passed checks

Input validation and referential-integrity failures are owned by **A010** in the security report. SQL failures from apostrophes are **A002**, with independent UI crash handling in **A015**. Private/shared note behavior is **A030**, pending an explicit policy.

Both `npm run build` and `npm run build --workspace server` passed. Valid login, local session restoration/logout, customer profile/history loading, assignment save and persistence, unassignment, priority changes, adding a single note, resolving/reopening a single ticket, fake summaries and a normal CSV browser download were exercised successfully. Filtered CSV requests returned 200; exact spreadsheet interpretation was not tested.

No API process crash was observed; recorded crashes are browser render failures. There is no configured project test runner. Temporary diagnostic scripts were used without adding a test framework or changing the app.
