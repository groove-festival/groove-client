# Purpose-shaped Notion work record

Use this reference after selecting the record purpose in `SKILL.md`. The default
artifact is one calm, single-column Notion page. It should read like a useful
development journal written after checking the evidence, not like a pull request
template or a transcript rewritten into bullets.

## Single-page composition

Use this visual order and omit any element that has no useful content:

```text
YYYY-MM-DD · 구체적인 문제, 결정 또는 배움

2–4문장의 도입부
[선택] 현재 결론 또는 상태를 담은 callout 1개

목적에 맞는 본문
배운 점과 다음 판단
검증과 남은 문제

[선택] 자세한 작업 기록 toggle
[선택] 명령어·오류·변경 근거 toggle
[선택] 기록 정보 toggle
```

The opening should tell the reader why the work started, what changed in the
understanding or repository, and the current outcome. Do not repeat the same
summary in a callout and the first section.

### Visual language

- Prefer a single column so the page remains readable on desktop and mobile.
- Use no cover image by default. Avoid decorative icons, emoji-heavy headings,
  progress bars, badges, and colored boxes around every section.
- Use at most one gray, blue, or green callout near the top when it adds a clear
  current decision, outcome, or caution. Reserve red for an actual hard failure.
- Add a table of contents only when the page has at least six useful top-level
  sections and is long enough to require navigation.
- Use dividers to separate major reading phases, not after every heading.
- Use a table only for genuinely comparable options or repeated evidence. Keep
  it to two to five short columns; move prose out of cells.
- Avoid columns for the main narrative. They wrap poorly on mobile and make a
  chronological record harder to follow.
- Before emitting advanced Notion blocks, read the current connector syntax.
  Confirm after publication that callouts and toggles rendered natively.

## Select a narrative spine

The headings below are prompts, not mandatory form fields. Keep only those that
help tell the observed story, rename them to fit the subject, and allow important
sections to be longer than routine ones. Do not write `해당 없음` merely to keep
a template symmetrical.

### Implementation

Use for a feature, refactor, documentation rewrite, or focused repository
change.

Possible flow:

1. `왜 이 작업을 시작했나` — the user problem, expected behavior, and scope.
2. `기존 구조에서 확인한 것` — constraints or conventions that changed the
   implementation plan.
3. `구현 과정과 판단` — meaningful choices, course corrections, and why the
   final shape fits the existing system.
4. `달라진 결과` — behavior or artifacts that are now different.
5. Common learning and validation sections.

Do not turn `달라진 결과` into a file inventory. Mention a file only where its
responsibility makes the decision easier to understand.

### Troubleshooting

Use when the durable value is how an unexpected behavior was understood and
resolved.

Possible flow:

1. `문제가 어떻게 드러났나` — symptom, impact, and reproduction context.
2. `원인을 좁힌 과정` — the investigation in observed order.
3. `확인된 원인` — confirmed cause, or the exact boundary that remains
   unconfirmed.
4. `해결과 재검증` — applied correction and what happened afterward.
5. Common learning, prevention, and remaining-risk sections.

Write investigation as short hypothesis loops when useful:

```text
관찰한 단서 → 세운 가설 → 확인한 방법 → 나온 결과 → 다음 판단
```

Preserve failed attempts when they explain the eventual diagnosis. Do not make
the author look prescient by erasing a reasonable false start.

### Decision

Use when the page should preserve why one approach was chosen.

Possible flow:

1. `결정이 필요했던 이유` — context and the cost of leaving it undecided.
2. `판단 기준` — the few drivers that actually affected the choice.
3. `검토한 선택지` — only alternatives that were genuinely considered.
4. `선택과 감수한 것` — decision, rationale, tradeoffs, and consequences.
5. `다시 검토할 조건` — a trigger that would invalidate the current choice.
6. Common learning and validation sections.

When the options share dimensions, a compact table may use
`선택지 | 유리한 점 | 부담 | 판단`. Follow it with prose explaining the real
decision; the table is not the conclusion.

### Research and learning

Use when the main result is a changed mental model, a comparison, or a reusable
explanation.

Possible flow:

1. `처음 가졌던 질문` — why the question mattered now.
2. `확인 전의 이해` — the prior expectation, clearly labeled as such.
3. `무엇을 확인했나` — relevant source, repository evidence, or experiment.
4. `이해가 어떻게 달라졌나` — findings explained in connected prose.
5. `프로젝트에 적용하면` — concrete implications, without pretending they
   have already been implemented.
6. Common learning and open-question sections.

Do not dump source summaries. Connect each source or observation to the question
it helped answer.

### Operations and configuration

Use for Git hooks, CI, local setup, deployment, observability, compatibility, or
other operational changes.

Possible flow:

1. `바꾸려던 것과 위험` — goal, affected environments, and failure impact.
2. `기존 설정에서 확인한 제약` — current behavior and platform boundaries.
3. `적용한 변경과 선택 이유` — compatibility and maintenance tradeoffs.
4. `복구하거나 되돌리는 방법` — only when rollback is meaningful.
5. `환경별 확인 결과` — actual checks, with untested environments visible.
6. Common learning and remaining-risk sections.

