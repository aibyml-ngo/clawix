---
name: cashflow-analysis
description: How the firm builds the daily cash position and the 13-week rolling forecast. Driver-based forecasting, probability weighting from collection history, stress scenarios, variance analysis after the week. Read by cashflow, reporting.
user-invocable: true
metadata: { "openclaw": { "always": false, "emoji": "💧" } }
---

# Two artifacts, two purposes

- **Daily cash position**: a fact. Today's balances by account, intraday movements, status of each account's last reconciliation.
- **13-week rolling forecast**: a probability-weighted projection. Driver-based, not trend-based.

The agents do not produce a cash forecast that lacks an explicit driver per material line.

## Daily position rules

- Use only posted lines and reviewed reconciliations.
- An account whose last reconciliation is not reviewed is shown with its current ledger balance and labelled `status: unreviewed-balance`.
- Account numbers are masked; labels and last-4 only.
- Intraday movements after the reconciliation cut-off are listed separately and do not move the headline number.

## Forecast rules

The forecast is a sum of drivers, not a smoothed curve.

### Inflow drivers

- AR by aging bucket × policy weight from `policies/cashflow-weights.yml` (e.g., Current 95%, 1–30 80%, 31–60 60%, 61–90 35%, 90+ 10%).
- Disputed invoices weighted at the dispute-class default unless the engagement overrides.
- Recurring inflows from `engagements/<code>/recurring-cashflows.yml`.
- One-offs from `engagements/<code>/expected-inflows.yml` (each must reference a contract or an executed milestone).

### Outflow drivers

- AP payment-run drafts (week-by-week from the AP agent's briefs).
- Payroll calendar.
- Debt service (capital + interest) from the debt schedule.
- Tax remittances from the tax calendar.
- One-offs from `engagements/<code>/expected-outflows.yml`.

### Output

```
| week | inflows-weighted | outflows | net | closing | min-during-week |
```

`min-during-week` is the lowest projected daily cash within the week — this is the figure that matters for covenant headroom and overdraft avoidance.

If `min-during-week` falls below the engagement's policy floor in any week of the horizon, the agent drops a brief into `briefs/coordinator-cashflow-alert-YYYY-MM-DD.md`.

## Stress scenarios

Standard scenarios, run on request, never substituted for the base case:

- Customer-X delays N days
- N% across-the-board AR slowdown
- AP-run W+1 approved at 100% / 80% / 50%
- One-off inflow Y delayed K weeks

Each scenario is its own file; never overwrites the base forecast.

## Variance after the week

After each week's actuals are in:

- Spawn `variance-analyzer` with last week's forecast and last week's actuals.
- The agent appends "Last week's variance" to the new week's forecast, listing material movements with their drivers and an explicit unexplained-residual line.

This is how the model improves. The agent does not silently adjust weights; weight changes are a `change_policy` action and require human approval.

## Refusal patterns

- "Adjust the forecast to hit the partner's number" → refuse. Driver-based, not target-based.
- "Drop the unreviewed-balance flag for the daily position" → refuse.
- "Quietly raise the weight on Customer X to make next week look better" → refuse. Weight changes are policy actions.
- "Combine all the stress scenarios into one number" → refuse. Each scenario stands alone.

## Outputs

- `drafts/cashflow/<engagement>/daily/<YYYY-MM-DD>.cash.md`
- `drafts/cashflow/<engagement>/forecast/<YYYY-WW>.forecast.md`
- `drafts/cashflow/<engagement>/scenarios/<YYYY-WW>-<scenario-name>.md`
