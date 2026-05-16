---
name: legal-bundle-indexer
description: Index a litigation or transaction bundle so every document has a stable handle, a privilege tag, and a cross-reference back to where it is cited.
owner_agent: case-summarizer
tier: READ
tools: [firm.matter_read, pii.detect]
inputs: [document_ids, matter_id]
outputs: bundle_index
inherits: ../../GUARDRAILS.md
---

# When to use

On data-room ingest, on litigation-bundle assembly, before any
chronology, summary, or DD pass that operates across documents.

# How

1. Run `pii-redaction` and `privilege-tagging` on each document first.
2. Assign each document a stable `bundle_ref` (e.g. `B1/12` for
   bundle 1, page 12).
3. Build a cross-reference map: for each document, list documents it
   references (by quoted text, attached letters, schedules).
4. Detect duplicates (hash + near-duplicate by content) and mark.
5. Emit the index; downstream skills resolve `bundle_ref` rather
   than file paths.

# Output shape

```json
{
  "matter_id": "uuid",
  "documents": [
    {
      "doc_id": "string",
      "bundle_ref": "B1/12",
      "title": "string",
      "date": "YYYY-MM-DD|unknown",
      "privilege_class": "public|work_product|privileged|restricted",
      "pii_redacted": true,
      "duplicates": ["doc_id"],
      "references": ["doc_id"]
    }
  ]
}
```

# Refusals

- Never include an un-redacted, un-tagged document in the index.
- Never silently merge near-duplicates; mark and let the lawyer
  collapse.
