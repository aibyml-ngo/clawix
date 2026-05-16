---
name: financial-data-handling
description: How the agents handle financial data — masking, retention, cross-engagement isolation, source-document immutability, and the rules around exporting numbers outside the workspace. Loaded by every agent (default skill).
user-invocable: true
metadata: { "openclaw": { "always": true, "emoji": "💼" } }
---

# Why this skill exists

A firm's data is the firm's licence to operate. Loss of confidentiality, integrity, or availability around client ledgers is an existential issue, not a hygiene one. This skill restates the operational rules the agents live inside.

## Source-document immutability

- Documents arrive in `inbox/`. The accounting-coordinator agent (or a human) routes them into `source-docs/<engagement>/<period>/<hash>-<original-name>` and they are immutable from then on.
- An agent never writes to `source-docs/`. Read-only.
- If a source document is wrong (vendor sent a corrected invoice), the corrected version lands as a *new* file with its own hash; the original is preserved with a note linking forward.

## Cross-engagement isolation

- The agents read and write inside one engagement at a time.
- An aggregation across engagements (firm-level KPIs, cross-engagement analytics) is a separate, explicitly-permissioned job and is never produced by the engagement-level agents.
- Any cross-engagement output is produced from anonymised aggregates only; client names and engagement codes are removed.
- A document marked `confidential: true` is excluded from any cross-engagement aggregation regardless of permissioning.

## Masking

| Field | Default | Unmask path |
|---|---|---|
| Bank account number / IBAN | last-4 only | `unmask-account-number` + reason, logged |
| Tax ID / VAT number | last-4 only | `unmask-tax-id` + reason, logged |
| Client / vendor / customer legal name | engagement code in cross-engagement output; legal name allowed in single-engagement output | n/a |
| Employee personal data | masked unless the artifact is the payroll register itself | `disclose-named-record` + reason |

Masking applies to draft artifacts and to chat output alike. An unmasked value lives in the response that requested it; it is not retained in a draft file unless the artifact requires it.

## Retention

- Source documents: retain as long as the engagement, plus the firm's statutory minimum.
- Drafts: retain for the period of the engagement; once the artifact is posted/filed/superseded, the draft is archived to `drafts/.archive/` and read-only.
- Audit log: retain indefinitely. Append-only. Off-site backup is the firm's responsibility.
- Working papers: retain per the firm's retention policy in `policies/retention.yml`.

## Cross-border / cross-system transfers

- Client data does not leave the firm's controlled environment. No external AI service. No third-party OCR. No cloud-based data-prep tool that the firm has not signed a DPA with.
- If a regulator requires data to be filed via a portal, the file goes through the human at the named filing channel. The agent does not call the portal directly.

## Currency, tax, and rounding

- The base currency is set per engagement in `engagements/<code>/index.md` and is never assumed.
- FX rates come from `policies/fx-rates/<source>.yml`; an agent never invents a rate or pulls one from the network.
- Tax rates come from `policies/tax-rates.yml` and are dated; an agent uses the rate that applied on the economic-event date of the source doc.
- Rounding follows the firm's policy (typically 2dp for money, 4dp for FX rates); the agent never rounds during arithmetic, only at presentation.

## Things the agents must refuse

- Email, share, or upload a ledger or trial balance to anyone outside the firm.
- Train, fine-tune, or send client data to any external model.
- Aggregate confidential engagements into a firm-wide KPI without the explicit `cross-engagement-analytics` permission and the redaction step.
- Export bank-account numbers in cleartext to a draft file.
- Decode, decrypt, or attempt to reverse a hashed identifier.

## Things the agents do well

- Produce per-engagement aggregates that respect `confidential: true`.
- Mask consistently across drafts.
- Cite source-doc paths and hashes on every line.
- Flag any document or field that violates a marking rule, before downstream agents touch it.
