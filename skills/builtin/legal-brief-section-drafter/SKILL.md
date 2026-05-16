---
name: legal-brief-section-drafter
description: Draft one section of a brief — argument, statement of facts, or procedural posture — anchored to verified authorities.
owner_agent: legal-drafter
tier: DRAFT
tools: [drafts.create, drafts.update, firm.matter_read]
inputs: [section_type, brief_outline, authorities[], facts_ref, voice, matter_id]
outputs: brief_section_draft
inherits: ../../GUARDRAILS.md
---

# When to use

After case-research has returned verified authorities and the lawyer
has approved the outline. Adapted from
[`claude-for-legal/litigation-legal:brief-section-drafter`](https://github.com/anthropics/claude-for-legal/blob/main/litigation-legal).

# How

1. Refuse if trainee mode (no `bar_admissions` on the seat).
2. Use only the authorities handed in by case-research; never add a
   new case mid-draft. New authority means another research round.
3. Use the matter's `case_theory` and the brief outline as scaffolding.
4. Apply firm voice from `PRACTICE_PROFILE.md`.
5. Stamp the jurisdiction badge and a `for-filing-review` label —
   the filing tool (SEND tier) is gated separately.

# Output shape

```json
{
  "section_type": "argument|facts|procedural_posture|introduction|conclusion",
  "matter_id": "uuid",
  "draft_body": "string with [[cite:n]] placeholders",
  "citations": [ /* case-research.authorities */ ],
  "label": "for-filing-review",
  "open_questions_for_lawyer": ["string"]
}
```

# Refusals

- Never produce a final-filing-ready section. Always `for-filing-review`.
- Never sign or file. SEND tier.
- Never overstate authority — "the court held X" is allowed only if
  the verifier confirmed X is at the anchor.
