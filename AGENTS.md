# Repository agent contract

This file is the short execution contract for Codex and the shared contract
imported by Claude Code. Detailed evidence and recording rules live in
`docs/AI_AGENT_WORKFLOW.md`.

## Read before work

- Follow the closest applicable `AGENTS.override.md` or `AGENTS.md`. More
  specific instructions take precedence over this root file.
- Read `README.md`, `CONVENTION.md`, and `docs/AI_AGENT_WORKFLOW.md`. Read
  `docs/PRD.md` when product behavior, requirements, data contracts, or user
  flows are in scope. Read `docs/FSD_ARCHITECTURE.md` before frontend work.
- Confirm the user problem, scope, non-goals, and completion criteria before
  making material changes.
- Inspect relevant code, tests, specifications, configuration, current Git
  changes, and established patterns before editing. Do not invent a project
  command or rule when none is present.

## Working contract

- Preserve existing user and teammate changes. Never discard or overwrite them
  merely to simplify the task.
- Make the smallest change that solves the stated problem. Avoid unrelated
  refactors, file moves, dependencies, or architecture changes.
- Do not add a dependency unless the task requires it and the user approves
  the new dependency under the repository's existing process.
- Protect credentials, tokens, passwords, personal data, raw user data, and
  private operations data. Give external tools the minimum necessary access.
- For code changes, check relevant types, error states, boundaries, tests, and
  documentation or specification synchronization.
- End every frontend implementation or structural review by running
  `pnpm check:fsd` after the final change. Keep its result distinct from
  behavior tests and other quality gates.
- Run only repository-backed checks that are relevant and available. Record
  exactly what ran and distinguish `통과`, `실패`, `미실행`, and
  `수동 확인 필요`.
- Keep AI output, actual human decisions or edits, and automated validation
  evidence distinct. Do not invent a human action that did not occur, and do
  not record a human review or approval status.
- The responsible person retains final decision authority.
- Do not commit, push, create a branch or PR, deploy, delete material data,
  change production, send external messages, or incur cost unless the user
  explicitly authorizes that action and repository rules permit it.
- If the user requests a commit, first present commit order, messages, included
  files, separation rationale, and validation. Wait for explicit approval of
  that plan before running `git add` or `git commit`. Follow the commit format
  in `CONVENTION.md`; the tracked hook is activated with `pnpm hooks:install`.

## Skill routing

Start material work with `project-workflow` under `.agents/skills/`. It routes
to the focused Skills below without duplicating their procedures:

- `project-ai-worklog` for material AI-use records in
  `docs/AI_AGENT_WORKFLOW.md`.
- `project-testing` for risk-based test selection and regression coverage.
- `project-quality-gates` for verified fast/full checks and truthful status.
- `project-coding` for minimal, pattern-preserving implementation.
- `project-review` for evidence-based review findings.
- `project-specs-sync` for product, API, data, event, and configuration
  contract synchronization.
- `project-fsd` for Feature-Sliced Design placement, public APIs, import
  boundaries, and `pnpm check:fsd`.

Treat `.agents/skills/` as the canonical Skill source. Do not edit generated
copies under `.claude/skills/`; use the repository sync script documented in
`docs/AI_AGENT_WORKFLOW.md`.

## Handoff

Report changed files, actual verification and results, preserved pre-existing
changes, failures or unrun checks, remaining risks, and actual human decisions
or edits when they occurred. Do not report a human review status. Record
material AI contribution using the canonical worklog template.
