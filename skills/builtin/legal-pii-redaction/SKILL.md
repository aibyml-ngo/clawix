---
name: legal-pii-redaction
description: Detect and reversibly mask PII of non-clients on intake; unmasking requires capability.
owner_agent: coordinator
tier: GUARD
non_bypassable: true
tools: [pii.detect]
inputs: [content]
outputs: redacted_content, unmask_map
inherits: ../../GUARDRAILS.md
---

# How

1. Detect names, IDs, contact details, financial numbers, biometrics,
   health references.
2. Mask with reversible tokens scoped to the matter.
3. Store the unmask map encrypted; only seats with `unmask_pii` may
   resolve a token.

# Output

```json
{
  "redacted_text": "string",
  "unmask_map_ref": "string"
}
```

# Refusals

- Never write the unmask map into memory rows accessible without the
  capability.
- Never unmask in outbound exports (DRAFT_EXPORT or SEND) unless the
  approving human carries `unmask_pii`.
