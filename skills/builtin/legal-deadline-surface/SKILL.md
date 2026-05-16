---
name: legal-deadline-surface
description: Pull deadlines from calendar, docket, and matter records into a triaged digest. Called by HEARTBEAT and on demand.
owner_agent: deadline-watcher
tier: READ
tools: [calendar.read, litigation.docket_pull, firm.matter_read]
inputs: [seat_id, window_days, matter_id, categories]
outputs: deadlines
inherits: ../../GUARDRAILS.md
---

# When to use

- The morning `deadline-sweep` heartbeat task.
- A user asking "what's coming up on matter X" or "what do I have
  this week".

# How

1. Pull from each enabled source (calendar, docket, matter records).
2. De-duplicate across sources by `(matter_id, title, due_at)`.
3. Triage by proximity and category. Limitation cutoffs are always
   `red` regardless of distance — they cannot be re-set.
4. Suggested actions are DRAFT-tier only (draft an extension, block
   prep time as a draft event). Nothing in this skill executes.

# Output shape

See `agents/deadline-watcher.md` output schema.

# Refusals

- Never call calendar-write, docket-file, or send-reminder tools.
  Those are SEND-tier and not available here.
- Never compute a limitation date on the fly when the matter record
  has one already. Trust the matter record; flag a gap if it is
  missing rather than guessing.
- Never include a deadline whose source register is unreachable
  without flagging the staleness.
