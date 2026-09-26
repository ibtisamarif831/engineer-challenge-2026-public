# Pulse whole-app audit

## Executive summary

The audit identified **33 prioritized findings** across security, functionality, UX, and design/accessibility: **2 critical, 5 high, 21 medium and 5 low**. This total includes five production-readiness gaps and one unresolved privacy-policy requirement; it is not a count of 33 demonstrated exploits.

The highest-impact confirmed issues are authentication bypass and SQL injection capable of changing every feedback record. Stored note script execution and password disclosure were also reproduced. Normal user flows can skip the newest tickets, crash on an apostrophe search, lose a note draft after a failed save, duplicate notes on double-click, and display stale or contradictory data.

Both workspace builds passed. Five automated accessibility scans found zero violations in the tested states; manual review found focus-continuity and mobile-triage concerns. This is not a WCAG conformance certification.

## Reports

| Area | Detailed report | Findings |
| --- | --- | --- |
| Security | [Security best practices](security_best_practices_report.md) | 13 |
| Functionality | [Functional audit](functional_audit_report.md) | 12 |
| Usability / UX | [Usability and UX audit](usability_ux_audit_report.md) | 6 |
| Design / accessibility | [Design and accessibility audit](design_accessibility_audit_report.md) | 2, plus passed checks and limitations |

Each finding includes severity, evidence status, affected flow and source lines, reproduction/source evidence, impact, expected behavior, recommended fix, verification criteria and applicable caveats. One root cause owns each finding; cross-category consequences reference that ID instead of increasing the count.

## Audit baseline and method

- Date: **2026-09-26**. Git revision: **12566cc3f2291269cede31274c15471d6b971212**. Initial tracked working tree: **clean**.
- Read all **31 application source files**, both TypeScript configurations, Vite configuration, HTML entrypoint, root/workspace manifests, lockfile, environment examples, README, contributor guide and Git ignore rules.
- Runtime: macOS; Node **25.9.0**, npm **11.12.1**, React **18.3.1**, Express **4.22.2**, SQLite via better-sqlite3 **11.10.0**, Vite **6.4.3**. The README requires Node 20+; Node 20-specific behavior was not tested.
- Browser: isolated Chrome **154.0.8037.58**, Playwright **1.64.0-alpha-1789764292000**, axe-core **4.13.0**. The CLI wrapper registry lookup failed with sandbox DNS, and the cached package did not expose the expected playwright-cli executable, so the installed Playwright library was used in temporary diagnostic scripts; no Playwright test suite was added.
- Copied application files to a temporary workspace and seeded only that copy. Used API **4107** and frontend **5187**, separate from the normal app. Each browser scenario used an isolated context; fixture data was reset between broad test phases, so later mutation-test counts can differ from initial screenshots.
- Used fake summaries and in-process/browser mocks for upstream errors, network failures, out-of-order responses and HTML summary output. No customer content went to a real model and no paid call was made.
- Confirmed the original database SHA-256 remained unchanged and all 31 source files matched the initial copy. Only audit documentation and ignored local evidence were added; no application fix, dependency update, commit or push was made.

Severity: Critical = demonstrated broad compromise; High = serious exposure or core workflow failure; Medium = material integrity/reliability/usability concern or conditional readiness risk; Low = limited-impact defect or hardening/usability improvement. Severity alone does not establish live production exposure.

## Prioritized finding index

