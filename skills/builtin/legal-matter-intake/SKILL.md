---
name: legal-matter-intake
description: Open a new matter — capture parties, scope, jurisdictions, conflict signals, and write the matter.md record that downstream skills read from.
owner_agent: coordinator
tier: DRAFT
tools: [conflicts.query, firm.matter_read, drafts.create, drafts.update, pii.detect]
inputs: [intake_form, seat_id]
outputs: matter_record
inherits: ../../GUARDRAILS.md
---

# When to use

Any new instruction. Adapted from
[`claude-for-legal/litigation-legal:matter-intake`](https://github.com/anthropics/claude-for-legal/blob/main/litigation-legal).

# How

1. Parse the intake form: client, parties, opposing parties, subject,
   forum, anticipated jurisdictions, fees arrangement.
2. Run `conflict-check` skill against the parties. If a hit, the
   coordinator refuses to progress until the conflicts officer
   clears.
3. Run `jurisdiction-detection` against the subject; if jurisdictions
   are outside `unlocked_jurisdictions`, prompt the seat to unlock or
   reject.
4. Write a `matter.md` containing:
   - Header (client, parties, matter type, partner, associates)
   - Scope of instruction (one paragraph; the lawyer confirms)
   - Active jurisdictions
   - Engagement terms reference
   - Retention class and review cadence
   - Privilege class default
5. Initialise the matter memory partition.

# Output shape

```json
{
  "matter_id": "uuid",
  "matter_md_path": "matters/<id>/matter.md",
  "conflicts_result": "clear|flagged",
  "jurisdictions_unlocked": ["SG"],
  "next_step": "ready_for_work|awaiting_conflict_clearance"
}
```

# Refusals

- Never open a matter without a conflict-check pass.
- Never default the engagement terms; require an explicit reference.
- Never open a matter with PII visible in the intake form; redact
  before persisting.
