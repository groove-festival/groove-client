---
name: project-quality-gates
description: Choose between targeted, fast, and full repository-backed quality gates, or interpret a failed or unavailable check. Use when validation scope is non-obvious or for commit, PR, and release readiness; skip a single obvious targeted check.
---

# Project Quality Gates

Confirm commands against `package.json` and current repository configuration.

## Build the gate

- Targeted gate: the smallest relevant file-format, focused test, type, FSD, or
  drift check for a narrow change.
- Fast gate: repository-wide format, lint, typecheck, unit tests, and FSD checks
  when several source areas changed or broad pre-commit/PR confidence is needed.
- Full gate: broader tests, integration/E2E/browser checks, production build,
  migrations, security, or dependency checks that the repository actually
  defines.
- Scale the gate to changed behavior and risk. Documentation-only work does not
  imply an application build. Do not run fast or full gates solely because a
  handoff is occurring.

The current repository defines these Workflow checks:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/sync-agent-skills.ps1 -Mode Check
```

```sh
sh scripts/sync-agent-skills.sh check
```

The current broad application commands are:

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
Automated success is validation evidence only. Pass concise exact evidence to
the final handoff.