| ID | Severity | Area | Finding | Evidence / context |
| --- | --- | --- | --- | --- |
| [A001](security_best_practices_report.md#a001--authentication-accepts-forged-and-expired-tokens) | Critical | security | Authentication accepts forged and expired tokens | Runtime-confirmed; Current defect |
| [A002](security_best_practices_report.md#a002--request-data-can-alter-sql-predicates-and-update-all-feedback) | Critical | security | Request data can alter SQL predicates and update all feedback | Runtime-confirmed; Current defect |
| [A003](security_best_practices_report.md#a003--stored-notes-and-other-html-sinks-execute-untrusted-script) | High | security | Stored notes and other HTML sinks execute untrusted script | Runtime-confirmed; Current defect |
| [A004](security_best_practices_report.md#a004--the-users-endpoint-exposes-every-plaintext-password) | High | security | The users endpoint exposes every plaintext password | Runtime-confirmed; Current defect |
| [A005](security_best_practices_report.md#a005--jwt-configuration-is-ignored-in-favor-of-a-public-constant) | High | security | JWT configuration is ignored in favor of a public constant | Source-confirmed; Production-readiness gap |
| [A014](functional_audit_report.md#a014--pagination-hides-the-newest-ten-tickets-and-reports-unfiltered-totals) | High | functional | Pagination hides the newest ten tickets and reports unfiltered totals | Runtime-confirmed; Current defect |
| [A015](functional_audit_report.md#a015--http-failures-enter-success-paths-causing-blank-screens-and-lost-drafts) | High | functional | HTTP failures enter success paths, causing blank screens and lost drafts | Runtime-confirmed; Current defect |
| [A006](security_best_practices_report.md#a006--bearer-credentials-enter-export-urls-and-error-logs) | Medium | security | Bearer credentials enter export URLs and error logs | Runtime-confirmed; Current defect |
| [A007](security_best_practices_report.md#a007--csv-quoting-leaves-spreadsheet-formulas-active) | Medium | security | CSV quoting leaves spreadsheet formulas active | Runtime-confirmed; Current defect |
| [A008](security_best_practices_report.md#a008--the-frontend-offers-a-public-build-time-slot-for-an-llm-secret) | Medium | security | The frontend offers a public build-time slot for an LLM secret | Source-confirmed; Production-readiness gap |
| [A009](security_best_practices_report.md#a009--the-installed-dependency-tree-has-outstanding-advisories) | Medium | security | The installed dependency tree has outstanding advisories | Source-confirmed; exploit reachability requires verification; Current dependency risk |
| [A010](security_best_practices_report.md#a010--write-endpoints-persist-invalid-and-orphaned-data) | Medium | security | Write endpoints persist invalid and orphaned data | Runtime-confirmed; Current defect |
| [A012](security_best_practices_report.md#a012--login-and-live-summarization-lack-application-abuse-controls) | Medium | security | Login and live summarization lack application abuse controls | Source-confirmed; Production-readiness gap |
| [A016](functional_audit_report.md#a016--polling-replaces-filtered-results-with-the-initial-query) | Medium | functional | Polling replaces filtered results with the initial query | Runtime-confirmed; Current defect |
| [A017](functional_audit_report.md#a017--older-search-responses-can-overwrite-newer-results) | Medium | functional | Older search responses can overwrite newer results | Runtime-confirmed; Current defect |
| [A018](functional_audit_report.md#a018--search-and-export-values-are-concatenated-into-urls-without-encoding) | Medium | functional | Search and export values are concatenated into URLs without encoding | Runtime-confirmed; Current defect |
| [A019](functional_audit_report.md#a019--repeated-actions-produce-duplicate-notes-and-reverse-status-changes) | Medium | functional | Repeated actions produce duplicate notes and reverse status changes | Runtime-confirmed; Current defect |
| [A020](functional_audit_report.md#a020--mutations-leave-metrics-customer-history-and-filtered-rows-stale) | Medium | functional | Mutations leave metrics, customer history and filtered rows stale | Runtime-confirmed; Current defect |
| [A021](functional_audit_report.md#a021--due-dates-mix-timestamps-date-only-values-and-empty-strings) | Medium | functional | Due dates mix timestamps, date-only values and empty strings | Runtime-confirmed; Current defect |
| [A022](functional_audit_report.md#a022--metrics-apply-different-date-ranges-to-different-counters) | Medium | functional | Metrics apply different date ranges to different counters | Runtime-confirmed; Current defect |
| [A023](functional_audit_report.md#a023--malformed-stored-session-data-crashes-app-startup) | Medium | functional | Malformed stored session data crashes app startup | Runtime-confirmed; Current defect |
| [A024](functional_audit_report.md#a024--summarization-failures-are-opaque-and-provider-calls-lack-a-deadline) | Medium | functional | Summarization failures are opaque and provider calls lack a deadline | Runtime-confirmed with mocked provider failures; Current defect |
| [A026](usability_ux_audit_report.md#a026--loading-and-successful-saves-have-no-clear-feedback) | Medium | ux | Loading and successful saves have no clear feedback | Runtime-confirmed; Current UX issue |
| [A027](usability_ux_audit_report.md#a027--leaving-detail-silently-discards-unsaved-work) | Medium | ux | Leaving detail silently discards unsaved work | Runtime-confirmed; Current UX issue |
| [A028](usability_ux_audit_report.md#a028--ticket-navigation-is-not-represented-in-the-url) | Medium | ux | Ticket navigation is not represented in the URL | Runtime-confirmed; Current UX issue |
| [A030](usability_ux_audit_report.md#a030--private-versus-shared-notes-have-no-defined-audience) | Medium | ux | Private versus Shared notes have no defined audience | Runtime-confirmed behavior; intended policy requires verification; Unresolved product/security requirement |
| [A032](design_accessibility_audit_report.md#a032--detail-transitions-lose-focus-and-do-not-restore-the-opening-ticket) | Medium | design | Detail transitions lose focus and do not restore the opening ticket | Runtime-confirmed; Accessibility usability concern |
| [A033](design_accessibility_audit_report.md#a033--the-mobile-inbox-hides-the-information-needed-to-triage) | Medium | design | The mobile inbox hides the information needed to triage | Runtime-confirmed; Design/UX issue |
| [A011](security_best_practices_report.md#a011--production-browser-and-response-protections-are-unspecified) | Low | security | Production browser and response protections are unspecified | Runtime-confirmed locally; deployment requires verification; Production-readiness gap |
| [A013](security_best_practices_report.md#a013--unhandled-route-errors-return-development-html-stack-traces) | Low | security | Unhandled route errors return development HTML stack traces | Runtime-confirmed locally; production requires verification; Production-readiness gap |
| [A025](functional_audit_report.md#a025--resolve-responses-do-not-match-their-declared-feedbackitem-contract) | Low | functional | Resolve responses do not match their declared FeedbackItem contract | Runtime-confirmed; Current defect |
| [A029](usability_ux_audit_report.md#a029--customer-history-truncates-messages-without-a-way-to-read-the-ticket) | Low | ux | Customer history truncates messages without a way to read the ticket | Runtime-confirmed; Current UX issue |
| [A031](usability_ux_audit_report.md#a031--login-reports-network-failures-as-bad-credentials) | Low | ux | Login reports network failures as bad credentials | Runtime-confirmed; Current UX issue |

## Coverage matrix

| Workflow / scenario | Outcome |
| --- | --- |
| Web and API builds | Both passed: `npm run build`; `npm run build --workspace server` |
| Dependency review | Live full and runtime-only npm audits completed; 9 full-tree entries / 3 runtime entries; A009 |
| Valid/invalid login | Normal credentials and incorrect-password handling passed; network failure message is misleading (A031) |
| Login/logout and restoration | Restore and storage-clearing logout passed; malformed stored user crashes startup (A023); server-side revocation policy unverified |
| Protected API guards | Missing tokens rejected on all 11 protected route/method probes; forged/expired identity accepted (A001) |
| Search/filtering/empty results | Controls and normal requests operate; SQL quotes, encoding, counts and failure states break behavior (A002, A014–A018, A026) |
| Pagination | First ten records skipped; final advertised page empty; unfiltered totals (A014) |
| Polling | Clock-driven 45-second refresh reproduces stale initial query (A016) |
| Slow/out-of-order responses | Controlled older response overwrote newer results (A017); initial pending list shows false empty state (A026) |
| Metrics | Successful baseline load; stale after mutation and inconsistent date ranges (A020, A022) |
| Detail and customer history | Happy path loads correctly; missing detail response blanks UI (A015); navigation/context and history usability issues (A028–A029) |
| Assignment/owner/priority | Save, reopen persistence and unassign passed; failed save corrupts UI (A015); invalid direct inputs accepted (A010) |
| Due dates | Clear-to-empty increases overdue; calendar day shifts in America/Los_Angeles (A021) |
| Add/read notes | Single save/display passed; failed save loses draft, double-click duplicates, raw HTML executes (A003, A015, A019) |
| Private/shared notes and roles | Cross-agent reads/export observed; intended distinction undocumented (A030), not an assumed authorization violation |
| Resolve/reopen | Single actions work; replay toggles back, failure remains optimistic, filtered views/metrics/history stale (A015, A019–A020) |
| Summaries | Fake success passed; mocked HTTP/schema/network/hanging failures and HTML tested (A003, A024); live model quality untested |
| CSV | Real browser download passed; normal filter/search requests return CSV; URL credentials and formula-ready cells observed (A006–A007, A018) |
| IDs/types/malformed inputs | Item/customer 404s work; orphan notes, invalid owner/priority/date and query type failures reproduced (A010, A013, A024) |
| HTTP failures | 401/404/429/500 and network failure paths exercised; render crashes, lost drafts and missing recovery (A015, A024, A031) |
| Repeated actions | Duplicate notes and non-idempotent resolve reproduced (A019); no broad concurrency/load benchmark |
| Draft/navigation continuity | Back silently discards draft/edits; refresh drops detail context (A027–A028) |
| Desktop/tablet/mobile/reflow | Inbox/detail at 1440/768/390/320px; no document-wide horizontal overflow; mobile table triage concern (A033) |
| Keyboard / focus | Labels, keyboard activation and visible focus pass sampled checks; transition focus continuity concern (A032) |
| Semantics / contrast / targets | Five axe scans: zero violations; sampled contrast calculations and target measurements passed; mobile off-screen contrast nodes flagged for manual review |
| Reduced motion | Emulation produced zero-duration transitions |
| Browser zoom | CSS 200% approximation and 320px viewport checked; native shortcut had no effect in headless Chrome, so native zoom remains unverified |
| Browser console/network | Inspected during scenarios; expected synthetic 4xx/5xx/network errors and actual React render failures recorded; no API-process crash observed |

## Recommended remediation order

1. **Close broad compromise paths:** A001 + A005 together, A002, then A003 and A004. Keep any real data out until verification passes.
2. **Make failures safe and preserve work:** A015, A010, A023, A019, then A024. Establish consistent API errors and client request state before polishing feedback.
3. **Correct queue/data behavior:** A014, A016–A018, A020–A022 and A025. Test against deterministic fixtures and controlled network timing.
4. **Repair workflow continuity and design:** A026–A029, A031–A033. Resolve the A030 privacy requirement before changing access rules.
5. **Prepare an actual deployment:** A006–A009, A011–A013 and remaining session/hosting controls; validate the real environment instead of assuming local headers describe production.

## Evidence and reproducibility

Local evidence is in `output/playwright/`, which is already ignored by Git:

- `api-evidence.json`: API/auth/SQL/export/date/validation reproduction outcomes, with credentials redacted.
- `browser-evidence.json`: browser workflows, accessibility scans, layout measurements, crash/XSS and race outcomes.
- `extra-evidence.json`: keyboard, pending-state, duplicate-click, metrics, draft, timezone and zoom checks.
- `missing-detail-evidence.json`: follow-up confirming that the initially ambiguous 404 detail case actually blanked the UI.
- `final-api-evidence.json`: complete missing-token guard probes and normal profile/export/unassignment checks.
- `llm-evidence.json`, `contrast-evidence.json`: provider mocks and palette calculations.
- `npm-audit-all.json`, `npm-audit-runtime.json`: advisory snapshots. No `npm audit fix` was run.
- Screenshot and accessibility-snapshot files referenced in the design/accessibility report.

Temporary diagnostics are not a new maintained test runner. To reproduce a finding, use the report’s steps with a fresh disposable seeded copy; never run the mass-update proof or seed command on a database that must be retained. Randomness is not required: the supplied seed creates 80 feedback records. App polling was advanced with the browser test clock rather than waiting in real time.

## Explicit limitations

No production host, edge configuration, real model request, real spreadsheet formula execution, screen-reader session, Safari/Firefox run, physical touchscreen, forced-colors mode, sustained-load test or dependency-advisory exploit was evaluated. Native browser zoom remains unverified. Role/private-note expectations remain undocumented. Accessibility tooling cannot certify conformance, and passing builds do not establish runtime correctness.

Initial tool issues (sandbox DNS, tsx IPC, missing CLI executable and selector mismatches) were resolved using permitted network access, Node’s tsx import, the existing Playwright library and observed accessible names. A follow-up confirmed the missing-detail crash after an initial selector timeout. These tooling failures are not counted as app defects.

The audit is complete within these documented boundaries. No remediation was applied.
