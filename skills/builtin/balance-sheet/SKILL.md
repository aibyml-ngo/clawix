---
name: balance-sheet
description: How the reporting agent constructs the balance sheet — preconditions, account-range mapping, comparative-period rules, restatement discipline, and the rule that interim cuts are watermarked. Read by reporting, audit.
user-invocable: true
metadata: { "openclaw": { "always": false, "emoji": "📊" } }
---

# Preconditions before producing a balance sheet

The reporting agent runs the following before drafting:

- The trial balance balances (debits = credits to the cent).
- Every cash, intercompany, and clearing account has a reviewed reconciliation for the period.
- No audit findings of severity high or critical are open.
- The period is closed (`periods/<YYYY-MM>/closed.lock` exists), or the user has explicitly invoked `produce-interim-report <reason>`.

If any precondition fails, the agent does not produce the balance sheet. It produces a one-page "Pack blocked" file listing what is missing and stops.

## Account-range to statement-line mapping

The mapping lives in `chart-of-accounts.yml` per account (`statutory-mapping`). The reporting agent reads the mapping; it does not infer.

Standard top-level groupings:

```
Assets
  Current
    Cash and equivalents
    Trade and other receivables
    Inventory
    Prepayments
    Other current assets
  Non-current
    Property, plant, equipment (net)
    Intangibles (net)
    Long-term investments
    Other non-current assets

Liabilities
  Current
    Trade and other payables
    Accruals
    Tax liabilities
    Short-term debt
    Other current liabilities
  Non-current
    Long-term debt
    Deferred tax
    Other non-current liabilities

Equity
  Share capital
  Reserves
  Retained earnings
  Profit/loss for the period
```

The exact lines come from `policies/reporting-basis.yml` (GAAP or IFRS-SME).

## Comparative period

A balance sheet always shows the comparative period. Default comparative is the prior period's closing.

Comparatives must match the prior-period statements as previously issued. A change to a comparative is a restatement and requires:

- A disclosure note explaining the restatement.
- An audit-marked review of the restatement.
- A `prior-period-restatement` audit log entry.

The agent does not silently restate.

## Account name changes

If an account's name has changed between the comparative period and the current period, both names appear in the comparative column header (e.g., "Other office costs (was: Office supplies)").

## Rounding

Money rounds to the unit specified in `policies/reporting-basis.yml` (typically 2dp or 0dp for pack rollups). The agent never rounds during arithmetic, only at presentation. Cross-references between rounded totals reconcile to the cent at the un-rounded level.

## Reconciliation note (always present)

Every balance-sheet draft ends with:

```
Trial balance total assets          <amount>
= Balance sheet total assets        <amount>      ✓
Trial balance total liabs+equity    <amount>
= Balance sheet total liabs+equity  <amount>      ✓
```

If either line does not match to the cent, the draft is invalid; the agent removes it and writes a "Pack blocked" file.

## Refusal patterns

- "Produce the balance sheet for an open period without the interim flag" → refuse.
- "Combine the new account into the old account's name in the comparative" → refuse. Both names appear, or it is a restatement.
- "Skip the reconciliation note" → refuse.
- "Restate the comparatives without a disclosure note" → refuse.
- "Adjust opening retained earnings to plug a difference" → refuse. The trial balance must balance first.
