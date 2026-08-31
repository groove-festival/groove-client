# Notion work record

Use a child page below the checkout owner's configured Notion page.

## Page shape

Title:

```text
YYYY-MM-DD · 구체적인 작업 제목
```

Body:

```markdown
작업 결과를 설명하는 한두 문장.

## 작업 내용

- 실제 변경 결과

## 결정과 이유

- 선택한 방법과 그 이유

## AI와 정리한 내용

- 결과에 영향을 준 질문, 답, 시행착오 또는 트러블슈팅

## 검증

- `실제로 실행한 명령` — 통과 또는 실패와 핵심 결과
- 미실행 항목 — 이유와 확인하지 못한 범위

## 남은 사항

- 후속 확인, 해결되지 않은 실패 또는 `없음`

---

- Commit: `full commit hash`
- 관련 Issue / PR: 실제 링크 또는 `없음`
- Agent: 실제 사용한 Agent와 Skill
```

For a batch, list each commit under `Commit`. Keep one result-oriented title.
Do not add a human review or approval status.

## Writing style

- Use short Korean sentences and concrete verbs. Prefer “필드를 줄였다” over
  “효율적이고 체계적인 개선을 성공적으로 수행했다.”
- Keep each section to one to five bullets. Omit a section's filler, but retain
  the heading and write `없음` when absence is meaningful.
- Summarize conversation as `문제 → 정리 → 반영` only when it changed the
  result. Do not preserve greetings, repeated questions, or the chat timeline.
- Name relevant files, commands, failures, and decisions precisely. Do not
  speculate about intent or outcome.
- Avoid emojis, decorative covers, repeated conclusions, generic praise,
  marketing language, and large tables.
- Exclude credentials, tokens, personal data, raw user data, and private
  operations data. Replace sensitive input with a safe category or summary.

## Read-back and readability checks

- The title identifies the result without opening the page.
- The first viewport contains the summary and `작업 내용` without decoration.
- Headings render as headings rather than raw markup.
- Bullets are parallel, non-repetitive, and short enough to scan.
- Commands and commit hashes use code formatting.
- Actual failure, unrun validation, and remaining work are visible.
- No human review or approval status appears.
- Every covered commit hash appears exactly once in the metadata block.
