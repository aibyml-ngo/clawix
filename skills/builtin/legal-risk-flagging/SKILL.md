---
name: legal-risk-flagging
description: Score contract-clause deviations and DD findings against a severity ladder so the report surfaces the issues a lawyer actually needs to see first.
owner_agent: contract-analyst
tier: READ
tools: [firm.matter_read]
inputs: [items, playbook_id, matter_id]
outputs: scored_items
inherits: ../../GUARDRAILS.md
---

# When to use

Called by `contract-clause-analysis` and `due-diligence-report` to add a
severity score to each deviation or finding before the report is composed.

# Severity ladder

- `critical` — affects enforceability, allocation of fundamental risk
  (indemnity caps, IP ownership, governing law, jurisdiction), or
  triggers regulatory exposure.
- `material` — economic effect on the deal, but negotiable.
- `housekeeping` — drafting, definitions, references; should be fixed
  but does not move the deal.
- `informational` — noted, no action required.

# How

1. Score against the firm playbook position and any authority handed
   in. If neither applies, score as `informational` and surface as a
   gap for human judgement.
2. Cite the playbook position or authority that drove the score.
3. Do not score on commercial preference unaccompanied by a playbook
   reference — that is the lawyer's call.

# Output shape

```json
{
  "scored_items": [
    {
      "item_id": "string",
      "severity": "critical|material|housekeeping|informational",
      "basis": "playbook|authority|gap",
      "basis_ref": "string"
    }
  ]
}
```

# Refusals

- No "would not fly in court" or "is unenforceable" language. State the
  authority or playbook position; the lawyer judges.
- No severity bumping without a written `basis`. A score without a
  basis is rejected by the renderer.
