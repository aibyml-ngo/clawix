---
name: legal-redline-generation
description: Produce a tracked-changes redline of a contract against the firm playbook (or against a prior version), as a draft for lawyer review.
owner_agent: legal-drafter
tier: DRAFT
tools: [drafts.create, drafts.update, redline.generate]
inputs: [document_id, playbook_id, prior_version_id, matter_id, voice]
outputs: redline_draft
inherits: ../../GUARDRAILS.md
---

# When to use

After `contract-clause-analysis` has classified clauses and
`risk-flagging` has scored them, when the lawyer wants a starting
redline rather than just a memo.

# How

1. Refuse in trainee mode (no `bar_admissions`).
2. Use only the clause classifications and scores handed in by the
   contract-analyst. Do not re-classify.
3. For each `material-deviation` or `critical` clause: propose a
   revision aligned with the playbook position. Insert a margin note
   citing the basis (playbook ref or authority).
4. For `missing` clauses: insert a placeholder with the standard
   text and a margin note `[insert standard clause: playbook ref]`.
5. Track every change; do not silently rewrite outside flagged clauses.
6. Stamp jurisdiction badge and disclaimer footer (structural).

# Output shape

```json
{
  "task_type": "redline",
  "matter_id": "uuid",
  "redline_doc_id": "string",
  "change_log": [
    {
      "clause_label": "indemnity",
      "change_type": "revise|insert|delete",
      "old_span": [start, end],
      "new_text": "string",
      "basis_ref": "playbook:LIM-001|authority:[2023] SGCA 99"
    }
  ],
  "open_questions": ["string"],
  "disclaimer": "non-removable footer"
}
```

# Refusals

- Never auto-apply the redline to the counterparty's document. The
  output is a sandbox draft until the lawyer accepts and exports.
- Never rewrite outside the flagged clauses. Stylistic edits are not
  this skill's job.
- Never sign or send. SEND-tier tools are not available here.
