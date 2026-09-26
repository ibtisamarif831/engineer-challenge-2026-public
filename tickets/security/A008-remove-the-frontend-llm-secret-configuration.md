# A008: Remove the frontend LLM secret configuration

- **Status:** Done
- **Severity:** Medium
- **Area:** Security
- **Classification:** Production-readiness gap
- **Audit evidence:** Source-confirmed
- **Source finding:** [A008 — The frontend offers a public build-time slot for an LLM secret](../security_best_practices_report.md#a008--the-frontend-offers-a-public-build-time-slot-for-an-llm-secret)
- **Related tickets:** [A024](../functionality/A024-handle-provider-failures-and-summary-timeouts.md).

## Problem and evidence

`VITE_OPENAI_API_KEY` is read by browser code and sent as `x-llm-key`; the server ignores that header and uses its own environment key. The current local frontend setting was checked as empty without printing its value.

If someone fills this apparent configuration option with a real secret, it becomes downloadable in client code and visible in requests.

## Affected code

[web/src/config.ts:1–2](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/config.ts#L1); [web/src/api.ts:110–120](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/src/api.ts#L110); [web/.env.example:2](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/web/.env.example#L2); [server/src/llm.ts:6–11](https://github.com/ibtisamarif831/engineer-challenge-2026-public/blob/12566cc3f2291269cede31274c15471d6b971212/server/src/llm.ts#L6).

**Security guidance:** REACT-CONFIG-001.

## Tasks

- [x] Remove VITE_OPENAI_API_KEY and the unused x-llm-key request header.
- [x] Document only server-side provider-key configuration and keep fake summaries available.
- [x] Inspect published assets if applicable and rotate any real key previously exposed; use a sentinel for regression checks.

## Acceptance criteria

- [x] A synthetic secret sentinel never appears in browser assets or requests; fake and server-backed summaries still work.
- [x] Record the verification performed and remaining limitations in this ticket before marking it done.

## Implementation context

Remove the frontend secret variable and custom key header; document only the server-side key. Inspect released bundles and rotate any key that was ever published.

No current real-key exposure was found. Severity is conditional on configuration. [Vite documents client exposure of VITE-prefixed values](https://vite.dev/guide/env-and-mode#env-variables).

Audit baseline: `12566cc3f2291269cede31274c15471d6b971212` (2026-09-26). Recheck the current code before implementation. Follow the shared validation and completion guidance in the [ticket index](../README.md).

## Content rendering and provider keys verification — 2026-09-26

Removed the frontend key variable/export, its environment-example entry and the unused x-llm-key header. README documents server/.env as the sole provider-key location and retains FAKE_LLM=true for key-free offline summaries. Existing local .env files were not modified.

Built the web app with a synthetic VITE_OPENAI_API_KEY sentinel: neither that sentinel nor x-llm-key appeared in the generated assets. Browser verification also supplied the synthetic frontend variable; captured summary-request headers contained neither the key header nor its sentinel. The real server integration was exercised with a mocked fetch response: it used only the server-side key and returned the mocked summary correctly. Switching to fake summaries worked without another provider call. Both workspace builds passed; no external/paid provider call occurred. Local fixture evidence: `output/playwright/b03/summary-checks.json`.

This closes the local source/build/request exposure path. No published deployment was part of this work, so published-asset inspection/rotation is not applicable to this verification. No previously exposed real key is claimed. Provider timeouts/error handling remain separate in A024; no key-management service was added.
