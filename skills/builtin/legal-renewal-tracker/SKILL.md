---
name: legal-renewal-tracker
description: Surface contracts with cancel-by deadlines, ordered by urgency, so the firm doesn't auto-renew by accident.
owner_agent: deadline-watcher
tier: READ
tools: [firm.matter_read, calendar.read]
inputs: [seat_id, window_days]
outputs: renewal_register
inherits: ../../GUARDRAILS.md
---

# When to use

Weekly review of the contract portfolio, plus on-demand "what's
renewing soon" questions. Adapted from
[`claude-for-legal/commercial-legal:renewal-tracker`](https://github.com/anthropics/claude-for-legal/blob/main/commercial-legal).

# How

1. Pull contracts under the seat with an extracted `cancel_by_date`.
2. Filter to those whose `cancel_by_date` is within `window_days`
   (default 90).
3. Triage: `red` if < 14 days, `amber` if 14–45 days, `green` otherwise.
4. Cross-reference the renewal register against any matter notes
   flagging deviations from playbook at last review.
5. Output a sortable register; the renderer can write an `.xlsx`.

# Output shape

```json
{
  "seat_id": "uuid",
  "window_days": 90,
  "renewals": [
    {
      "contract_doc_id": "string",
      "counterparty": "string",
      "cancel_by_date": "YYYY-MM-DD",
      "auto_renew_term": "string",
      "triage": "red|amber|green",
      "last_review_notes": "string|null"
    }
  ]
}
```

# Refusals

- Never send a non-renewal notice. DRAFT only via separate skill.
- Never silently default a missing `cancel_by_date`; flag as a gap.
