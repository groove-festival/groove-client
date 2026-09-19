# Personal development thought record

Use this reference after `SKILL.md` establishes publication mode and evidence
scope. The result is a personal record of how the work unfolded and how the
author now understands it. It is not a public tutorial, a portfolio entry, a PR
summary, or a rewritten transcript.

## Compose one calm Notion page

Use this visual order and omit any element that has no useful content:

```text
구체적인 질문, 어긋남, 결정 또는 이해를 담은 제목

2문단 안팎의 도입
[선택] 현재 결론 또는 상태를 담은 callout 1개

3개에서 7개 정도의 내용 중심 섹션
지금의 이해
[선택] 다음에 확인할 것

[선택] 작업 근거 toggle
[선택] 검증 상태 toggle
[선택] 기록 정보 toggle
```

날짜는 제목에 기호로 연결하지 말고 Notion 속성이나 맨 아래 기록 정보에 둔다.
목차는 실제 상위 섹션이 여섯 개 이상이고 페이지를 오갈 필요가 있을 때만 둔다.

### Visual language

- Prefer a single column so the page remains readable on desktop and mobile.
- Use no cover image by default. Avoid decorative icons, emoji-heavy headings,
  progress bars, badges, and colored boxes around every section.
- Use at most one gray, blue, or green callout near the top when it adds a clear
  current decision, outcome, or caution. Reserve red for an actual hard failure.
- Use dividers to separate major reading phases, not after every heading.
- Use a table only for genuinely comparable options or repeated evidence. Keep
  it to two to five short columns; move prose out of cells.
- Avoid columns for the main narrative. They wrap poorly on mobile and make a
  chronological record harder to follow.
- Keep code, commands, errors, and file inventories out of the first viewport
  unless one of them is the subject of the record.
- Before emitting advanced Notion blocks, read the current connector syntax.
  Confirm after publication that callouts and toggles rendered natively.

## Reconstruct the observable thought trail

Find the smallest thread that explains why the author's understanding changed:

```text
처음의 질문이나 기대
→ 실제로 마주친 어긋남이나 제약
→ 확인한 내용과 시도
→ 방향을 바꾼 근거
→ 선택한 판단
→ 학습한 것
→ 지금의 이해와 남은 질문
```

This is a drafting aid, not a mandatory section list. Keep the actual order when
it helps, combine nearby steps, and give more space to the point where judgment
changed. A short but meaningful question may produce a short record.

Preserve reasonable false starts when they explain the later decision. Do not
rewrite the author as if the final answer had been obvious from the beginning.
Do not list every possible alternative or infer a rejected option that was never
considered.

Distinguish three evidence states in natural prose:

- confirmed by conversation, repository, command output, or observed behavior;
- inferred from available evidence but not directly verified;
- unresolved because the necessary evidence is absent.

Use labels only when prose would make those boundaries unclear.

## Write the body as connected Korean prose

Paragraphs are the default. Use bullets only for genuinely parallel options,
measurements, executed checks, or compact metadata. Do not turn each prompt or
event into its own bullet.

Write the retrospective in natural past tense such as `~했다`, `~였다`, and
`~라고 보았다`. Use present tense only for the current understanding, a rule
that still holds, or work that remains open. Do not force every sentence to end
the same way.

Prefer concrete subjects and verbs:

```text
처음에는 위치 권한이 원인이라고 보았다. 로그를 다시 확인하니 GPS 값은 들어오고
있었다. 문제는 좌표를 화면에 옮길 때 서로 다른 기준점을 사용한 데 있었다.
```

Use headings that carry the thought rather than classifying the document:

```text
나쁜 예: 문제 원인
좋은 예: 좌표가 아니라 기준점이 달랐다

나쁜 예: 해결 과정
좋은 예: 첫 번째 측정값부터 다시 의심했다
```

Do not use the middle-dot character in titles, headings, prose, tables, or page
metadata. A literal URL, code value, or exact error excerpt may preserve it when
changing it would corrupt the evidence.

Rewrite empty or inflated phrases instead of merely replacing one stock phrase
with another. Common warning signs include:

- `먼저 살펴보겠다`, `이제 알아보겠다`, `다음으로`;
- `결론적으로`, `요약하면`, `주목할 점은`, `본질적으로`;
- `단순히 X를 넘어`, `X뿐만 아니라 Y`, or a false `A가 아니라 B였다`;
- `효율적으로`, `체계적으로`, `성공적으로`, `강력한`, `최적의`,
  `의미 있는`, `한 단계 더` without concrete evidence;
- repeated `이를 통해`, `나아가`, and `더욱`;
- forced groups of three, uniform paragraph lengths, bold labels before every
  paragraph, and one-line dramatic conclusions.

Do not end each section with a miniature summary. Vary sentence and paragraph
length according to the importance of the thought.

## Preserve learning and the author's current understanding

Separate a learned fact from the meaning the author now assigns to it.

- `학습한 것` records a new fact, constraint, technique, or diagnostic clue
  supported by evidence.
- `지금의 이해` records the author's current mental model, the rule they would
  use next time, and the boundary where that model may stop applying.
- `남은 질문` keeps uncertainty visible when the work did not settle it.

The section title does not have to use these labels. Write them as connected
paragraphs when that reads more naturally. Do not invent a lesson for routine
work and do not use generic claims such as `협업의 중요성을 배웠다`.

A useful paragraph often moves like this:

```text
처음 예상 → 실제 관찰 → 새로 알게 된 사실 → 지금의 이해 → 다음 확인 방법
```

No dedicated bibliography is required. When a source materially changed the
judgment, link it at the sentence it supports or place it inside `작업 근거`.

## Keep evidence below the narrative

Create only non-empty toggles that materially help later investigation.

### 작업 근거

Keep concise paths, diff summaries, commands, error excerpts, and source links
that would help the author retrace the work. Use code blocks for literal command
or error text. Do not paste large raw logs.

### 검증 상태

Record only checks that ran. Keep `통과`, `실패`, `미실행`, and
`수동 확인 필요` distinct. Explain a failure or an omitted check briefly enough
to understand the remaining risk.

### 기록 정보

Keep administrative metadata at the bottom so the first viewport stays about
the work:

- 게시 모드: `요청 기록` or `Push 기록`
- 날짜: observed publication date
- Commit: every covered full hash once, or `없음 (현재 대화/미커밋 작업)`
- 관련 Issue or PR: actual links only
- 사용한 Agent or Skill: actual use only
- AI 검토, 자동 검증, 사람 검토: distinguish them only when material and only
  claim human review that actually occurred

Keep AI and tool metadata out of the main narrative unless it materially
changed the result. Never imply that AI self-review or automated checks were
human approval.

## Read-back checklist

- The title names the real question, mismatch, decision, or understanding.
- The first two paragraphs reveal why the work began and where the understanding
  currently stands.
- The main body is connected prose rather than a filled questionnaire.
- A meaningful correction, failed approach, decision, learning, or open question
  remains visible when it occurred.
- Learned facts, the author's interpretation, and unresolved questions are not
  collapsed into one certain conclusion.
- Past work uses natural retrospective tense without monotonous endings.
- No middle-dot character remains outside literal evidence.
- There are no decorative blocks, repeated summaries, empty headings, or
  invented lessons and alternatives.
- Every toggle has useful content and renders as a native block.
- No child page exists unless it met the exception in `SKILL.md`.
- Guarded records contain every covered full commit hash exactly once; on-demand
  records do not imply push synchronization.
- Secrets, personal data, raw user data, and private operations data are absent.
