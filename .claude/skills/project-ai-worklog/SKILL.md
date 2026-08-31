---
name: project-ai-worklog
description: Record material AI-assisted artifacts or decisions in the current monthly worklog with actual context, output, decisions, validation, and unknowns. Do not use for trivial questions or unadopted suggestions.
---

# Project AI Worklog

Use sections 4 and 5 of `docs/AI_AGENT_WORKFLOW.md` as the source for field
meanings, statuses, and the exact template. Do not load the whole policy for a
routine entry, and do not read prior worklogs unless auditing or correcting one.

## Decide whether to record

Record when AI materially influenced a project artifact or decision: planning,
code, architecture, tests, debugging, documentation, review, security analysis,
or user-facing generated output. Do not create noise for a trivial question or
an unadopted suggestion.

## Gather evidence

Before writing, inspect the actual diff and validation outputs. Separate:

1. user problem and intended outcome;
2. requirements, files, tests, and documents actually supplied or read;
3. AI proposals and generated artifacts;
4. human decisions and edits that actually occurred;
5. commands and manual checks that actually ran;
6. failures, unrun checks, manual verification, and residual risk.

Do not infer a meeting, human decision, edit, command, or result from an
artifact's existence. Do not record human review or approval statuses.

## Write the entry

- Append the entry to `docs/ai-worklogs/YYYY-MM.md` for the current month.
- If the monthly file does not exist, create it with
  `# AI worklog — YYYY-MM` before the first entry. Do not copy policy prose into
  the log.
- Use safe paths, categories, or summaries instead of secrets, personal data,
  raw user data, or private operations data.
- Name major changed or proposed files under `AI 제안 또는 산출물`.
- In `사람이 실제로 결정·수정한 내용`, record only confirmed human decisions
  or direct edits. Use `없음` when there are none; never add a human review or
  approval status. AI self-checking and AI cross-checking belong in the AI
  contribution.
- In `검증 결과`, include each executed command and `통과` or `실패`.
  Mark unrun checks with `미실행`, the reason, and the unknown impact.
- Put unresolved failure, environment gaps, and human-only decisions under
  `남은 확인 사항`.
- Use `없음` when there is no real Issue, PR, or Discussion.

Never read or rewrite older entries merely to prepare a new one. Correct a
factual error transparently only when the task concerns that entry and evidence
supports the change.

When the user authorized a commit and push and this checkout is configured for
Notion publishing, finish this local entry before the final planned commit.
After commit, route to `project-notion-worklog`; do not publish an uncommitted
draft or mark an external record as synchronized from an expected result.
