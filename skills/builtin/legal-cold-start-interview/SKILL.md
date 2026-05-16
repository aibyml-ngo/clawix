---
name: legal-cold-start-interview
description: Interview the seat or firm to populate PRACTICE_PROFILE.md — voice, jurisdictions, playbooks, escalation, calibration. Every other skill reads from the profile this skill writes.
owner_agent: coordinator
tier: DRAFT
tools: [drafts.create, drafts.update, firm.matter_read]
inputs: [scope, seat_id, mode]
outputs: practice_profile_draft
inherits: ../../GUARDRAILS.md
---

# Why

The single most common cause of generic, off-house-style output is an
empty practice profile. Skills read from `PRACTICE_PROFILE.md`; if it
is missing the calibration sections, they treat the gaps as `gap` and
prompt the seat — which is annoying. This skill runs once at
onboarding (and again when something material changes), and avoids the
nagging downstream.

Pattern is adapted from the cold-start-interview convention in
[`claude-for-legal`](https://github.com/anthropics/claude-for-legal),
where every plugin has its own cold-start.

# Modes

- `quick` — 2-minute version: 6 questions; just enough to stop the
  skills from running blind.
- `full` — 10–20 minutes: voice, jurisdictions, escalation matrix,
  playbook pointers, calibration thresholds, connector inventory.
- `--new-matter` — opens a matter-specific addendum, e.g. a one-off
  posture for an unusual transaction.

# How

1. Read existing `PRACTICE_PROFILE.md` if present; reuse what is there.
2. Ask only the missing questions, plus any that look stale (older
   than the review cadence).
3. Offer to pull seed material: signed MSAs, a playbook PDF, a recent
   memo. Ingestion goes through pii-redaction and privilege-tagging
   before parsing.
4. Write a draft of the profile; do not save until the seat confirms.
5. Log when the profile was last updated, by whom, and what changed.

# Output shape

```json
{
  "mode": "quick|full|new-matter",
  "draft_profile_path": "PRACTICE_PROFILE.md",
  "fields_updated": ["voice", "escalation", "calibration", "playbooks"],
  "seed_documents_ingested": ["doc_id"],
  "next_step": "seat_review_required"
}
```

# Refusals

- Never persist the profile without seat confirmation.
- Never use seed material from another matter; the profile is firm-
  or seat-scoped, not matter-scoped.
- Never silently fall back to defaults. If a field is empty, say so;
  do not invent the firm's escalation matrix.
