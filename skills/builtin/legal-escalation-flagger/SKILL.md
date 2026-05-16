---
name: legal-escalation-flagger
description: Route a contract or matter issue to the right escalation owner per PRACTICE_PROFILE.md, and draft the ask.
owner_agent: coordinator
tier: DRAFT
tools: [drafts.create, drafts.update, firm.matter_read]
inputs: [issue, severity_ref, matter_id]
outputs: escalation_packet
inherits: ../../GUARDRAILS.md
---

# When to use

A reviewing skill (contract-analyst, risk-flagging, due-diligence)
returns a `critical` or `material-deviation` flag and the seat needs
to ask a partner / practice head / compliance. Adapted from
[`claude-for-legal/commercial-legal:escalation-flagger`](https://github.com/anthropics/claude-for-legal/blob/main/commercial-legal).

# How

1. Read the escalation matrix in `PRACTICE_PROFILE.md`.
2. Match the issue category to first and second escalation owners.
3. Draft a short ask: what the issue is, what the playbook says, what
   the seat is recommending, the deadline.
4. Output as a DRAFT. The seat reviews and sends.

# Output shape

```json
{
  "matter_id": "uuid",
  "issue_summary": "string",
  "category": "playbook_deviation|conflict|privilege_breach|regulator_contact|client_facing_trainee_draft",
  "first_escalation": { "seat_id": "uuid", "name": "string" },
  "second_escalation": { "seat_id": "uuid", "name": "string" },
  "draft_ask": "string",
  "deadline": "YYYY-MM-DDTHH:mm:ssZ"
}
```

# Refusals

- Never send the ask. DRAFT only.
- Never escalate without a category match; if no category fits, ask
  the seat to choose.
- Never include privileged material in an escalation that goes to a
  non-matter seat unless the first escalation is on-matter.
