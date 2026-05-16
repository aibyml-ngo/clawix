---
name: double-entry-bookkeeping
description: Double-entry rules and templated journal-entry patterns the agents use when drafting JEs. Document-type templates (invoice, receipt, accrual, prepayment, depreciation, payroll, FX revaluation, tax remittance) and the "every entry balances, every line cites a source" discipline. Read by bookkeeping, reconciliation, ap-ar, audit, reporting.
user-invocable: true
metadata: { "openclaw": { "always": false, "emoji": "⚖️" } }
---

# The discipline

1. Every entry balances. Debits = credits.
2. Every line cites the source-doc path and hash.
3. Every entry is dated to the economic-event date, not today.
4. Every entry has a one-line memo that describes *what happened*, not *what it is*.
5. Above-materiality entries include a one-paragraph rationale.

## Default JE templates

The agent uses these templates; if a transaction does not fit, it writes a coding question.

### Vendor invoice (purchase of services or goods, with input VAT)

| dr/cr | account | rule |
|---|---|---|
| dr | expense / asset | net amount, by chart classification |
| dr | input-VAT recoverable | recoverable portion |
| cr | accounts payable | gross amount, with vendor sub-ledger |

### Customer invoice (sale, with output VAT)

| dr | accounts receivable | gross |
| cr | revenue | net |
| cr | output-VAT payable | tax portion |

### Customer receipt (cash in)

| dr | bank | amount received |
| cr | accounts receivable | matching open invoice(s) |

If the receipt covers multiple invoices, *propose* the allocation; do not finalise without confirmation.

### Vendor payment (cash out)

| dr | accounts payable | matching open invoice(s) |
| cr | bank | amount paid |

### Accrual (expense incurred, invoice not received)

| dr | expense | estimate |
| cr | accruals | estimate |

Reverse in the next period unless the invoice arrives and replaces it.

### Prepayment (payment made for future period)

| dr | prepayment | full amount |
| cr | bank | full amount |

Amortise across the period each month (separate JE).

### Depreciation (period charge)

| dr | depreciation expense | period amount per policy |
| cr | accumulated depreciation | period amount per policy |

### Payroll (gross to net)

| dr | payroll expense (gross) | gross |
| cr | tax withholdings payable | per slip |
| cr | social-contribution payable | per slip |
| cr | other deductions payable | per slip |
| cr | net wages payable | net |

Employer contributions are a separate JE.

### FX revaluation (period close)

For each FX-denominated balance:

| dr/cr | balance account | gain or loss to bring to spot |
| cr/dr | FX revaluation gain/loss | offsetting |

Use spot at period end from `policies/fx-rates/`.

### Tax remittance (paying VAT, payroll tax, etc.)

| dr | tax payable account | amount due per return |
| cr | bank | payment |

## Materiality

Materiality threshold lives in `policies/materiality.yml` and is per-engagement. Above the threshold, the entry's frontmatter sets `materiality: above-threshold` and includes a rationale field.

## Confidence

Every draft entry carries a `confidence: high | medium | low` field. The threshold for "high" is: counterparty known + chart-of-accounts mapping unambiguous + amount and date confirmed. Anything else is medium or low; low entries collect into a separate review batch.

## Reversal entries

Accruals and prepayments reverse mechanically. The agent writes the reversal as part of the original draft package and tags both with the same `pair-id`. Posting the original schedules the reversal; reversal is a `human-in-loop` confirmation step.

## Refusals

- "Just plug a difference with a balancing entry" → refuse.
- "Use 'Suspense' as a default account for unclear lines" → refuse. Coding question instead.
- "Backdate to the closed period" → refuse. Use prior-period adjustment in the next open period.
- "Combine three transactions into one entry to keep the GL tidy" → refuse if it loses traceability to the source docs.
