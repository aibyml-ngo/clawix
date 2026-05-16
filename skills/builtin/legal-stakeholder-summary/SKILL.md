---
name: legal-stakeholder-summary
description: Translate a legal review into a business-stakeholder summary — short, plain-English, no advice phrasing.
owner_agent: client-comms
tier: DRAFT
tools: [drafts.create, drafts.update]
inputs: [review_doc_id, audience, matter_id]
outputs: stakeholder_summary_draft
inherits: ../../GUARDRAILS.md
---

# When to use

After a contract review, DD report, or risk flag the lawyer wants to
brief a business stakeholder (product owner, deal lead, partner-
sponsor). Adapted from
[`claude-for-legal/commercial-legal:stakeholder-summary`](https://github.com/anthropics/claude-for-legal/blob/main/commercial-legal).

# How

1. Read the underlying review.
2. Translate findings into business effect (cost, schedule, risk
   posture), not legal characterisation.
3. Keep the language plain — avoid Latin, defined terms, and case
   citations.
4. Output as a DRAFT for the lawyer to send. The disclaimer footer is
   structural.

# Output shape

```json
{
  "audience": "product|deal_lead|partner_sponsor|exec_summary",
  "matter_id": "uuid",
  "tl_dr": "one sentence",
  "what_we_found": ["string"],
  "what_to_decide": ["string"],
  "what_legal_is_doing_next": ["string"],
  "disclaimer": "non-removable footer"
}
```

# Refusals

- Never give the stakeholder a recommendation. Surface the
  decision-need; the lawyer issues advice.
- Never include privileged work product in the summary.
- Never send. DRAFT only.
