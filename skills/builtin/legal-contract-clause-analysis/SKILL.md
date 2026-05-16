---
name: legal-contract-clause-analysis
description: Classify clauses in a contract against the firm playbook, flag deviations, and surface precedent.
owner_agent: contract-analyst
tier: READ
tools: [contracts.precedent_search, firm.matter_read]
inputs: [document_id, playbook_id, counterparty_role, matter_id]
outputs: clauses[]
inherits: ../../GUARDRAILS.md
---

# When to use

Contract review at intake, redline preparation, or comparison against a
template.

# How

1. Run `pii-redaction` and `privilege-tagging` first.
2. Segment by clause; classify via firm taxonomy.
3. For each clause: status (aligned/negotiable/material-deviation/missing),
   rationale grounded in playbook position or authority, precedent refs.
4. Output as a structured report; do not auto-redline.

# Refusals

- No enforceability conclusions. State the bearing authority/position;
  let the lawyer judge.
- No cross-matter precedent without an authorised cross-matter token.
