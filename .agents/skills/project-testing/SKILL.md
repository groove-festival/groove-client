---
name: project-testing
description: Select or design risk-relevant tests when behavior changes, a bug needs regression coverage, or validation choice is non-trivial. Do not use for documentation-only work or a single already-known check.
---

# Project Testing

Choose tests from change risk and observable behavior. Do not assume a framework
or command from the project name.

## Discover the test surface

- Inspect package manifests, build files, scripts, CI, nearby tests, fixtures,
  and established test naming.
- Confirm the behavior or contract being changed and its likely failure modes.
- The current repository uses Vitest with React Testing Library for unit and
  component tests and Playwright Chromium for E2E. Confirm commands and config
  before running them.

## Select coverage

Start with the narrowest test that can fail for the changed behavior:

- pure logic: focused unit tests and boundary cases;
- module or data contract: component or integration tests;
- user flow or multiple systems: E2E or browser tests when the repository
  supports them;
- bug fix: reproduce the defect first and add a regression test when feasible.

Check success, expected error states, malformed or missing input, boundaries,
and important state transitions. Use existing fixtures and helpers. Add a mock
only at a real dependency boundary; do not mock away the behavior being tested.
Prefer integration coverage when a fixture or mock would hide the relevant
contract.

## Execute and report

- Use only commands confirmed in current repository files or explicit user
  instructions.
- Run the focused test first, then broaden based on risk and
  `project-quality-gates`.
- Current broad commands are `pnpm test` and `pnpm test:e2e`; pass a supported
  Vitest path or filter for a focused run when appropriate.
- Do not convert failures into skips, weaken assertions, or add unrelated mocks.
- Report the exact command, outcome, relevant failure, and any test not run.
- Keep output concise. Route to `project-quality-gates` only when gate selection
  or failure interpretation is needed.
