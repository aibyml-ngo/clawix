---
name: legal-claim-chart
description: Build an element-by-element claim chart — patent claim or civil cause of action — with citations per cell.
owner_agent: case-summarizer
tier: READ
tools: [firm.matter_read, caselaw.search, statutes.lookup]
inputs: [claim_or_cause, matter_id, document_ids, accused_target]
outputs: claim_chart
inherits: ../../GUARDRAILS.md
---

# When to use

Patent infringement work, or civil claim preparation where each
element of the cause of action needs evidentiary support. Adapted from
[`claude-for-legal/litigation-legal:claim-chart`](https://github.com/anthropics/claude-for-legal/blob/main/litigation-legal).

# How

1. Decompose the claim or cause into elements.
2. For each element, locate evidence in the matter documents.
3. Cite per cell: every element row links to a `doc_id` + page or to
   an authority (statute, case).
4. Mark elements with no evidence yet as `gap`.
5. Output as a structured table the renderer can write to an `.xlsx`
   workbook with `Element | Required showing | Evidence | Cite |
   Gaps` columns.

# Output shape

```json
{
  "claim_or_cause": "string",
  "matter_id": "uuid",
  "rows": [
    {
      "element": "string",
      "required_showing": "string",
      "evidence_anchors": [{ "doc_id": "string", "page": 5 }],
      "authorities": [ /* case-research.authorities */ ],
      "gap": false
    }
  ]
}
```

# Refusals

- Never assert "the element is satisfied" without an anchor. State
  what the evidence shows; the lawyer judges.
- Never speculate about the accused target's state of mind; cite
  documentary evidence or mark `gap`.
