# Notion work record bundle

Create one parent record below the checkout owner's configured Notion page. Put
the seven-part core summary on that page and create the evidence-backed logs as
its child pages.

## Parent record

Title:

```text
YYYY-MM-DD · 구체적인 작업 또는 주제
```

Opening summary:

```text
무엇을 해결·이해·결정했고 현재 결과가 무엇인지 한두 문장으로 설명한다.
```

Use all seven headings. Write `해당 없음` or `확인하지 못함` with a short
reason when a field genuinely has no evidence; do not invent filler.

```markdown
## 1. 작업 내용

- 실제 구현·수정·조사·질문 범위와 주요 파일 또는 자료

## 2. 문제 상황

- 해결하려던 사용자 문제, 발생한 오류·증상 또는 궁금했던 개념

## 3. 원인

- 증거로 확인한 원인
- 아직 가설뿐이라면 `확인하지 못함`과 미확인 범위

## 4. 시도한 방법

- 실제 시도한 방법과 각각의 결과를 관찰된 순서대로 정리

## 5. 최종 해결 및 선택 이유

- 최종 해결·결론·선택과 이유
- 확정되지 않았다면 현재 상태와 필요한 다음 판단

## 6. 결과

- 실제 변경 결과, 실행한 검증, 관찰한 수치와 실패·미실행 상태

## 7. 배운 점 / 다음 개선

- 다음 작업에도 재사용할 수 있는 구체적인 배움과 후속 개선

---

- 기록 유형: `요청 기록` 또는 `Push 기록`
- Commit: 아래 mode 규칙 적용
- 생성한 세부 기록: child page 링크 또는 생략 이유
- 관련 Issue / PR: 실제 링크 또는 `없음`
- Agent: 실제 사용한 Agent와 Skill
```

For a guarded push record, use `Push 기록` and list each covered full commit
hash under `Commit`. For an on-demand note, use `요청 기록`; write
`없음 (미커밋 작업 기록)` when no commit is covered. If a commit is mentioned
only as context, label it as related context rather than synchronization
evidence. Do not add a human review or approval status.

## Child records

Create each applicable record as a separate child page below the parent. Link
every created child from `생성한 세부 기록`. If a conditional record is omitted,
write its omission reason there instead of creating an empty page.

### Raw Development Log

Create whenever the request has a meaningful development or investigation
process. Preserve the observed order without guessing timestamps.

```markdown
## 진행 기록

1. 요청·목표 — 무엇을 하려 했는지
2. 확인 — 읽은 코드·문서와 확인한 상태
3. 변경·시도 — 주요 코드 변경, 수정 파일, 명령 또는 접근
4. 문제·결과 — 발생한 오류와 각 시도의 관찰 결과
5. 현재 상태 — 최종 결과와 남은 사항
```

Use additional numbered steps when the process needs them. Do not turn the log
into a transcript or add times that were not observed.

### Decision Log

Create this child for every record bundle. Include only actual technical or
product decisions.

```markdown
## 결정: 구체적인 결정 제목

- 맥락:
- 검토한 선택지:
- 최종 선택:
- 선택 이유:
- 버린 대안과 이유:
- Trade-off:
- 관련 근거:
```

Do not infer rejected alternatives merely because other implementations were
possible. If no actual decision occurred, write
`이번 작업에서 확인된 기술적 의사결정 없음` instead of filling the template
with invented choices.

### Troubleshooting Log

Create only when an error, unexpected behavior, or failed approach was actually
investigated.

```markdown
## 문제

- 관찰한 증상과 영향

## 가설

- 당시 세운 가설과 근거

## 검증

- 실제 확인·명령·실험과 결과

## 원인

- 확인된 원인 또는 `확인하지 못함`

## 해결

- 적용한 해결과 재검증 결과 또는 현재 미해결 상태
```

If no troubleshooting occurred, omit this child and state
`생성하지 않음 — 트러블슈팅 없음` on the parent.

### Portfolio Candidate

Create only when the work has clear portfolio value such as non-trivial problem
solving, a meaningful technical decision, implementation difficulty, or a
measured improvement. Summarize it in 5–10 concise Korean lines covering the
problem, role or action, difficult point, decision, and verified result.

Exclude trivial file edits, routine setup, and unverified claims. If the work is
not a useful candidate, omit this child and state
`생성하지 않음 — 포트폴리오 후보 기준 미충족` on the parent.

## Writing style

- Use short Korean sentences and concrete verbs. Prefer “필드를 줄였다” over
  “효율적이고 체계적인 개선을 성공적으로 수행했다.”
- Base every claim on accessible conversation, code changes, errors, commands,
  or observed results. Keep confirmed causes separate from hypotheses.
- Compress repeated questions into the durable question and its answer. Preserve
  why the answer mattered, important exceptions, and how it affected the result.
- Keep each bullet focused on one fact. Use code formatting for files, commands,
  errors, identifiers, and commit hashes.
- Avoid emojis, decorative covers, generic praise, marketing language, and
  repeated conclusions.
- Exclude credentials, tokens, personal data, raw user data, and private
  operations data. Replace sensitive input with a safe category or summary.

## Read-back and readability checks

- The parent title identifies the work or topic without opening the page.
- The first viewport contains the opening summary and the beginning of the
  seven-part summary without decoration.
- All seven parent headings exist, and empty evidence is labeled rather than
  fabricated.
- Every created child is linked from the parent and renders with the intended
  hierarchy.
- Raw Development Log follows the observed sequence and does not invent time.
- Decision and Troubleshooting Logs distinguish facts, hypotheses, and choices.
- Portfolio Candidate is 5–10 lines and exists only when its criteria are met.
- Actual failures, unrun validation, evidence gaps, and remaining work are
  visible. No human review or approval status appears.
- In guarded mode, every covered commit hash appears exactly once in the parent
  metadata. In on-demand mode, the parent says whether a commit is covered and
  does not imply push synchronization.
