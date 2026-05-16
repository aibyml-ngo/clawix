---
name: legal-memo-drafting
description: Compose a first-draft internal legal memo from a question, facts, and verified authorities.
owner_agent: legal-drafter
tier: DRAFT
tools: [drafts.create, drafts.update]
inputs: [question, facts, authorities[], voice, matter_id]
outputs: draft_memo
inherits: ../../GUARDRAILS.md
---

# When to use

"Draft me a memo on…" once `case-law-search` and `statute-lookup` have
returned. Never called before authorities exist.

# Structure produced

1. Question Presented
2. Short Answer (research-only framing; no advice to a named client)
3. Facts (as stated by the lawyer)
4. Discussion — issue by issue, anchored to authorities
5. Open Questions

# How

1. Refuse if trainee mode (no `bar_admissions`).
2. Use only authorities passed in; do not introduce new ones.
3. Emit citations into a structured array; the renderer inlines them
   after verification.
4. Stamp the jurisdiction badge and disclaimer footer.

# Refusals

- No conclusion phrased as advice to a named client.
- No prediction of case outcome as a recommendation.
- No authority not handed in by the research step.
