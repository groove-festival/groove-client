---
name: project-notion-worklog
description: Publish a structured Notion record bundle from actual AI conversation, code changes, errors, attempts, decisions, and validation when the user explicitly requests documentation or after commit before push. Use only with the checkout owner's configured personal subpage; on-demand records never satisfy the push guard.
---

# Project Notion Worklog

Publish a readable record below the checkout owner's configured personal page.
Never copy the chat transcript or invent a command, result, decision, Issue, or
PR. Use one of two modes and keep their state separate.

## Choose the mode

### On-demand note

Use this mode when the user explicitly asks to document, summarize, or organize
the current work, concept questions, troubleshooting, decisions, or project
discussion in Notion. It may run before commit, without a planned push, or for a
discussion that did not change repository files. The request authorizes one
record bundle below the configured personal target only.

An on-demand note does not require a pending commit. It must not run
`pnpm notion:mark`, claim commit synchronization, or unblock `pre-push`.

### Guarded push record

Use this mode after the final planned commit and before an authorized push.
Publish one record for the complete unpushed commit batch. The repository
worklog remains the durable evidence source, and successful verified publication
is required before marking the current commit synchronized.

## Shared preconditions

1. Run `pnpm notion:status`. Confirm the checkout is enabled and its personal
   target is configured. For an on-demand note, ignore commit pending and synced
   fields; for a guarded push record, require the current commit to be pending.
2. Confirm a Notion MCP server is callable in the current Agent session. Do not
   claim that tracked configuration made a tool available without observing it.
3. Treat `pnpm notion:setup -- "<personal-subpage-url>"` as the checkout owner's
   opt-in to write work records only below that page. Do not write elsewhere.

For a guarded push record, first confirm the work is committed and the planned
batch is complete. If a precondition fails, report the exact setup or connection
gap. Leave any pending commit unchanged and do not push.

## Gather the smallest evidence set

- Use the accessible conversation for the current work as narrative evidence,
  then cross-check it against relevant code diffs, changed files, command output,
  and observed errors. Summarize the exchange; do not copy the transcript.
- Read only the new local worklog entry when one exists. Do not load older
  monthly entries. Add a local worklog entry first only when the record meets
  `project-ai-worklog`'s material-impact criteria.
- For an on-demand note, inspect the current discussion and only the repository
  evidence relevant to it. A concept-only record does not require a working-tree
  change. Label uncommitted content as current work, not as a commit result.
- For a guarded push record, inspect commits not yet on the configured upstream.
  If no upstream exists, inspect the current commit only. Use `git show` or
  `git log`; do not describe uncommitted changes as part of the commit batch.
- Carry forward only validation commands and manual checks that actually ran.
- Preserve the observed order of events without inventing timestamps. If part of
  the conversation or command history is unavailable, state the evidence gap
  instead of reconstructing it.

## Publish

Read [references/notion-entry.md](references/notion-entry.md) before drafting or
checking the page.

1. Read the configured personal target page and preserve its current children
   and content.
2. For a guarded push record, search below that target for the current full
   commit hash. Update its existing record bundle when found; otherwise create
   one parent record page. For an on-demand note, update an existing bundle only
   when its title and subject make it unambiguously the same requested record;
   otherwise create one parent record page.
3. Put the seven-part core summary on the parent page. Create separate child
   pages for `Raw Development Log`, `Decision Log`, `Troubleshooting Log`, and
   `Portfolio Candidate` according to the evidence rules in the reference. Do
   not collapse these records into one long page.
4. A guarded push record covers the complete unpushed commit batch and includes
   every commit hash. An on-demand note explicitly states that no commit is
   covered when none exists.
5. Re-fetch the parent and every created child page. Check titles, required
   sections, commit hashes, validation wording, internal consistency, and the
   absence of sensitive or invented data.
6. When visual inspection is available, inspect the parent first viewport and
   one list-heavy child page. Do not mark synchronization from semantic
   read-back alone when the user explicitly requested visual QA and the rendered
   pages are available to inspect.
7. Only for a guarded push record, and only after successful bundle read-back,
   run
   `pnpm notion:mark -- "<created-or-updated-page-url>"`. Never run it for an
   on-demand note.

If a write response is uncertain, search for the commit hash in guarded mode or
the exact title and subject in on-demand mode before retrying. Stop after one
unresolved retry path rather than risking duplicate pages. A failed guarded
publish remains pending and the pre-push hook must block. A failed on-demand
publish must not change hook state.

## Handoff

Report the selected mode, target member page label when visible, parent record
URL, created or omitted child records with reasons, covered commit hashes or
`없음`, read-back and visual-check results, and anything that prevented
publication. For an on-demand note, state that push synchronization was not
marked. Never run `git push` merely because a Notion record succeeded; push still
requires the user's explicit request.
