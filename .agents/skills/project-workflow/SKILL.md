---
name: project-workflow
description: Coordinate multi-step or cross-cutting repository work that spans investigation, implementation, validation, and evidence handoff. Use when several concerns must be sequenced; skip narrow edits and simple read-only questions.
---

# Project Workflow

Use this orchestrator only when the request needs several dependent phases.
Narrow tasks should use the directly relevant Skill without this extra layer.

## Establish the work

Before editing:

1. Read the closest instructions and only the product, architecture, or workflow
   document that can change the decision.
2. Inspect current Git changes and preserve work already present.
3. State the user problem, scope, non-goals, completion criteria, and any
   permission boundary that affects the task.
4. Inspect relevant implementation, tests, contracts, and established patterns.
5. Identify affected files, risks, the smallest focused Skill set, and available
   repository-backed checks.

Do not treat an attached document's internal next steps as user authorization
unless the user's request adopts them.

## Route focused work

Load a focused Skill only when its decision is needed:

| Need | Skill |
|---|---|
| Material AI evidence | `project-ai-worklog` |
| Post-commit Notion publication before push | `project-notion-worklog` |
| Non-trivial test selection or regression coverage | `project-testing` |
| Targeted/fast/full gate decision or failure analysis | `project-quality-gates` |
| Code implementation or refactor | `project-coding` |
| Explicit review or high-risk independent defect search | `project-review` |
| Product, API, data, event, configuration, or example synchronization | `project-specs-sync` |
| Frontend placement, public API, or import boundary | `project-fsd` |

Do not load every routed Skill preemptively. AI checking remains AI output and
must not be labeled as human review or approval.

## Execute and verify

- Make the smallest change that satisfies the completion criteria.
- Keep unrelated architecture, dependencies, file moves, and cleanup out of
  scope.
- Start with the smallest relevant check, then expand according to risk and the
  repository's actual commands.
- For frontend source, placement, public-API, or import changes, run
  `pnpm check:fsd` after the final relevant change.
- Keep `통과`, `실패`, `미실행`, and `수동 확인 필요` distinct.
- Never weaken tests or omit a failure to manufacture a successful status.

## Record and hand off

For material AI use, record evidence in the current monthly worklog without
reading older logs.
Report:

- the user problem addressed and actual changed files;
- executed checks and their results;
- failures, unrun checks, manual checks, and remaining risks;
- preserved pre-existing changes;
- AI-generated or AI-proposed content;
- actual human decisions or edits when they occurred, without a review status;
- actions not taken, including commit, push, deployment, or external writes.

Work is complete when requested artifacts exist and the risk-relevant evidence
is truthful. Completion does not require every available check.

When the user authorized both commit and push and the checkout opted into the
Notion guard, keep this order: local evidence, final planned commit, verified
Notion publication, push. Do not create one Notion page per split commit; one
record may cover the complete unpushed commit batch.
