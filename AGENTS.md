# Repository agent contract

Use the smallest context, Skill set, and validation scope that can safely answer
the request.

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

Confirm the user problem, scope, non-goals, and completion criteria in
proportion to the task. A narrow question or single-file edit does not require a
full project survey.

## Working contract

- Preserve existing user and teammate changes. Make the smallest relevant
  change and avoid unrelated refactors, file moves, dependencies, or
  architecture changes.
- Before writing code for a non-trivial change, present a short plan (problem,
  files to add or change, approach, key trade-offs or open decisions, and
  planned validation) and wait for approval. Non-trivial means new files, new
  dependencies, structural, public-API, or import-boundary changes, multi-file
  edits, or a request with unresolved design choices. Skip the plan for a
  single obvious edit, a rename, a typo, or a change the user already specified
  precisely.
- Protect credentials, tokens, passwords, personal data, raw user data, and
  private operations data. Give external tools the minimum necessary access.
- For code changes, check relevant types, error states, boundaries, tests, and
  documentation or specification synchronization.
- After the final frontend source, file-placement, public-API, or import change,
  run `pnpm check:fsd`. Keep that result distinct from behavior tests.
- For a Figma-backed screen, use the exact frame or component node as the
  static target and the Prototype only for state transitions. Compare the
  target with the real browser under pinned conditions using
  `project-figma-visual-parity`; do not call a result identical without
  measured evidence. A Figma link authorizes inspection, not writes.
- Choose the smallest repository-backed validation that matches the risk. Do
  not run `pnpm check:fast` or `pnpm check:full` automatically for documentation
  or a narrow change when targeted evidence is sufficient.
- Record only checks that actually ran. Distinguish `통과`, `실패`, `미실행`,
  `수동 확인 필요`, and `해당 없음`.
- Do not commit, push, create a branch or PR, deploy, delete material data,
  change production, send external messages, or incur cost unless explicitly
  authorized.
- For a requested commit, present the order, messages, files, separation reason,
  and validation first; wait for approval before `git add` or `git commit`.
- When commit and push are authorized, create the final planned commit, publish
  and read back one Notion document for the unpushed commit batch, run
  `pnpm notion:mark` with its URL, then push. The post-commit hook marks the new
  commit pending, and pre-push blocks commits without a verified document.
- When the user explicitly asks to document a discussion in Notion without a
  commit, use `project-notion-worklog` in on-demand mode and do not change
  commit guard state.

## Skill routing

Load only the smallest applicable set of canonical Skills under
`.agents/skills/`:

- `project-workflow`: multi-step or cross-cutting work that needs lifecycle
  coordination; do not load it by default for a narrow task.
- `project-notion-worklog`: requested Notion conversation documentation and
  post-commit documentation required by the push guard.
- `project-testing`: non-trivial test selection, design, or regression coverage.
- `project-quality-gates`: choosing targeted/fast/full gates, interpreting a
  failure, or assessing commit/PR/release readiness.
- `project-coding`: focused code implementation or refactoring.
- `project-review`: explicit review or high-risk independent defect search.
- `project-specs-sync`: product, API, data, event, or configuration contracts.
- `project-fsd`: every frontend placement, public API, or import-boundary task.
- `project-figma-visual-parity`: Figma-backed implementation, visual
  correction, or Prototype-flow verification.

Treat `.agents/skills/` as the only editable Skill source. Generate
`.claude/skills/` with the documented sync script.

## Handoff

Report changed files, actual validation, unresolved failures or unrun checks,
remaining risks, and preserved pre-existing changes. The responsible person
retains final decision authority.
