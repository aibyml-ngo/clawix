---
name: legal-hold
description: Issue, refresh, release, or report on a legal hold for a matter.
owner_agent: legal-drafter
tier: DRAFT
tools: [drafts.create, drafts.update, firm.matter_read]
inputs: [action, matter_id, custodians, scope, trigger_event]
outputs: hold_record
inherits: ../../GUARDRAILS.md
---

# When to use

Reasonable anticipation of litigation, regulator investigation, or
production demand. Adapted from
[`claude-for-legal/litigation-legal:legal-hold`](https://github.com/anthropics/claude-for-legal/blob/main/litigation-legal).

# Actions

- `issue` — draft the initial hold notice to custodians.
- `refresh` — re-issue the hold after the firm refresh cadence.
- `release` — draft the release notice when the matter resolves.
- `report` — produce a status report across custodians.

# How

1. Validate the trigger event is recorded against the matter.
2. Draft the hold notice from the firm template, populated with
   matter-specific scope (date range, document categories, systems).
3. Output as a DRAFT for the lawyer to send — the skill does not
   send. SEND-tier email is gated separately.
4. Record the hold in the matter's `holds[]` ledger with timestamps
   and acknowledgements expected.
5. For `report`, return acknowledgement status per custodian and
   flag missing acknowledgements over the firm escalation window.

# Output shape

```json
{
  "action": "issue|refresh|release|report",
  "matter_id": "uuid",
  "notice_draft_id": "string|null",
  "custodians": [
    { "id": "string", "ack_status": "pending|ack|missed", "last_notified": "YYYY-MM-DD" }
  ],
  "next_review_due": "YYYY-MM-DD"
}
```

# Refusals

- Never send the notice; only draft.
- Never broaden the scope at refresh without an explicit lawyer
  approval logged.
- Never release a hold if any custodian acknowledgement is still
  outstanding for the matter.
