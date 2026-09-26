# A009: Triage and update vulnerable dependencies

- **Status:** Open
- **Severity:** Medium
- **Area:** Security
- **Classification:** Current dependency risk
- **Audit evidence:** Source-confirmed; exploit reachability requires verification
- **Source finding:** [A009 — The installed dependency tree has outstanding advisories](../security_best_practices_report.md#a009--the-installed-dependency-tree-has-outstanding-advisories)
- **Related tickets:** [A010](A010-validate-writes-and-enforce-data-relationships.md), [A013](A013-return-consistent-safe-json-api-errors.md).

## Problem and evidence

Live npm audit reported nine affected package entries (five high, four moderate). With `--omit=dev`, only three moderate entries remain: Express 4.22.2, body-parser 1.20.5 and qs 6.15.3. Counts include propagated dependency effects, not nine distinct app exploits.

The runtime parser chain carries known upstream risks; build-tool advisories add maintenance exposure but are not evidence of browser/runtime compromise.

## Affected code

[package-lock.json:1554](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/package-lock.json#L1554); [package-lock.json:2128](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/package-lock.json#L2128); [package-lock.json:2963](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/package-lock.json#L2963).

**Security guidance:** EXPRESS-DEPS-001; REACT-SUPPLY-001.

## Tasks

- [ ] Check runtime advisory prerequisites and record applicability to the actual parser configuration.
- [ ] Prepare compatible runtime dependency and lockfile updates; handle development-tool updates separately.
- [ ] Run full/runtime-only advisory checks and both builds, recording remaining advisories and regression results.

## Acceptance criteria

- [ ] Run both audits after changes, record any accepted advisories and their reachability analysis, and pass API/browser regressions.
- [ ] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Review the qs advisories and update the runtime parser dependency chain to patched compatible versions through a reviewed lockfile change. Triage developer-tool updates separately; rerun builds and malformed-query tests.

No advisory exploit or load test was run. The invalid body-parser limit prerequisite is absent (default JSON limit is used); qs comma parsing is not explicitly enabled. Do not equate npm severity with proven app exposure. See the dependency appendix.

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).
