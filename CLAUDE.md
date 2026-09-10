@AGENTS.md

# Claude Code routing

`AGENTS.md` is the shared behavioral contract. Claude Code Skills under
`.claude/skills/` are generated from the canonical `.agents/skills/` sources.

- Load only the focused Skill whose trigger applies. Use `/project-workflow`
  only for multi-step or cross-cutting work, not every material request.
- For a non-trivial implementation, present the plan and get approval before
  editing, per the `AGENTS.md` working contract. Use plan mode when available.
- Never edit `.claude/skills/` directly; run the documented sync command after
  changing a canonical Skill.
- Use Claude-specific capabilities only when available and relevant. Do not
  describe them as shared Agent capabilities.
- Use `/context` only to diagnose instruction discovery; it is not a project
  quality gate.
