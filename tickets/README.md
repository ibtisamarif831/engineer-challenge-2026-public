# Audit remediation tickets

33 tickets map one-to-one to audit findings **[A001](security/A001-verify-authentication-tokens-on-every-protected-route.md)–[A033](design-accessibility/A033-expose-mobile-ticket-context-and-actions.md)**. IDs and severity are preserved; each ticket contains actionable checklists, acceptance criteria, evidence, code locations and a link to its original finding. The server structure/type refactor has addressed the directly overlapping items recorded below; remaining work is tracked by individual ticket scope and acceptance criteria.

The audit reports remain the historical evidence; ticket status/checklists track subsequent work. There are **2 critical, 5 high, 21 medium and 5 low** findings, including five production-readiness gaps and one unresolved product/security requirement. Advisory reachability and accessibility concerns retain their original caveats.

## Folder layout

- `security/`: 13 tickets ([A001](security/A001-verify-authentication-tokens-on-every-protected-route.md)–[A013](security/A013-return-consistent-safe-json-api-errors.md)).
- `functionality/`: 12 tickets ([A014](functionality/A014-correct-inbox-pagination-and-filtered-totals.md)–[A025](functionality/A025-align-resolve-responses-with-the-declared-api-contract.md)).
- `usability-ux/`: 6 tickets ([A026](usability-ux/A026-show-accurate-loading-and-save-feedback.md)–[A031](usability-ux/A031-distinguish-login-connectivity-errors-from-bad-credentials%28deferred%29.md)).
- `design-accessibility/`: 2 tickets ([A032](design-accessibility/A032-preserve-keyboard-focus-across-ticket-navigation.md)–[A033](design-accessibility/A033-expose-mobile-ticket-context-and-actions.md)).

## Scope and coordination

Work from individual tickets and their related findings. Preserve explicitly deferred requirements and keep privacy/deployment decisions separate. Implement only the agreed scope and update each affected ticket and this index together.

## Ticket index

### Security

| Ticket | Severity | Status | Classification |
| --- | --- | --- | --- |
| [A001 — Verify authentication tokens on every protected route](security/A001-verify-authentication-tokens-on-every-protected-route.md) | Critical | Done | Current defect |
| [A002 — Parameterize all request-derived SQL](security/A002-parameterize-all-request-derived-sql.md) | Critical | Done | Current defect |
| [A003 — Prevent script execution in notes feedback and summaries](security/A003-prevent-script-execution-in-notes-feedback-and-summaries.md) | High | Done | Current defect |
| [A004 — Remove credential disclosure](security/A004-remove-credential-disclosure.md) | High | Done | Current defect |
| [A005 — Load the JWT signing secret from server configuration](security/A005-load-the-jwt-signing-secret-from-server-configuration.md) | High | Done | Production-readiness gap |
| [A006 — Keep bearer tokens out of exports and logs](security/A006-keep-bearer-tokens-out-of-exports-and-logs.md) | Medium | Done | Current defect |
| [A007 — Neutralize formula-like text in CSV exports](security/A007-neutralize-formula-like-text-in-csv-exports.md) | Medium | Open | Current defect |
| [A008 — Remove the frontend LLM secret configuration](security/A008-remove-the-frontend-llm-secret-configuration.md) | Medium | Done | Production-readiness gap |
| [A009 — Triage and update vulnerable dependencies](security/A009-triage-and-update-vulnerable-dependencies.md) | Medium | Open | Current dependency risk |
| [A010 — Validate writes and enforce data relationships](security/A010-validate-writes-and-enforce-data-relationships.md) | Medium | Open | Current defect |
| [A011 — Define production origin header and cache policies](security/A011-define-production-origin-header-and-cache-policies.md) | Low | Open | Production-readiness gap |
| [A012 — Bound login and summarization abuse](security/A012-bound-login-and-summarization-abuse%20%28defferred%29.md) | Medium | Open | Production-readiness gap |
| [A013 — Return consistent safe JSON API errors](security/A013-return-consistent-safe-json-api-errors.md) | Low | Done | Production-readiness gap |

### Functionality

| Ticket | Severity | Status | Classification |
| --- | --- | --- | --- |
| [A014 — Correct inbox pagination and filtered totals](functionality/A014-correct-inbox-pagination-and-filtered-totals.md) | High | Done | Current defect |
| [A015 — Handle API failures without crashes or lost work](functionality/A015-handle-api-failures-without-crashes-or-lost-work.md) | High | Open | Current defect |
| [A016 — Poll the current inbox query and update counts](functionality/A016-poll-the-current-inbox-query-and-update-counts.md) | Medium | Open | Current defect |
| [A017 — Prevent stale responses from replacing current results](functionality/A017-prevent-stale-responses-from-replacing-current-results.md) | Medium | Open | Current defect |
| [A018 — Encode inbox and export query parameters](functionality/A018-encode-inbox-and-export-query-parameters.md) | Medium | Done | Current defect |
| [A019 — Make repeated note and status actions safe](functionality/A019-make-repeated-note-and-status-actions-safe.md) | Medium | Open | Current defect |
| [A020 — Refresh dependent views after ticket mutations](functionality/A020-refresh-dependent-views-after-ticket-mutations.md) | Medium | Open | Current defect |
| [A021 — Standardize due-date storage display and overdue rules](functionality/A021-standardize-due-date-storage-display-and-overdue-rules.md) | Medium | Done (migration deferred) | Current defect |
| [A022 — Apply consistent date scopes to metrics](functionality/A022-apply-consistent-date-scopes-to-metrics.md) | Medium | Done | Current defect |
| [A023 — Recover from malformed stored sessions](functionality/A023-recover-from-malformed-stored-sessions.md) | Medium | Open | Current defect |
| [A024 — Handle provider failures and summary timeouts](functionality/A024-handle-provider-failures-and-summary-timeouts.md) | Medium | Open | Current defect |
| [A025 — Align resolve responses with the declared API contract](functionality/A025-align-resolve-responses-with-the-declared-api-contract.md) | Low | Done | Current defect |

