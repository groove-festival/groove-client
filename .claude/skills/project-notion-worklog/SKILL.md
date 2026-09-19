---
name: project-notion-worklog
description: Create and publish a personal development thought record from accessible AI conversation and verified repository evidence when the user asks for a record or reflection, or after commit before push. Use only with the checkout owner's configured Notion subpage; on-demand records never satisfy the push guard.
---

# Project Notion Worklog

Publish one personal development record below the checkout owner's configured
Notion page. Write for the author's future self. Preserve how the question,
judgment, learning, and current understanding changed during the work instead of
presenting a polished success story or a transcript.

Use the accessible AI conversation as narrative evidence and the repository as
verification evidence. Never invent a thought, command, result, decision,
Issue, PR, or lesson. Do not claim private chain-of-thought.

## Separate publication mode from writing shape

Choose the publication mode first. It controls guard state, not whether the
record deserves a reflective narrative.

### On-demand record

Use when the user explicitly asks to record or organize current work, a
question, troubleshooting, a decision, learning, or a project discussion in
Notion. The request authorizes one record below the configured personal target.

An on-demand record may cover uncommitted or concept-only work. It must not run
`pnpm notion:mark`, claim commit synchronization, or unblock `pre-push`.

### Guarded push record

Use after the final planned commit and before an authorized push. Publish one
record for the complete unpushed commit batch. Only a successfully published and
verified record may be marked as synchronized.

## Confirm the destination and evidence

1. Run `pnpm notion:status`. Confirm that the checkout is enabled and its
   personal target is configured. Ignore commit state for an on-demand record;
   guarded mode require the current commit to be pending.
2. Confirm that a Notion MCP server is callable in the current Agent session.
   Tracked configuration alone is not proof that the tool is available.
3. Treat `pnpm notion:setup -- "<personal-subpage-url>"` as permission to write
   work records only below that page.
4. In guarded mode, confirm that the intended batch is committed and complete.
   Leave a failed or incomplete batch pending and do not push it.

Gather only the evidence needed for one coherent work unit:

- Read the accessible conversation, including the initial request, corrections,
  objections, failed approaches, decisions, and user direction.
- Cross-check claims against relevant diffs, commits, files, command output, and
  observed errors. A suggestion is not an implemented result.
- Treat the current accessible session as the default conversation scope. Use
  another session only when it is accessible and the user places it in scope.
- In guarded mode, inspect commits not yet on the configured upstream. If there
  is no upstream, inspect the current commit. Do not include uncommitted changes
  in the covered batch.
- Carry forward only checks that actually ran. Keep `통과`, `실패`, `미실행`,
  and `수동 확인 필요` distinct.
- Preserve the observed event order without inventing timestamps. State an
  evidence gap instead of reconstructing missing history.
- Exclude secrets, personal data, raw user data, and private operations data.

A work unit is one coherent question, decision, investigation, implementation,
or change in understanding. It is not automatically one chat or one commit.

## Choose depth without a score

Use a reflective record when the work contains a question worth remembering,
a change of direction, a failed attempt, a meaningful choice, a newly learned
fact, or a changed mental model. One such thread is enough when it matters to
the author. Do not require a fixed number of qualifying conditions.

Use a compact work record only when the work was routine and the durable value
is limited to what changed and how it was checked. When uncertain, preserve the
smallest honest reasoning thread instead of inflating the work into a lesson.

Use troubleshooting, decision, research, configuration, and implementation as
optional lenses. They are not mandatory templates. Choose the lens that best
reveals how the author's understanding moved.

## Draft and publish one page

Read [references/notion-entry.md](references/notion-entry.md) after selecting the
publication mode and evidence scope. Follow its prose, learning, and visual
rules.

1. Read the configured personal target and preserve its content and children.
2. In guarded mode, search below the target for the current full commit hash and
   update an unambiguous existing record; otherwise create one page. In on-demand
   mode, update only when title and subject clearly identify the same requested
   record.
3. Draft one page around the observed question, movement in judgment, what was
   learned, and the author's current understanding. Prefer connected Korean
   prose over labeled fields and bullet inventories.
4. Keep commands, concise errors, file lists, validation, and administrative
   metadata in non-empty native toggles at the bottom. Do not create child pages
   by default.
5. In guarded mode, list every covered full commit hash. In on-demand mode,
   state clearly when no commit is covered.
6. Re-fetch the page and verify the title, narrative coherence, evidence
   boundaries, commit scope, validation wording, native rendering, and absence
   of sensitive or invented information.
7. When rendered-page inspection is available, inspect the first viewport and
   one detail-heavy toggle. If it is unavailable, report that visual inspection
   was not performed.
8. Only in guarded mode, after successful read-back, run
   `pnpm notion:mark -- "<created-or-updated-page-url>"`.

If a write response is uncertain, search once for the full commit hash in
guarded mode or the exact subject in on-demand mode before retrying. Stop after
one unresolved retry path rather than risking a duplicate. Never run `git push`
merely because the Notion record succeeded.

## Handoff

Report the publication mode, target member page label when visible, record URL,
covered commit hashes or `없음`, read-back result, visual-check result, and any
publication blocker. For an on-demand record, state that push synchronization
was not marked.
