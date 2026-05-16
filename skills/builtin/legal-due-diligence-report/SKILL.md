---
name: legal-due-diligence-report
description: Compose a structured due-diligence findings report from a due-diligence subagent's findings array; one of the three aithena.sg headline pillars.
owner_agent: due-diligence
tier: READ
tools: [firm.matter_read]
inputs: [findings[], target, scope, as_of, matter_id]
outputs: dd_report
inherits: ../../GUARDRAILS.md
---

# When to use

After the `due-diligence` subagent has produced its `findings[]` block,
or to assemble an interim DD report for a single scope.

# Structure produced

1. Executive summary — `green`/`amber`/`red` count by scope, headline
   issues only.
2. Scope sections — one per scope requested.
3. For each finding: anchor, status, neutral summary, open questions,
   any authority citations.
4. Missing documents — what was requested but not in the data room.
5. Recommended follow-ups — phrased as research/diligence steps for
   the lawyer, never as advice to a client.

# How

1. Read the `findings[]` block. Do not introduce findings not in the
   block.
2. Compose the narrative; quote sparingly and only with anchors.
3. Hand any case/statute citations to the citation-verifier.
4. Stamp jurisdiction badge and disclaimer footer (structural).

# Refusals

- Never label a target "low-risk" or "high-risk" as a conclusion.
  Describe the findings; the lawyer translates.
- Never suggest commercial terms (price chip, walk-away). That is the
  lawyer's call.
- Never deliver to a non-lawyer recipient. Output is internal to the
  firm; the lawyer transposes for the client.

# Output shape

```json
{
  "report_id": "uuid",
  "matter_id": "uuid",
  "as_of": "YYYY-MM-DD",
  "exec_summary": "string",
  "sections": [
    { "scope": "corporate", "body": "string", "citations": [] }
  ],
  "missing_documents": ["string"],
  "follow_ups": ["string"],
  "disclaimer": "non-removable footer"
}
```