### Usability and UX

| Ticket | Severity | Status | Classification |
| --- | --- | --- | --- |
| [A026 — Show accurate loading and save feedback](usability-ux/A026-show-accurate-loading-and-save-feedback.md) | Medium | In progress | Current UX issue |
| [A027 — Preserve drafts or confirm their dismissal](usability-ux/A027-preserve-drafts-or-confirm-their-dismissal.md) | Medium | Done | Current UX issue |
| [A028 — Preserve ticket and inbox context in URLs](usability-ux/A028-preserve-ticket-and-inbox-context-in-urls.md) | Medium | Done | Current UX issue |
| [A029 — Make customer history entries readable and navigable](usability-ux/A029-make-customer-history-entries-readable-and-navigable.md) | Low | Done | Current UX issue |
| [A030 — Define and enforce note privacy expectations](usability-ux/A030-define-and-enforce-note-privacy-expectations.md) | Medium | Needs decision | Unresolved product/security requirement |
| [A031 — Distinguish login connectivity errors from bad credentials](usability-ux/A031-distinguish-login-connectivity-errors-from-bad-credentials%28deferred%29.md) | Low | Open | Current UX issue |

### Design and accessibility

| Ticket | Severity | Status | Classification |
| --- | --- | --- | --- |
| [A032 — Preserve keyboard focus across ticket navigation](design-accessibility/A032-preserve-keyboard-focus-across-ticket-navigation.md) | Medium | In progress | Accessibility usability concern |
| [A033 — Expose mobile ticket context and actions](design-accessibility/A033-expose-mobile-ticket-context-and-actions.md) | Medium | Open | Design/UX issue |

## Working and completion guidance

- Reproduce against the current code; the audit baseline is revision `12566cc` from 2026-09-26. Historical source line numbers may shift after fixes.
- Use a disposable synthetic database for security probes, destructive fixtures and seeding. Use fake/mocked summaries for verification; preserve the existing database and secrets.
- Follow repository conventions. For code changes, run the relevant workspace build (`npm run build` for web; `npm run build --workspace server` for API) and the targeted acceptance checks. If adding a permanent test runner, document its command in AGENTS.md.
- For visual changes, verify desktop/tablet/mobile layouts and keyboard operation, preserving shared controls, theme tokens and reduced-motion behavior. Native browser zoom and assistive-technology tests remain follow-up checks where relevant; do not infer a pass from the earlier automated scans.
- Statuses: Open, Needs decision, In progress, Blocked, Done. Record any blocking decision explicitly; A030 starts at Needs decision. Do not mark a ticket Done solely because code was changed.
- Complete the checklist, record verification results/evidence and any residual limitations, then update the ticket and index status together. When a remediation addresses multiple IDs, verify and close each explicitly.
- Keep the original reports unchanged as the audit snapshot. Do not upgrade an unverified advisory or policy ambiguity into a confirmed exploit without new evidence.

## Original reports

- [Security](security_best_practices_report.md)
- [Functionality](functional_audit_report.md)
- [Usability and UX](usability_ux_audit_report.md)
- [Design and accessibility](design_accessibility_audit_report.md)
- [Whole-app overview and coverage](app_audit_report.md)

## Server refactor verification — 2026-09-26

A002, A013 and A025 are Done following isolated API checks and both workspace builds. At the time of this refactor, A004 (disclosure), A010 (API enforcement) and A024 (input/provider response shapes) were partially addressed. A004 was subsequently completed under the test-data-only scope below; A010/A024 remain Open with their deferred criteria retained. A006 logging no longer includes tokens or request bodies, but query-token exports remain unchanged.

The refactor adds runtime validation, shared API contracts, route/controller/service/middleware separation. Assignment/note API helpers now reject non-success responses before the UI replaces an item or clears a draft; app-wide error/retry UX (A015) remains open. Authentication verification/configuration (A001/A005), pagination (A014), metrics scopes (A022), CSV policy and all unrelated findings remain pending.

At the user's request, the temporary test files and test command were removed after the initial checks. No permanent test suite is included; final verification uses the workspace builds.

## Authentication completed — 2026-09-26

