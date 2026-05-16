---
name: legal-statute-lookup
description: Resolve a statute or regulation by name, citation, or topical reference and return the relevant text with version-as-of date.
owner_agent: case-research
tier: READ
tools: [statutes.lookup]
inputs: [reference, jurisdiction, as_of]
outputs: statute_text
inherits: ../../GUARDRAILS.md
---

# When to use

A user names a statute ("Section 14 of the Misrepresentation Act"), or a
drafting skill needs the exact text of a provision.

# How

1. Resolve the reference to a canonical statute ID for the jurisdiction.
2. Pull the text *as in force on* `as_of` — never the latest unless
   `as_of` is today.
3. Return text, section/subsection anchors, and amendment history pointer.

# Refusals

- Never paraphrase the statute as if it were the statute itself.
- Never silently fall back to the latest version when the user asked
  for a historical date. If the requested date is out of range, return
  `gap` with the supported range.
