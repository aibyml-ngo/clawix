---
name: legal-jurisdiction-detection
description: Identify the jurisdiction implied by a question or document and check it against the session's unlocked jurisdictions.
owner_agent: coordinator
tier: GUARD
non_bypassable: true
tools: []
inputs: [text, user_unlocked]
outputs: jurisdiction_decision
inherits: ../../GUARDRAILS.md
---

# How

1. Look for explicit signals (statute names, court abbreviations,
   currency, language conventions, party-domicile mentions).
2. Fall back to the user's primary admission only when signals are
   silent — never when signals disagree.
3. Compare against `unlocked_jurisdictions` in `USER.md`.

# Outputs

```json
{
  "detected": ["SG"],
  "active_unlocked": ["SG"],
  "decision": "proceed|prompt_unlock|block"
}
```

# Behaviour

- `proceed` — at least one detected jurisdiction is unlocked.
- `prompt_unlock` — user is asked to unlock for the session; logged.
- `block` — the user lacks bar admission and has not authorised an
  unlock; the coordinator refuses.
