---
name: ap-ar-aging
description: Aging buckets, dispute handling, payment-run construction, dunning-note templates, and the rules around vendor master-data hygiene (the most common fraud vector). Read by ap-ar, cashflow, audit.
user-invocable: true
metadata: { "openclaw": { "always": false, "emoji": "📅" } }
---

# Aging buckets

Standard buckets, used in every AP and AR aging report:

- Current (not yet due)
- 1–30 days past due
- 31–60 days past due
- 61–90 days past due
- 90+ days past due

Past-due is measured against contractual due date, not invoice date. Disputes do not reset the clock for reporting; they sit in a separate "Disputed" column and are excluded from the cash-flow inflow estimate at the dispute-class default weighting (`policies/cashflow-weights.yml`).

# AP payment-run construction

A payment-run draft answers the question "what should the firm pay this Friday". It does not pay anything.

## Inputs

- Open AP invoices with `due-date <= run-date + payment-cycle-days`.
- Vendor master data (terms, payment method, banking — masked in output).
- Hold rules from `policies/ap-holds.yml`.
- Cash-flow constraint: the cashflow agent's brief on available headroom.

## Output (draft)

```yaml
---
type: payment-run
engagement: <code>
run-date: <YYYY-MM-DD>
currency-base: <ccy>
total-base: <amount>
total-by-currency: { EUR: ..., USD: ... }
holds-applied: <count>
disputed-excluded: <count>
---

| invoice | vendor (code) | due | amount-orig | ccy | amount-base | bank-mask | recommend | rationale |
|---------|---------------|-----|-------------|-----|-------------|-----------|-----------|-----------|
| INV-1   | V001          | ... | 297.60      | EUR | 297.60      | ****1234  | PAY       | Within terms, no holds |
| INV-9   | V019          | ... | 1500.00     | EUR | 1500.00     | ****9999  | HOLD      | Vendor flagged: bank-detail change in last 30 days |
```

Recommendations are PAY, HOLD, or SHORT-PAY <amount> with rationale. The human approves.

## Standard hold rules

- Vendor on hold list (`engagements/<code>/parties/holds.yml`)
- Vendor master-data flagged for review
- Bank detail changed within last 30 days (fraud window)
- Disputed invoice
- Missing GRN (where required by `policies/po-policy.yml`)
- Above the engagement's single-payment threshold (forces partner approval)

# AR collection notes

Notes are templated, not freelanced. Templates by aging bucket and customer category live in this skill folder under `templates/`. The agent fills in fields; it never paraphrases the policy text.

## Categories

- Strategic customer (low pressure, partner-led)
- Standard customer (firm but professional)
- High-risk customer (formal, with deadline)

The category is on the customer master file. The agent does not infer it.

## Standard escalation

| Days past due | Action |
|---|---|
| 1–14 | No action; standard reminder optional |
| 15–30 | First note (templated) |
| 31–60 | Second note + phone-call request to engagement partner |
| 61–90 | Formal note + suspend new credit |
| 90+ | Refer to partner; consider write-off discussion |

The agent drafts. The human sends.

# Vendor master-data hygiene (fraud)

The most common occupational fraud is a vendor bank-detail change initiated by an attacker impersonating the vendor over email. Rules:

- Master-data changes are `human-in-loop` regardless of who requests them.
- A change requires a verified channel (signed letter, known phone number, in-person), not an email.
- After a change, the vendor is on a 30-day flag; payments hold automatically and require partner sign-off.
- Multiple master-data changes in a 90-day window are a finding.

The AP agent never changes master data. The agent flags an inbound change request and routes it to a human.

# Refusal patterns

- "Pay vendor X today, override the hold" → refuse.
- "Send the dunning note now" → refuse. Drafts go to `drafts/`.
- "Update vendor banking from this email" → refuse.
- "Write off the over-180 balance to clean up the aging" → refuse.
- "Skip a category-customer escalation step to save time" → refuse. The escalation ladder is policy.
