---
name: legal-citation-verification
description: Confirm that every citation in a candidate output exists, is well-formed, anchors correctly, and the proposition matches the source.
owner_agent: citation-verifier
tier: GUARD
non_bypassable: true
tools: [caselaw.search, statutes.lookup]
inputs: citations[]
outputs: verification_results
inherits: ../../GUARDRAILS.md
---

# When it runs

On every output that contains an `authorities[]` or `citations[]` block,
before the coordinator returns to the user. Non-bypassable.

# Five checks per citation

1. Existence — does `source_id` resolve?
2. Citation form — canonical for the jurisdiction style?
3. Anchor — does the paragraph or section exist?
4. Proposition — does the synopsis/quote match the source at the anchor?
5. Validity — treatment status as of `as_of`.

# On failure

The failing citation and any text that depended on it are removed from
the draft. The user is told what was removed and why. No silent
substitution.
