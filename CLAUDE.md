@AGENTS.md

# Claude Code routing

`AGENTS.md` above is the shared behavioral contract. Claude Code project Skills
are available under `.claude/skills/` and use the same names and record
semantics as the canonical `.agents/skills/` sources.

- Start material work with `/project-workflow` and load focused Skills only
  when their trigger applies.
- Never edit `.claude/skills/` copies directly. Run the documented sync command
  after changing a canonical Skill.
- Use Claude-specific capabilities only when available and relevant. Do not
  describe them as capabilities shared by every Agent.
- Confirm this file is loaded with Claude Code's `/context` command when
  diagnosing instruction discovery. This command is not a project quality
  gate.
