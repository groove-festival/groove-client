---
name: project-quality-gates
description: Choose and report repository-backed fast and full quality gates without overstating completion. Use before handoff, review, or release decisions and whenever validation fails or cannot run.
---

# Project Quality Gates

Use the current command baseline in `docs/AI_AGENT_WORKFLOW.md`, but confirm it
against repository configuration because commands can change.

## Build the gate

- Fast gate: the smallest applicable format/lint, typecheck, focused test, and
  generated-file or schema drift checks.
- Full gate: broader tests, integration/E2E/browser checks, production build,
  migrations, security, or dependency checks that the repository actually
  defines.
- Scale the gate to the changed behavior and risk. A documentation-only change
  does not imply an application build; a contract or runtime change may require
  broader checks.

The current repository defines these Workflow checks:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/sync-agent-skills.ps1 -Mode Check
```

```sh
sh scripts/sync-agent-skills.sh check
```

No application install, build, test, lint, format, typecheck, CI, E2E, or
browser command was present at the initial 2026-08-31 baseline. The current
application commands are:

```sh
pnpm check:fast
pnpm check:full
```

`check:fast` runs format checking, ESLint, TypeScript, Vitest, and Steiger.
`check:full` adds the production build and Playwright Chromium E2E. Confirm the
scripts in `package.json` before use. Run the platform-appropriate Workflow
Skill drift check separately.

## Classify evidence

For every candidate check, record one state:

- `통과`: the command or manual check ran and succeeded;
- `실패`: it ran and failed; preserve symptoms and confirmed cause;
- `미실행`: it did not run; include reason and unknown impact;
- `수동 확인 필요`: a person or unavailable environment must verify it;
- `해당 없음`: it does not apply and the reason is explicit.

Do not call the work verified when a relevant failure remains unresolved.
Automated success is validation evidence only. Pass the exact evidence to
`project-ai-worklog` and the final handoff.
