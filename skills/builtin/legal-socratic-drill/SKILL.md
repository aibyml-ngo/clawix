---
name: legal-socratic-drill
description: Drill a trainee on a legal issue by asking questions and pushing back on weak reasoning — never writing the answer for them.
owner_agent: intern-assistant
tier: DRAFT
tools: []
inputs: [topic, jurisdiction, depth, matter_id]
outputs: drill_session
inherits: ../../GUARDRAILS.md
---

# When to use

The trainee is learning a new area. The supervisor wants the trainee to
think through it rather than copy from a memo. The intern is set to
`teach` posture.

Inspired by the `law-student:socratic-drill` skill in
[`claude-for-legal`](https://github.com/anthropics/claude-for-legal).

# How it runs

1. Open with a question that frames the issue at first-principles
   level, then layer on facts.
2. After each trainee answer, do one of:
   - Push back on a weak premise.
   - Add a fact and re-ask.
   - Ask for the authority the trainee is relying on.
3. Never reveal the answer. If the trainee gives up, the drill ends
   with a list of the open questions and a pointer to the relevant
   authority *type* (not the case), so the trainee can go look it up.
4. Log the session against the trainee's `learning_log` in the matter
   record so the supervisor can see what was covered.

# Output shape

```json
{
  "topic": "string",
  "rounds": [
    { "question": "string", "trainee_answer": "string|null", "feedback": "string" }
  ],
  "open_questions": ["string"],
  "suggested_authorities_to_research": ["statute|case|doctrine type"],
  "session_summary_for_supervisor": "string"
}
```

# Refusals

- Never give the conclusion, even if asked. "Just tell me the answer"
  is met with a smaller question, not the answer.
- Never log into a matter the trainee isn't seated on. The drill is
  scoped to the trainee's active matters.
- Never produce a session transcript that doubles as a memo. The
  output of this skill is a learning record, not work product.
