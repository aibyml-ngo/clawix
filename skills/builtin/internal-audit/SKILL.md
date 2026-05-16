---
name: internal-audit
description: The firm's standard internal-audit checks (cut-off, completeness, segregation of duties, unusual-pattern detection, control-test sampling, period-close integrity), the finding format, and the materiality and traffic-light rules. Read by audit, reviewer, accounting-coordinator, reporting.
user-invocable: true
metadata: { "openclaw": { "always": false, "emoji": "🔎" } }
---

# What the audit agent does, and what it does not

The audit agent is read-only. It does not fix entries. It records findings, produces working papers from sample-tests, and (only after passing the firm's checklist) marks reconciliations or JE drafts "reviewed-by-audit".

The agent does not approve actions. Approval is a human authority.

# Standard checks

## Cut-off

For each material account, every transaction is in the right period.

- Revenue: shipping date / service-delivery date in period? Invoice date alone is not enough.
- Expenses: economic-event date in period? Invoice receipt date alone is not enough.
- Accruals: every recurring accrual present? Where it is missing, finding.

## Completeness

Every source document in `source-docs/<engagement>/<period>/` has either a JE draft or a documented reason for none. Source docs without coverage are listed as findings against the bookkeeping pathway.

## Segregation of duties

- Preparer of an action ≠ approver of that action (by user identity, not just agent identity).
- The same human cannot post and approve a JE.
- The same human cannot create a vendor and release a payment to that vendor in their first 30 days.

These are hard rules. Violations are findings of severity ≥ medium regardless of amount.

## Unusual postings

Pattern flags (each a "review for explanation", not an accusation):

- Round-number expenses above threshold ("£10,000.00" exactly).
- Postings on weekends or outside business hours.
- Just-below-approval-threshold postings (e.g., 9,950 against a 10,000 threshold).
- Multiple payments to the same vendor at the same amount within 7 days (duplicate-payment scan).
- Even-cent bank charges (very common false positive — flag and discard with a note).
- Manual JEs to bank accounts (should be reconciled-only).

The agent flags. It does not infer fraud. The partner decides what is and is not real.

## Vendor master-data flag

Any vendor master-data change in the period is reviewed:

- Bank-detail change ≤ 30 days old → confirm the verification channel was used (`master-data-changes.log` records the channel).
- Multiple changes in 90 days → finding (severity ≥ medium).
- Change made in the same window as a payment release → finding (severity high).

## Reconciliation review

Every cash and clearing account has a reviewed reconciliation by the policy deadline.

- A reconciliation marked "reviewed-by-audit" by the agent passes the JE-checklist below.
- Reconciliations not reviewed by deadline are findings.
- Plug entries in a reconciliation are an automatic finding (severity high).

## Period-close integrity

- No writes to closed periods.
- Prior-period adjustments tagged with `prior-period-adjustment: <ref>`.
- Each prior-period adjustment has a one-paragraph rationale.

# Sampling parameters

Sampling parameters live in `policies/audit-sampling.yml`:

- Random-sample size by population size (statistical, not convenience).
- High-risk strata (large amounts, manual JEs, weekend posts, new vendors) get higher coverage.
- The agent records the random seed and the population description in the working paper.

# Checklist: JE draft (run by `reviewer` subagent)

| id | rule | severity if fail |
|----|------|------------------|
| JE-01 | Debits = credits | high |
| JE-02 | Date is the economic-event date, not the run date | medium |
| JE-03 | Period is open, or `prior-period-adjustment` is set | high |
| JE-04 | Every line cites a source-doc with hash | high |
| JE-05 | Account exists in the chart for this engagement | high |
| JE-06 | Currency is engagement-base or has FX rate cited | medium |
| JE-07 | Tax components agree to source-doc tax lines | high |
| JE-08 | Memo describes what happened, not what it is | low |
| JE-09 | Above-materiality entries include rationale | high |
| JE-10 | Confidence is high, or the entry is in a review batch | medium |

# Checklist: reconciliation

| id | rule | severity if fail |
|----|------|------------------|
| REC-01 | Opening = prior-period reviewed closing | high |
| REC-02 | Auto-match meets policy threshold | medium |
| REC-03 | Timing items present and ≤ policy age | medium |
| REC-04 | Genuine differences are JE drafts, not plugs | high |
| REC-05 | Reconciliation summary balances to the cent | high |
| REC-06 | Account not marked reviewed by preparer | high |

# Checklist: payment run

| id | rule | severity if fail |
|----|------|------------------|
| PAY-01 | Every line has invoice + vendor + amount + recommend + rationale | high |
| PAY-02 | Holds applied per policy | high |
| PAY-03 | Vendor master-data flag respected | high |
| PAY-04 | Currency totals reconcile to base total | medium |
| PAY-05 | No duplicate-payment pattern | high |

# Materiality and traffic lights

The engagement's materiality threshold is in `policies/materiality.yml`. Findings carry both `severity` (low/medium/high/critical) and `materiality: above|below`.

For the partner status pack the agent reports counts:

- Open critical findings → red
- Open high findings → amber
- Open medium findings → amber if > N (engagement policy), else green
- Open low findings → green

The agent never reports finding text in any cross-engagement or partner-pack output. Counts and severity only.

# Refusal patterns

- "Skip the random sample, just check the obvious ones" → refuse.
- "Mark this reconciliation reviewed without running the checklist" → refuse.
- "Don't open a finding, the partner won't like it" → refuse and log.
- "Tell me the finding text in the partner pack" → counts only.
- "Approve this payment run on behalf of the partner" → refuse. Audit reviews; it never approves.
