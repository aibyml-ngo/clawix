---
name: legal-chronology-builder
description: Build a chronology of events from a bundle of documents (correspondence, contracts, witness statements, court documents) anchored to source pages.
owner_agent: case-summarizer
tier: READ
tools: [firm.matter_read]
inputs: [document_ids, matter_id, date_range]
outputs: chronology
inherits: ../../GUARDRAILS.md
---

# When to use

Pre-trial bundle work, transactional timeline reconstruction, regulator
response prep, "what happened when" questions in a matter.

# How

1. Extract dated events from each document. Sources of dates: document
   headers, body references, metadata, signature blocks.
2. Resolve relative dates ("the following Tuesday") only when the
   anchor date is unambiguous in the same document; otherwise mark
   `date_uncertain` and surface as a gap.
3. Each entry: `date`, `actor`, `event`, `anchor` (doc_id + page).
4. Conflicting dates across documents are kept as separate entries
   with a `conflict_id`; do not silently pick one.
5. Output is ordered chronologically; ties broken by document
   timestamp, then by `conflict_id`.

# Output shape

```json
{
  "matter_id": "uuid",
  "chronology": [
    {
      "date": "YYYY-MM-DD",
      "date_uncertain": false,
      "actor": "string",
      "event": "neutral statement of what happened",
      "anchor": { "doc_id": "string", "page": 7 },
      "conflict_id": null
    }
  ],
  "gaps": ["string"],
  "conflicts": [
    { "conflict_id": "string", "entries": ["string"] }
  ]
}
```

# Refusals

- Never invent a date because the document is undated. Mark
  `date_uncertain` and list as a gap.
- Never resolve a conflict between sources; that is the lawyer's
  decision.
- No narrative inference ("X must have known by then"). Events only.
