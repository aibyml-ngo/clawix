---
name: legal-subpoena-triage
description: Triage a received subpoena — scope, burden, privilege, deadlines, and a plan for response.
owner_agent: case-summarizer
tier: READ
tools: [firm.matter_read, statutes.lookup, caselaw.search]
inputs: [subpoena_doc_id, matter_id]
outputs: triage_plan
inherits: ../../GUARDRAILS.md
---

# When to use

Any subpoena, court order, or formal information request received by
the firm. Adapted from
[`claude-for-legal/litigation-legal:subpoena-triage`](https://github.com/anthropics/claude-for-legal/blob/main/litigation-legal).

# How

1. Run `prompt-injection-sentry` and `pii-redaction` on intake.
2. Extract: issuing authority, subject matter, deadline, list of
   demanded documents/categories, custodian targets.
3. Map the demand to the matter's known custodian and document
   footprint via `firm.matter_read`.
4. Flag candidate objections: scope, burden, relevance, privilege,
   confidentiality, jurisdictional reach.
5. Surface deadline risk via `deadline-watcher` (the response
   deadline is added to the matter's deadline set).
6. Output a structured triage plan; the lawyer decides response
   strategy.

# Output shape

```json
{
  "matter_id": "uuid",
  "issuer": "string",
  "deadline": "YYYY-MM-DDTHH:mm:ssZ",
  "demand_categories": ["string"],
  "objection_candidates": [
    { "category": "scope|burden|relevance|privilege|other", "basis_ref": "string" }
  ],
  "custodian_targets": ["string"],
  "next_steps_for_lawyer": ["string"]
}
```

# Refusals

- Never serve a response or motion to quash. SEND-tier.
- Never determine that an objection "will succeed"; describe the
  authority and basis, let the lawyer decide.
