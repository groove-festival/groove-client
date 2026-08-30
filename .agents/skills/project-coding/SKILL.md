---
name: project-coding
description: Implement focused repository code changes while preserving discovered module boundaries, contracts, error handling, types, logging, and style. Use when adding, fixing, or refactoring code; do not invent stack-specific rules before they exist in the repository.
---

# Project Coding

Make a minimal change grounded in current repository evidence.

## Before implementation

- Read the closest applicable instructions and relevant product or technical
  specification.
- Inspect neighboring modules, call sites, tests, public contracts, error
  handling, types, logging, and naming before choosing a pattern.
- Check current Git changes and avoid overwriting work outside this task.
- For frontend placement and imports, follow `docs/FSD_ARCHITECTURE.md` and
  route structural decisions to `project-fsd`.

## During implementation

- Stay inside the stated scope and existing module boundaries.
- Preserve public behavior unless the requested change and synchronized
  specification require otherwise.
- Handle relevant invalid input, error states, state transitions, and boundary
  conditions.
- Keep types and data contracts aligned across producers and consumers.
- Log only operationally useful, non-sensitive data using existing conventions.
- Avoid unrelated refactors, file moves, dependencies, generated architecture,
  or speculative abstractions.

Run `pnpm check:fsd` for frontend file or import changes. Route tests to
`project-testing`, validation status to
`project-quality-gates`, contract changes to `project-specs-sync`, and the
material AI contribution to `project-ai-worklog`.
