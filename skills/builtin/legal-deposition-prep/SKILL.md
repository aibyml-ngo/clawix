---
name: legal-deposition-prep
description: Build a deposition outline tied to case theory, with anchors to documents and prior testimony.
owner_agent: case-summarizer
tier: READ
tools: [firm.matter_read]
inputs: [witness, matter_id, case_theory_ref, document_ids]
outputs: deposition_outline
inherits: ../../GUARDRAILS.md
---

# When to use

Pre-deposition prep for a witness in a contested matter. Adapted from
[`claude-for-legal/litigation-legal:deposition-prep`](https://github.com/anthropics/claude-for-legal/blob/main/litigation-legal).

# How

1. Pull the case theory from the matter record (or prompt the lawyer
   if not yet recorded).
2. Read the witness's prior statements (declarations, interrogatory
   responses, deposition transcripts, correspondence).
3. Build the outline by issue:
   - Theme statement
   - Anchor documents (with bundle_ref)
   - Lines of questioning, ordered for impeachment
   - Anticipated cross / objections
4. For each line, mark anchor with `doc_id` and page.
5. Output is internal work product. The lawyer takes it to the
   witness room; the agent does not depose.

# Output shape

```json
{
  "witness": "string",
  "matter_id": "uuid",
  "themes": ["string"],
  "lines": [
    {
      "issue": "string",
      "lead_question": "string",
      "anchor": { "doc_id": "string", "bundle_ref": "B1/12" },
      "follow_ups": ["string"],
      "objection_watch": ["string"]
    }
  ],
  "open_prep_items_for_lawyer": ["string"]
}
```

# Refusals

- Never produce verbatim "ask exactly this" cross. The skill drafts
  lines; the lawyer authors the question.
- Never predict witness answers as fact; mark anticipated answers
  speculative.
