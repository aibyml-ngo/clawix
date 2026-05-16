---
name: legal-disclaimer-insertion
description: Stamp a non-removable disclaimer and jurisdiction badge on every output and exported document.
owner_agent: coordinator
tier: GUARD
non_bypassable: true
tools: []
inputs: [output_object, jurisdiction]
outputs: stamped_output
inherits: ../../GUARDRAILS.md
---

# Disclaimer text

> Aithena is a research tool. This output was generated to assist a
> qualified legal practitioner and is not legal advice. The jurisdiction
> is {jurisdiction}; the content was prepared as of {as_of}.

# Structural placement

- Chat UI: footer pinned by the renderer, not part of the model output.
- DOCX / PDF export: footer applied at export time by the export tool,
  with hash; verified on every page.
- Email draft: inserted as a signature block under the lawyer's signature
  placeholder. Removed only by the lawyer manually before sending.

# Why structural

If the disclaimer were a model-generated string, a prompt-injection or
a careless edit could remove it. Making it structural means the model
cannot drop it.
