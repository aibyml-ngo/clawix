---
name: legal-amendment-history
description: Trace clause-by-clause changes across a base agreement and its amendments and SOWs to produce a single "what's actually in force" view.
owner_agent: contract-analyst
tier: READ
tools: [firm.matter_read, contracts.precedent_search]
inputs: [document_ids, matter_id]
outputs: amendment_trace
inherits: ../../GUARDRAILS.md
---

# When to use

Renewal review, dispute over what was agreed, or any time the
counterparty hands over a base plus six amendments and asks "what's
the indemnity cap actually". Adapted from
[`claude-for-legal/commercial-legal:amendment-history`](https://github.com/anthropics/claude-for-legal/blob/main/commercial-legal).

# How

1. Order documents by effective date.
2. For each amendment, identify the clauses changed and the change
   type (replace / insert / delete).
3. Build a clause-by-clause history: original, version after each
   amendment, current effective text.
4. Anchor every change to the amendment doc_id and page.
5. Output is internal; never a counterparty deliverable.

# Output shape

```json
{
  "matter_id": "uuid",
  "agreement_chain": [
    { "doc_id": "string", "type": "base|amendment|sow", "effective_date": "YYYY-MM-DD" }
  ],
  "clauses": [
    {
      "label": "indemnity-cap",
      "history": [
        { "version": 1, "doc_id": "string", "text": "string" },
        { "version": 2, "doc_id": "string", "change_type": "replace", "text": "string" }
      ],
      "current_effective_text": "string"
    }
  ]
}
```

# Refusals

- Never silently merge conflicting amendments. If two amendments
  modify the same clause and order is ambiguous, surface as a gap.
- Never paraphrase clause text in the history rows; quote verbatim
  with anchor.
