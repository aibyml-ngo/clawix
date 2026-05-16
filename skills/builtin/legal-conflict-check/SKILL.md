---
name: legal-conflict-check
description: Query the firm conflicts database for any positional or party-based conflict before opening or progressing a matter.
owner_agent: coordinator
tier: GUARD
non_bypassable: true
tools: [conflicts.query]
inputs: [parties, matter_type, jurisdictions]
outputs: conflicts_report
inherits: ../../GUARDRAILS.md
---

# When it runs

- On matter open.
- On adding a party to an existing matter.
- Before any client-facing draft is returned.

# How

1. Normalise party names (entity resolution).
2. Query the conflicts DB across current and historical matters.
3. Return hits with relationship type (current client, former client,
   related entity, individual) and the matter(s) involved.

# On hit

The coordinator refuses to return research output on the matter until a
human with the `conflict_resolver` role clears the flag.