## Write the reasoning trail, not hidden reasoning

Capture the observable trail that another developer can audit:

- what was expected;
- what was observed in the conversation, repository, or tool output;
- which plausible explanation or option was considered;
- what evidence changed the direction;
- what was chosen and which tradeoff remains.

Do not claim private chain-of-thought, fabricate deliberation, or list every
possible alternative. A natural paragraph often works better than labeled
micro-fields:

```text
처음에는 Issue Form 파일이 누락된 것으로 보였다. 실제 파일을 확인해 보니
템플릿은 존재했고, GitHub가 두 글자인 이름을 유효하지 않은 설정으로 처리하고
있었다. 새 템플릿을 추가하는 대신 기존 이름을 명확하게 늘린 이유가 여기에 있다.
```

## Make learning concrete

For a material record, include `배운 점과 다음 판단` when the evidence shows a
new fact, a changed mental model, a reusable diagnostic rule, or a prevention
step. Build the paragraph from:

```text
처음 예상 → 실제 관찰 → 달라진 이해 → 다음 적용 방법
```

Do not write generic lessons such as “협업의 중요성을 배웠다.” If the work was
routine and produced no defensible learning, omit the section instead of
inventing one. Keep an unresolved question visible when it is more honest than a
lesson.

## Keep evidence available without crowding the story

Create only non-empty toggles that materially help later investigation.

### 자세한 작업 기록

- Preserve meaningful events in observed order without invented times.
- Include changes of direction and failed attempts, not every conversational
  exchange.
- A long troubleshooting loop may live here when the main section already
  explains its conclusion.

### 명령어·오류·변경 근거

- Put literal commands, concise error excerpts, relevant paths, diff summaries,
  and source links here.
- Use code blocks for commands and errors. Do not paste large raw logs when a
  short excerpt and result preserve the evidence.
- Record only checks that ran and mark failures or unrun checks honestly.

### 기록 정보

Keep administrative metadata at the bottom so the first viewport stays about
the work:

- 기록 목적: `구현`, `트러블슈팅`, `결정`, `조사·학습`, or `운영·설정`
- 게시 모드: `요청 기록` or `Push 기록`
- Commit: every covered full hash once, or `없음 (현재 대화/미커밋 작업)`
- 관련 Issue / PR / 자료: actual links only
- 사용한 Agent / Skill: actual use only
- AI 검토, 자동 검증, 사람 검토: distinguish them only when material and only
  claim human review that actually occurred

Do not create an empty troubleshooting, decision, portfolio, or raw-log child
page. Do not evaluate routine work as a portfolio candidate unless the user asks
for that assessment.

## Natural Korean writing

- Prefer connected paragraphs of roughly two to five sentences for context,
  investigation, and conclusions. Use bullets for parallel facts, options, or
  checks rather than turning every sentence into a bullet.
- Use concrete subjects and verbs: `이름을 늘렸다`, `hook이 push를 막았다`,
  `검사하지 못했다`.
- Preserve uncertainty with `추정했다`, `확인되지 않았다`, or `이 범위에서는`
  instead of smoothing it into certainty.
- Avoid generic praise and stock phrases such as `효율적으로`, `체계적으로`,
  `성공적으로`, `품질을 향상했다`, and `최적의 해결책` unless evidence gives
  them a precise meaning.
- Do not end every section with a miniature conclusion. Vary paragraph length
  naturally and let the important part receive more space.
- Keep AI/tool metadata out of the main narrative unless it materially changed
  the result. Never imply that AI self-review or automated checks were human
  approval.

## Read-back checklist

- The title is searchable and names the real problem, decision, or learning.
- The first viewport contains a useful opening and, if needed, one restrained
  status callout rather than decorative blocks.
- The selected purpose matches the whole work unit, not just the latest message.
- The main narrative explains at least one meaningful evidence-to-judgment link
  when such a link occurred.
- There are no empty mandatory headings, repeated summaries, or invented
  lessons and alternatives.
- Actual changes, failed attempts, validation state, evidence gaps, and remaining
  risk are distinguishable.
- Every toggle has useful content and renders as a native block.
- No child page exists unless it met the exception in `SKILL.md`.
- Guarded records contain every covered full commit hash exactly once; on-demand
  records do not imply push synchronization.
- Secrets, personal data, raw user data, and private operations data are absent.

## Pattern references

These sources inform the structure; do not cite them in every work record unless
they were evidence for that record's subject.

- [OpenAI Notion knowledge capture](https://github.com/openai/skills/tree/main/skills/.curated/notion-knowledge-capture): classify the capture purpose before choosing a template.
- [MADR](https://github.com/adr/madr/blob/develop/template/adr-template.md): preserve decision drivers, considered options, consequences, and revisit context only for real decisions.
- [Systematic debugging](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md): retain evidence-driven hypothesis and verification loops.
- [Simon Willison's TIL](https://github.com/simonw/til) and [postmortem examples](https://github.com/danluu/post-mortems): explain discoveries and failed paths in a human narrative rather than reducing them to a release summary.
