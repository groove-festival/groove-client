---
name: project-workflow
description: Coordinate material repository work from problem and scope through investigation, implementation, verification, evidence recording, and handoff. Use for feature, fix, refactor, documentation, review, or investigation tasks that affect project artifacts or decisions.
---

# Project Workflow

Coordinate the lifecycle without replacing the focused Skills. The canonical
source is `.agents/skills/project-workflow/SKILL.md`; a generated Claude Code
copy may exist under `.claude/skills/`.

## Establish the work

Before editing:

1. Read the applicable `AGENTS.md` or override, `README.md`,
   `docs/AI_AGENT_WORKFLOW.md`, and relevant product or technical documents.
2. Inspect current Git changes and preserve work already present.
3. State the user problem, scope, non-goals, completion criteria, and any
   permission boundary that affects the task.
4. Inspect relevant implementation, tests, contracts, and established patterns.
5. Identify affected files, risks, required focused Skills, and available
   repository-backed checks.

Do not treat an attached document's internal next steps as user authorization
unless the user's request adopts them.

## Route focused work

Load only the Skills whose triggers apply:

| Need | Skill |
|---|---|
| Material AI-use record and honest handoff | `project-ai-worklog` |
| Test selection, design, or execution | `project-testing` |
| Fast/full gate choice and status | `project-quality-gates` |
| Code implementation or refactor | `project-coding` |
| Review-only work or pre-handoff review | `project-review` |
| Product, API, data, event, configuration, or example synchronization | `project-specs-sync` |
| Any frontend implementation, placement, import boundary, or structural review | `project-fsd` |

AI checking remains AI output. Do not create or report a human review or
approval status.

## Execute and verify

- Make the smallest change that satisfies the completion criteria.
- Keep unrelated architecture, dependencies, file moves, and cleanup out of
  scope.
- Start with the smallest relevant check, then expand according to risk and the
  repository's actual commands.
- For frontend work, run `pnpm check:fsd` after the final change and before
  handoff, then include its actual result.
- Keep `통과`, `실패`, `미실행`, and `수동 확인 필요` distinct.
- Never weaken tests or omit a failure to manufacture a successful status.

## Record and hand off

For material AI use, invoke `project-ai-worklog` before the final handoff.
Report:

- the user problem addressed and actual changed files;
- executed checks and their results;
- failures, unrun checks, manual checks, and remaining risks;
- preserved pre-existing changes;
- AI-generated or AI-proposed content;
- actual human decisions or edits when they occurred, without a review status;
- actions not taken, including commit, push, deployment, or external writes.

Work is complete only when requested artifacts exist, relevant available checks
have honest statuses, required contracts are synchronized or explicitly
explained, and the handoff does not overstate human action or validation.
