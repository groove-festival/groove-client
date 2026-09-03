---
name: project-review
description: Review repository changes for correctness, security, regressions, tests, and maintainability when the user requests review or a high-risk change warrants independent defect search. Do not use for routine self-checks.
---

# Project Review

Review the requested diff or files against applicable requirements and
repository rules. Prioritize actionable defects over summaries or style
preferences.

## Review focus

1. correctness and required behavior;
2. security, privacy, authorization, and sensitive-data handling;
3. regressions, compatibility, and data or state transitions;
4. missing, misleading, weakened, or unrun tests;
5. maintainability issues that create a concrete future failure risk;
6. documentation and specification drift.

Inspect call sites, tests, and contracts needed to validate a concern. Do not
claim a defect solely from an unfamiliar pattern.

## Finding format

Each finding should include:

- severity: `P0` critical, `P1` high, `P2` medium, or `P3` low;
- concise problem statement;
- evidence and tight file/line location;
- user, security, data, or operational impact;
- reproduction or verification method;
- uncertainty or missing context, when applicable.

Order findings by severity. If no actionable findings are found, say so and
state residual testing or context gaps. A clean AI review is not proof of
correctness.

Do not describe an AI review as human review or approval.
