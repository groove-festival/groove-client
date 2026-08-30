---
name: project-ai-worklog
description: Record material AI-assisted project work with supplied context, AI output, actual human decisions or edits, executed validation, failures, and remaining unknowns. Use before handing off AI-influenced artifacts or decisions; do not use for trivial conversations with no material impact.
---

# Project AI Worklog

Use `docs/AI_AGENT_WORKFLOW.md` as the single source for field meanings,
validation statuses, and the exact template. The canonical Skill source is
`.agents/skills/project-ai-worklog/SKILL.md`.

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

- Append an entry under `## 11. 실제 작업 기록` in
  `docs/AI_AGENT_WORKFLOW.md` using the canonical template.
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

Never rewrite older entries to imply evidence that was not recorded at the
time. Correct a factual error transparently when evidence supports the change.
