# Repository agent contract

Use the smallest context, Skill set, and validation scope that can safely answer
the request. Detailed evidence rules live in `docs/AI_AGENT_WORKFLOW.md` and are
loaded only when they apply.

## Load context on demand

- Follow the closest applicable `AGENTS.override.md` or `AGENTS.md`; the more
  specific file wins.
- Inspect current Git changes and the files directly related to the request
  before editing.
- Read `README.md` for setup, commands, or repository orientation.
- Read `CONVENTION.md` for implementation, testing, Git, or collaboration rules.
- Read `docs/PRD.md` only for product behavior, requirements, data contracts, or
  user flows.
- Read `docs/FSD_ARCHITECTURE.md` before frontend file placement, movement,
  public API, or import-boundary work.
- Read `docs/AI_AGENT_WORKFLOW.md` only when recording or auditing AI evidence,
  changing the Workflow, or resolving a validation-status question. Do not read
  historical files under `docs/ai-worklogs/` unless the task concerns them.

Confirm the user problem, scope, non-goals, and completion criteria in
proportion to the task. A narrow question or single-file edit does not require a
full project survey.

## Working contract

- Preserve existing user and teammate changes. Make the smallest relevant
  change and avoid unrelated refactors, file moves, dependencies, or
  architecture changes.
- Protect credentials, tokens, passwords, personal data, raw user data, and
  private operations data. Give external tools the minimum necessary access.
- For code changes, check relevant types, error states, boundaries, tests, and
  documentation or specification synchronization.
- After the final frontend source, file-placement, public-API, or import change,
  run `pnpm check:fsd`. Keep that result distinct from behavior tests.
- Choose the smallest repository-backed validation that matches the risk. Do
  not run `pnpm check:fast` or `pnpm check:full` automatically for documentation
  or a narrow change when targeted evidence is sufficient.
- Record only checks that actually ran. Distinguish `통과`, `실패`, `미실행`,
  `수동 확인 필요`, and `해당 없음`.
- Keep AI output, actual human decisions or edits, and automated evidence
  distinct. Do not record a human review or approval status.
- Do not commit, push, create a branch or PR, deploy, delete material data,
  change production, send external messages, or incur cost unless explicitly
  authorized.
- For a requested commit, present the order, messages, files, separation reason,
  and validation first; wait for approval before `git add` or `git commit`.
- When commit and push are authorized, finish the local AI worklog before the
  final planned commit, commit, publish one verified Notion record with
  `project-notion-worklog`, then push. A checkout opted in with
  `pnpm notion:setup` authorizes writes only below its configured personal page.
  Never mark Notion synchronization without reading the written page back.

## Skill routing

Load only the smallest applicable set of canonical Skills under
`.agents/skills/`:

- `project-workflow`: multi-step or cross-cutting work that needs lifecycle
  coordination; do not load it by default for a narrow task.
- `project-ai-worklog`: material AI-use evidence in
  `docs/ai-worklogs/YYYY-MM.md`.
- `project-notion-worklog`: post-commit, pre-push publication to the checkout
  owner's configured Notion page.
- `project-testing`: non-trivial test selection, design, or regression coverage.
- `project-quality-gates`: choosing targeted/fast/full gates, interpreting a
  failure, or assessing commit/PR/release readiness.
- `project-coding`: focused code implementation or refactoring.
- `project-review`: explicit review or high-risk independent defect search.
- `project-specs-sync`: product, API, data, event, or configuration contracts.
- `project-fsd`: every frontend placement, public API, or import-boundary task.

Treat `.agents/skills/` as the only editable Skill source. Generate
`.claude/skills/` with the documented sync script.

## Handoff

Report changed files, actual validation, unresolved failures or unrun checks,
remaining risks, and preserved pre-existing changes. Record material AI use in
the current monthly worklog without loading previous logs. The responsible
person retains final decision authority.
