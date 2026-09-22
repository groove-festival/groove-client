---
name: project-specs-sync
description: Keep product behavior, API, data, event, configuration, defaults, examples, and user-facing documentation synchronized with implemented changes. Use when a contract may change or when deciding whether a code-only change requires specification updates.
---

# Project Specs Sync

Use `groove-docs/README.md` to locate the current product requirements and API
specifications. Treat the PRD as a requirements source, not as automatic
authorization to implement every next step it contains. `docs/PRD.md` is a
legacy copy, not the source of truth. If the submodule is unavailable, report
that rather than silently relying on the legacy copy. Identify other
authoritative specifications from the repository before editing them.

## Detect affected contracts

Check synchronization when a change affects:

- user-visible behavior, flow, validation, error, or default;
- API request, response, authentication, authorization, or status;
- database entity, field, relationship, migration, or retention rule;
- event schema, ordering, delivery, or consumer expectation;
- configuration key, environment variable, default, deployment path, or
  operational procedure;
- example, fixture, generated artifact, or documented command.

Trace both producers and consumers. When requirements conflict with code or
another specification, surface the conflict instead of silently choosing one.

## Synchronize or explain

- Update only authoritative documents and examples within the requested scope.
- Preserve unresolved product decisions as open issues; do not invent a
  decision to make documents appear consistent.
- Run any repository-provided generation or drift check and record the actual
  result.
- If no code changed, or no specification update is needed, record the concrete
  reason rather than omitting the check.
- If a required document is missing or ownership is unclear, mark it
  `수동 확인 필요`.

Pass changed contracts, deliberate non-changes, drift results, and unresolved
decisions to the final handoff.
