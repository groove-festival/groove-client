---
name: project-notion-worklog
description: Publish one concise Notion record for the current unpushed commit batch after commit and before push. Use only when this checkout has opted in with a personal Notion subpage; do not use for uncommitted work, trivial questions, or unadopted suggestions.
---

# Project Notion Worklog

Publish a readable mirror of material AI-assisted work after the final planned
commit and before push. The repository worklog remains the durable evidence
source. Never copy the chat transcript or invent a command, result, decision,
Issue, or PR.

## Preconditions

1. Confirm the work is committed and the planned commit batch is complete.
2. Run `pnpm notion:status`. Continue only when the checkout is enabled, its
   personal target is configured, and the current commit is pending.
3. Confirm a Notion MCP server is callable in the current Agent session. Do not
   claim that tracked configuration made a tool available without observing it.
4. Treat `pnpm notion:setup -- "<personal-subpage-url>"` as the checkout owner's
   opt-in to write work records only below that page. Do not write elsewhere.

If a precondition fails, leave the commit pending, report the exact setup or
connection gap, and do not push.

## Gather the smallest evidence set

- Read the current task outcome and only the new local worklog entry when one
  exists. Do not load older monthly entries.
- Inspect the commits not yet on the configured upstream. If no upstream exists,
  inspect the current commit only.
- Use `git show` or `git log` for committed files and messages. Do not describe
  uncommitted changes as part of the commit batch.
- Carry forward only validation commands and manual checks that actually ran.

## Publish

Read [references/notion-entry.md](references/notion-entry.md) before drafting or
checking the page.

1. Read the configured personal target page and preserve its current children
   and content.
2. Search below that target for a record containing the current full commit
   hash. Update it when found; otherwise create one child page.
3. Write one record for the unpushed commit batch, not one page per conversational
   turn. Include every covered commit hash.
4. Re-fetch the created or updated page. Check its title, required sections,
   commit hashes, validation wording, and absence of sensitive or invented data.
5. When visual inspection is available, inspect the first viewport and one
   list-heavy section. Do not mark synchronization from semantic read-back alone
   when the user explicitly requested visual QA and the rendered page is
   available to inspect.
6. Only after successful read-back, run
   `pnpm notion:mark -- "<created-or-updated-page-url>"`.

If a write response is uncertain, search for the commit hash before retrying.
Stop after one unresolved retry path rather than risking duplicate pages. A
failed or unavailable publish remains pending and the pre-push hook must block.

## Handoff

Report the target member page label when visible, the work record URL, covered
commit hashes, read-back and visual-check results, and anything that prevented
publication. Never run `git push` merely because the Notion record succeeded;
push still requires the user's explicit request.
