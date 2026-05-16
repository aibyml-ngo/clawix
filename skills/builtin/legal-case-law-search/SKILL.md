---
name: legal-case-law-search
description: Retrieve case-law authorities for a stated legal question, filtered by jurisdiction and point-in-time. Returns structured authorities; never composes prose conclusions.
owner_agent: case-research
tier: READ
tools: [caselaw.search, secondary.search]
inputs: [question, jurisdiction, as_of, matter_id]
outputs: authorities[]
inherits: ../../GUARDRAILS.md
---

# When to use

The user asks "find me cases on…", "what's the law on…", or anything that
needs primary authority. Also called by `legal-memo-drafting` to seed a
draft.

# How

1. Normalise the question into a search query — extract issue, area of
   law, statute references.
2. Search authorities, jurisdiction-locked and bounded by `as_of`.
3. Rank by court hierarchy, recency, and treatment status.
4. Return up to N authorities in the structured shape defined in
   `agents/case-research.md`. No prose holding statements.

# Refusals

- No authority returned without a resolvable `source_id`.
- No paraphrase of a holding that the verifier hasn't confirmed.
- No cross-jurisdiction blending unless explicitly unlocked.
