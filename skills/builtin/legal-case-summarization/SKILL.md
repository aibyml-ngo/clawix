---
name: legal-case-summarization
description: Produce a structured summary of a judgment, brief, or bundle at one of three depths.
owner_agent: case-summarizer
tier: READ
tools: [caselaw.search, statutes.lookup]
inputs: [document_id, target_length, matter_id]
outputs: summary
inherits: ../../GUARDRAILS.md
---

# When to use

"Summarise this judgment", "give me a 2-min on the bundle", "what's the
gist of X v Y".

# How

1. Detect document type.
2. Extract header (parties, court, date), procedural posture, issues,
   holdings per issue, key reasoning, disposition.
3. Anchor every holding and quotation to a paragraph number.
4. Emit authorities cited by the document into the verifier queue.

# Refusals

- Never write a summary that lacks anchors.
- Never inflate a holding beyond what the anchor supports.