A001/A005 are Done, and A004 is Done after disclosure verification and the user-requested removal of real-account requirements from the test-data-only backlog. Shared verification now checks HS256 signature, required expiry/identity and current database-user existence; signing uses validated server configuration with no fallback.

Both workspace builds passed. Temporary in-memory verification covered 243 HTTP requests, 12 invalid-config startup cases and fresh-process key rotation. Browser login, inbox, detail, fake summary and CSV download passed on separate disposable fixtures; the CSV contained 25 fixture rows. Working database and seed hashes were preserved, and no permanent test infrastructure was added. See A001/A004/A005 for details.

## API validation and errors completed — 2026-09-26

A002/A013 remain Done after fresh regression checks. A010 API validation, reference checks and browser acceptance are complete; the ticket remains Open for explicitly deferred database constraints/cleanup/migration. Assignment and note actions now display local errors on failure, preserve entered values and apply successful retries. Broader error UX (A015) remains open.

Both builds, 170 disposable HTTP checks in development/production, browser success/failure/retry/reopen flows and desktop/tablet/mobile/keyboard checks passed. Working database and seed were preserved; no permanent tests or new dependencies were added. See A002/A010/A013 for detailed evidence. Authentication fixes were pushed as `f3eabda`.

## Content rendering and provider keys completed — 2026-09-26

A003 and A008 are Done. Feedback, notes and summaries now display as plain text with preserved whitespace; stored HTML tags are intentionally literal. Frontend provider-key configuration and the unused request header are removed, with server-only key setup documented.

Both builds, a synthetic-key bundle scan and disposable browser checks passed: save/reload inert markup, mocked server-backed/fake summaries, no frontend key in summary headers, desktop/tablet/mobile wrapping and keyboard submission. Working database and seed were preserved. See A003/A008 for evidence and the unchanged CSP/token-storage/provider-failure boundaries.

## CSV exports implemented and verified within agreed checks — 2026-09-26

A006/A018 are Done: exports use authenticated fetch/Blob downloads with safe errors and cleanup, query tokens are rejected, and inbox/export parameters are encoded. A007's formula-prefix encoding and CSV-byte checks are complete, but the ticket remains Open because spreadsheet-application verification was excluded by the user.

Both builds, disposable authentication/logging/query checks, 24 CSV cases, actual parsed downloads, keyboard retry, Blob cleanup and desktop/tablet/mobile checks passed. Seed and working database were preserved. See A006/A007/A018 for evidence and limitations. No spreadsheet-import success is claimed.

## Frontend API and UI errors — 2026-09-26

Feature API modules now share a fetch client. Root/workspace render fallbacks, inline API errors, read retries, preserved drafts, confirmed-only status updates and distinct login error messages are implemented. Web build and targeted mocked browser checks passed; see A015/A031 for evidence and limits. Both tickets remain Open pending their complete acceptance checks.

## Navigation, drafts, history and focus — implementation and verification — 2026-09-26

- Implemented `/tickets/:id` routes and inbox `page/status/q` query state with native History API, real ticket/history anchors, popstate handling and route-specific titles. Search replaces the current entry; filters, pages and ticket transitions push entries. Invalid paths/IDs and missing records have recovery controls. Direct login keeps the requested URL.
- Per-user/per-ticket assignment and note drafts use sessionStorage for this tab and survive navigation and refresh. Draft notices and explicit discard are visible. Sign-out asks before clearing all drafts. Inaccessible storage uses memory plus an unload warning; no draft text goes in URLs. Save completion clears only the submitted draft object, preserving edits made in flight, and notifies a newly mounted detail view to refresh. Session generations prevent old saves from clearing another login's drafts.
- History links include ticket IDs, dates and ellipsized inert text previews. The existing eight-ticket limit is disclosed; no new view-all API was added. Full ticket messages remain literal React text.
- Ticket headings receive focus once per entry; inbox return restores the original ticket link, falling back to its heading. Origin metadata is stored in browser history entries. Background polling leaves existing rows mounted and ignores superseded loads.

### Verified

Web TypeScript/Vite build and `git diff --check` passed. Browser used isolated localhost:5180 with mocked API responses and a synthetic user; the working database/seed were not modified. Checked page-2 Open/search context, keyboard opening ticket 12, heading focus/title/URL, unsaved High priority and note, history link to ticket 13, browser Back, refresh, Back to inbox, and Forward. Draft and query context survived; inbox focus returned to ticket 12. Checked confirmed sign-out then direct-ticket login with cleared drafts; cancellation branch with fixture `confirm=false` retained login and draft. Assignment save retained the note draft; note save cleared it and showed the saved note. Checked missing ticket 999 and invalid `/tickets/nope` recovery. Inspected history links at 390/768/1280 widths. Local fixture/evidence lives under ignored `output/playwright/b09/`; no test runner or dependency added.

### Remaining gates

Actual screen-reader announcement testing is unverified (A032). Storage-denial/unload prompts and reordered in-flight mutation/navigation responses need broader integration checks. Mutation idempotency, full polling reconciliation and metrics checks remain tracked in A016/A017/A019/A020. At the time of these checks, API pagination/count defects remained tracked in A014. Static-host SPA fallback must be configured when deployment is selected.
