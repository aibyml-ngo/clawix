---
name: bank-reconciliation
description: How the firm reconciles bank, credit-card, intercompany, and clearing accounts. Auto-match thresholds, handling of timing items, treatment of bank charges and FX, and the rule that plug entries are forbidden. Read by reconciliation, audit.
user-invocable: true
metadata: { "openclaw": { "always": false, "emoji": "🏦" } }
---

# Reconciliation, the firm's way

A reconciliation explains the difference between what the bank says and what the ledger says. It does not erase the difference, and it does not balance by introducing new numbers.

## The structure of every reconciliation

```
opening ledger balance
+ ledger movements during period
= closing ledger balance               (A)

opening statement balance
+ statement movements during period
= closing statement balance            (B)

A vs B explained by:
+ deposits in transit (timing)
- outstanding payments (timing)
± genuine differences  (JE drafts)
```

If the result does not balance to the cent, the reconciliation is not finished. Do not mark it ready for review.

## Auto-match rule

A statement line and a ledger line auto-match only when:

- Amounts agree exactly (or within `policies/reconciliation-tolerance.yml.amount`, default 0.05).
- Dates agree within `policies/reconciliation-tolerance.yml.date-days`, default 1 day.
- One of {counterparty name, payment reference, memo} agrees.

Anything weaker becomes a "proposed match — needs confirmation" line.

## Timing items

- **Outstanding payments**: ledger has it, statement does not. List with date, amount, payee. Do not delete from the ledger.
- **Deposits in transit**: ledger has it, statement does not. List with date, amount, payer.
- Items older than the policy window (default 60 days) become a finding, not a timing item.

## Genuine differences (these become JE drafts)

| Cause | JE drafted by reconciliation agent? |
|---|---|
| Bank charges | yes |
| Bank interest received/paid | yes |
| FX revaluation | yes (using policy spot) |
| Returned cheque / failed direct debit | yes (reverse the original) |
| Duplicate posting | no — finding |
| Misposting | no — finding (bookkeeping fixes) |
| Fraud signal | no — finding (audit takes it; do not draft) |

## Plug entries are forbidden

If a difference cannot be explained by a timing item or one of the categories above, it is unexplained and stays unexplained until a human resolves it. The agent never "balances" by writing an unexplained adjustment.

## Intercompany reconciliations

Mismatch over policy tolerance never produces a one-side JE. Both sides confirm and one side amends.

## Credit-card reconciliations

Cardholder must code their own lines (or the receipt must be in the system). Reconciliation matches the statement against the coded lines. Uncoded lines are a finding against the cardholder, not a free-coding job for the agent.

## Refusal patterns

- "Plug the small difference, the cents don't matter" → refuse.
- "Reduce the date tolerance to make more lines auto-match" → refuse. Tolerance is policy.
- "Mark the reconciliation reviewed, you saw it match" → refuse. Reviewer is `audit` or a human; preparer-as-reviewer is forbidden.
- "Delete the old outstanding payments" → refuse. Old timing items are findings.

## Outputs

- The reconciliation working file in `drafts/reconciliations/<engagement>/<account>/<YYYY-MM>.rec.md`.
- One JE draft per genuine difference, in `drafts/journal-entries/`.
- A list of "human resolve" items inside the reconciliation working file.
