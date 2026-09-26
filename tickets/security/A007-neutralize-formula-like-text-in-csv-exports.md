# A007: Neutralize formula-like text in CSV exports

- **Status:** Open
- **Severity:** Medium
- **Area:** Security
- **Classification:** Current defect
- **Audit evidence:** Runtime-confirmed
- **Source finding:** [A007 — CSV quoting leaves spreadsheet formulas active](../security_best_practices_report.md#a007--csv-quoting-leaves-spreadsheet-formulas-active)
- **Related tickets:** [A006](A006-keep-bearer-tokens-out-of-exports-and-logs.md).

## Problem and evidence

The seeded `=HYPERLINK(...)` message was exported with the formula prefix intact inside a quoted cell. csvCell doubles quotes but does not neutralize formula-leading text.

A spreadsheet application may interpret customer-controlled text as a formula when an agent opens an export.

## Affected code

[server/src/index.ts:56–57](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L56); [server/src/index.ts:181–204](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/index.ts#L181).

**Security guidance:** CSV/formula injection.

## Tasks

- [x] Define a protective text encoding for untrusted CSV cells and document text-import guidance; application-specific verification remains open below.
- [x] Handle dangerous formula prefixes, leading control characters and normal CSV quote/newline escaping.
- [ ] Validate with synthetic fixtures in the intended spreadsheet application without external side effects.

## Acceptance criteria

- [ ] Export malicious-prefix, tab/newline, quote and multiline fixtures; they import as literal text while ordinary CSV values remain intact.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Apply a documented spreadsheet-safe text encoding to untrusted cells, including dangerous prefixes and leading control characters. Preserve proper CSV escaping and test the intended spreadsheet import path.

Formula text in the file is confirmed; a spreadsheet was not opened and formula execution is not claimed. See [OWASP CSV injection](https://community.owasp.org/attacks/CSV_Injection).

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## CSV exports encoding implementation — 2026-09-26

The shared CSV cell encoder now prefixes an apostrophe for ASCII/full-width formula starters (=, +, -, @), including whitespace/control-prefixed starters, and for text beginning with control characters. It then applies the existing double-quote wrapping/escaping to every exported field. Ordinary text and internal newlines/quotes retain their values. Stored data, the seeded formula example and note inclusion policy are unchanged.

Temporary checks covered 24 explicit fixtures: formula starters, leading tab/CR/LF/space, full-width variants, ordinary text, commas, quotes, multiline text, Unicode, empty strings and separator-looking content. A real CSV parser verified all 96 exported fixture records, exact expected values and protected internal notes. Additional checks covered every untrusted text column. Both workspace builds passed.

**Remaining acceptance:** spreadsheet-application import is unverified and A007 remains Open. The user explicitly requested no LibreOffice test. An already-dispatched headless conversion had finished before the stop request could take effect; its output was not inspected or used as evidence and was discarded. No further spreadsheet-application checks were run. Completion is limited to encoding and parsed CSV bytes, not formula evaluation behavior in a spreadsheet.

README documents text import with the protective prefix retained and the unverified application boundary, with [OWASP guidance](https://community.owasp.org/attacks/CSV_Injection). No claim of universal spreadsheet or save/reopen compatibility is made. Local evidence: `output/playwright/b04/synthetic-export.csv` and `verification.json`.
