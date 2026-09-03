---
name: project-notion-worklog
description: Publish a purpose-shaped, single-page Notion record from actual development conversation and repository evidence when the user requests documentation or after commit before push. Use only with the checkout owner's configured personal subpage; on-demand records never satisfy the push guard.
---

# Project Notion Worklog

Publish one durable, readable work record below the checkout owner's configured
personal page. Shape the record around why someone would return to it, not around
the commit format or a fixed questionnaire. Never copy the chat transcript or
invent a command, result, decision, Issue, PR, or lesson.

## Separate publication mode from record purpose

Choose the publication mode first. It controls guard state, not the writing
shape.

### On-demand note

Use when the user explicitly asks to document or organize current work,
troubleshooting, a decision, research, or a project discussion in Notion. The
request authorizes one record below the configured personal target only.

An on-demand note may describe uncommitted or concept-only work. It must not run
`pnpm notion:mark`, claim commit synchronization, or unblock `pre-push`.

### Guarded push record

Use after the final planned commit and before an authorized push. Publish one
record for the complete unpushed commit batch. Only a successfully published and
verified record may be marked as synchronized.

## Confirm the destination and evidence

1. Run `pnpm notion:status`. Confirm that the checkout is enabled and its
   personal target is configured. Ignore commit state for an on-demand note; in
   guarded mode require the current commit to be pending.
2. Confirm that a Notion MCP server is callable in the current Agent session.
   Tracked configuration alone is not proof that the tool is available.
3. Treat `pnpm notion:setup -- "<personal-subpage-url>"` as permission to write
   work records only below that page.
4. In guarded mode, confirm that the intended batch is committed and complete.
   Leave a failed or incomplete batch pending and do not push it.

Gather only the evidence needed for the work unit:

- Read the accessible conversation as narrative evidence, including the initial
  expectation, corrections, failed approaches, decisions, and user direction.
- Cross-check claims against relevant diffs, commits, files, command output, and
  observed errors. Do not treat a suggestion as an implemented result.
- In guarded mode, inspect commits not yet on the configured upstream. If there
  is no upstream, inspect the current commit. Do not include uncommitted changes
  in the covered batch.
- Carry forward only checks that actually ran. Keep `통과`, `실패`, `미실행`,
  and `수동 확인 필요` distinct.
- Preserve the observed event order without inventing timestamps. State an
  evidence gap instead of reconstructing missing history.
- Exclude secrets, personal data, raw user data, and private operations data.

A work unit is one coherent problem, decision, investigation, or outcome. It is
not automatically one chat, one commit, or every topic mentioned in a long
conversation.

## Choose the record purpose

Classify from the complete work unit and repository evidence, not from the last
message or a keyword. Choose the purpose that best explains why the reader would
find the page again:

1. **Troubleshooting** when an unexpected behavior was diagnosed through
   evidence, hypotheses, or failed attempts.
2. **Decision** when the durable value is a choice among meaningful options and
   its tradeoffs.
3. **Research and learning** when the work primarily changed understanding or
   compared approaches without implementation being the main result.
4. **Operations and configuration** when environment, tooling, compatibility,
   rollout, recovery, or repository automation is central.
5. **Implementation** as the default for a feature, refactor, or focused code or
   documentation change.

For mixed work, choose one dominant purpose and embed only the useful secondary
material as a subsection or toggle. Do not concatenate several full templates.
Split another page only when it is an independent work unit with its own future
retrieval purpose.

## Draft and publish one page

Read [references/notion-entry.md](references/notion-entry.md) after selecting the
purpose. Use its matching narrative spine and single-page design rules.

1. Read the configured personal target and preserve its content and children.
2. In guarded mode, search below the target for the current full commit hash and
   update an unambiguous existing record; otherwise create one page. In on-demand
   mode, update only when title and subject clearly identify the same requested
   record.
3. Draft one page with a useful title, short opening, purpose-shaped narrative,
   grounded learning, actual validation, and only the detailed evidence worth
   preserving.
4. Keep supporting detail in native toggles on the same page. Do not create
   child pages by default. A child page is allowed only when the user asks for
   it or the content is a separately maintained source of truth with a distinct
   audience or lifecycle.
5. In guarded mode, list every covered full commit hash. In on-demand mode,
   state clearly when no commit is covered.
6. Re-fetch the page and verify its title, narrative coherence, record purpose,
   commit scope, validation wording, rendered toggles, and absence of sensitive
   or invented information.
7. When rendered-page inspection is available and layout matters, inspect the
   first viewport and one detail-heavy section. Semantic read-back is sufficient
   only when visual QA was not requested or is unavailable.
8. Only in guarded mode, after successful read-back, run
   `pnpm notion:mark -- "<created-or-updated-page-url>"`.

If a write response is uncertain, search once for the full commit hash in
guarded mode or the exact subject in on-demand mode before retrying. Stop after
one unresolved retry path rather than risking a duplicate. Never run `git push`
merely because the Notion record succeeded.

## Handoff

Report the publication mode, selected record purpose, target member page label
when visible, record URL, covered commit hashes or `없음`, read-back and visual
check results, and anything that prevented publication. Mention a child page
only when one was exceptionally created and why. For on-demand notes, state that
push synchronization was not marked.
