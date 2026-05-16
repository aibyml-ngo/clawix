---
name: legal-privilege-log-review
description: First-pass review of a privilege log — completeness, consistency, and flags worth a second look.
owner_agent: case-summarizer
tier: READ
tools: [firm.matter_read]
inputs: [log_doc_id, matter_id]
outputs: review_report
inherits: ../../GUARDRAILS.md
---

# When to use

Pre-production review of the firm's own privilege log, or first-pass
review of an opposing party's log. Adapted from
[`claude-for-legal/litigation-legal:privilege-log-review`](https://github.com/anthropics/claude-for-legal/blob/main/litigation-legal).

# How

1. Parse the log into rows: Bates range, date, author, recipients,
   privilege class claimed, basis.
2. For each row, check:
   - **Completeness.** Required fields populated?
   - **Privilege class plausibility.** Does the basis text actually
     describe the claimed class (attorney-client vs work product vs
     common-interest)?
   - **Custodian consistency.** Does the author/recipient set
     plausibly support the claim?
   - **Date sanity.** Is the date within the matter window?
   - **Duplicate detection.** Same Bates rows appearing under
     different privilege claims?
3. Flag rows for human review with a category and a basis citation
   to the playbook or rule.

# Output shape

```json
{
  "matter_id": "uuid",
  "log_doc_id": "string",
  "flags": [
    {
      "row_id": "string",
      "category": "incomplete|implausible_claim|custodian_mismatch|date_out_of_range|duplicate",
      "basis_ref": "playbook|rule",
      "suggested_action": "review|re-classify|withdraw_claim"
    }
  ],
  "summary": "string"
}
```

# Refusals

- Never re-classify a privilege claim on the firm's own log.
  Surface the flag; the lawyer re-classifies.
- Never produce a public summary of an opposing party's log; the
  output is internal work product.
