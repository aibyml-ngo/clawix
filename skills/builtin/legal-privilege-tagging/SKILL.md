---
name: legal-privilege-tagging
description: Tag ingested content with privilege class and matter scope before it enters memory.
owner_agent: coordinator
tier: GUARD
non_bypassable: true
tools: []
inputs: [content, matter_id, source_signals]
outputs: privilege_tag
inherits: ../../GUARDRAILS.md
---

# Classes

- `public` — published authority, gazette, public filings.
- `work_product` — internal notes and drafts; not client communications.
- `privileged` — communications with or for a client, in confidence,
  for the purpose of obtaining legal advice or in contemplation of
  litigation.
- `restricted` — sealed, confidential under court order, regulator-only.

# Rules

- Untagged content cannot be written to memory.
- `privileged` content never enters firm memory and never crosses
  matter boundaries.
- `restricted` content is access-controlled and never enters retrieval
  pools shared across seats.

# Heuristics + human check

The tagger combines signals (source, headers, party metadata, custodian)
with model classification. On low confidence, it routes to a human
reviewer rather than guessing.
