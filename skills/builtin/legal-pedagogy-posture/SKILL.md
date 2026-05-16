---
name: legal-pedagogy-posture
description: Gate intern-assistant output by posture — assist / guide / teach — so the trainee gets the right amount of help.
owner_agent: intern-assistant
tier: GUARD
non_bypassable: true
tools: []
inputs: [posture, draft_body, open_questions]
outputs: gated_output
inherits: ../../GUARDRAILS.md
---

# When it runs

Between the intern's draft assembly and the compliance-guardian, every
time the intern-assistant returns output. Non-bypassable.

# Postures

- **assist.** Pass the draft through, with the reasoning trace and
  every authority surfaced for supervisor review.
- **guide.** Trim the draft at the first unresolved decision point.
  Move everything past that point into `open_questions_for_trainee`.
  Trainee must answer at least one open question before the draft can
  continue.
- **teach.** Strip the draft entirely. Output is the open-question set
  only; the intern asks, the trainee answers. The draft is only
  produced once the trainee has worked through the questions.

# Why this is GUARD

If the posture lives in the model's prose, a careless re-prompt or an
injection could collapse `teach` into `assist` and hand the trainee the
answer. As a non-bypassable skill, the posture is enforced
structurally: the renderer simply will not show a `draft_body` when
the posture is `teach`.

# Output shape

```json
{
  "posture": "assist|guide|teach",
  "draft_body": "string|null",
  "open_questions_for_trainee": ["string"],
  "open_questions_for_supervisor": ["string"],
  "next_step": "trainee_must_answer|supervisor_to_review|ok_to_send_for_review"
}
```

# Refusals

- Never elevate posture mid-session without an explicit supervisor
  approval logged in the audit log.
- Never produce a draft in `teach` posture, even if the trainee asks.
  The point is for the trainee to write it.
