---
name: chart-of-accounts
description: How the firm uses its chart of accounts — the firm-level baseline chart, per-engagement overrides, the rules for proposing a new account (always a coding question, never an invented code), and the per-engagement coding-memory file. Read by bookkeeping and gl-classifier.
user-invocable: true
metadata: { "openclaw": { "always": false, "emoji": "🗂️" } }
---

# What the chart is, and what it is not

The chart of accounts is a controlled vocabulary. The agents pick from it; they never extend it.

The firm-level baseline lives at `chart-of-accounts.yml` at the root of the workspace. An engagement may override or extend the baseline at `engagements/<code>/chart-of-accounts.yml`. When both are present, the engagement-level chart is the authoritative one for that engagement.

The chart is not a description of the business. It is a coding scheme. If a transaction does not fit, the agent writes a coding question, not an entry.

## Account ranges (firm baseline)

```
1000–1999  Assets
  1000–1099  Cash and equivalents
  1100–1199  Marketable securities
  1300–1399  Receivables
  1400–1499  Inventory
  1500–1599  Prepayments
  1600–1799  Property, plant, equipment
  1800–1899  Intangibles
  1900–1999  Other assets

2000–2999  Liabilities
  2000–2099  Trade payables
  2100–2199  Accruals
  2200–2299  Tax liabilities
  2300–2399  Employee liabilities
  2400–2499  Short-term debt
  2500–2599  Long-term debt
  2900–2999  Other liabilities

3000–3999  Equity
4000–4999  Revenue
5000–5999  Cost of sales
6000–7999  Operating expenses
8000–8999  Other / financial / FX
9000–9999  Tax and unusual items
```

The exact account file (yaml) carries `code`, `name`, `parent`, `statutory-mapping`, `currency-policy`, `taxable-default`.

## Per-engagement coding-memory

`engagements/<code>/coding-memory.yml` records prior coding decisions on the same counterparty/description pattern. It is updated *only* by humans when they accept or amend a draft entry, and it is then read by `gl-classifier` for future suggestions.

The agent never writes to `coding-memory.yml` from a draft. Memory builds from posted decisions, not proposed ones.

## When the chart does not cover it

The bookkeeping agent writes a coding question to `drafts/coding-questions/<engagement>/<YYYY-MM-DD>-<seq>.md`:

```yaml
---
type: coding-question
engagement: <code>
period: <YYYY-MM>
opened: <YYYY-MM-DD>
source-doc: source-docs/<engagement>/<period>/<hash>-<file>
---

## Why a question, not an entry
<one paragraph>

## Options
1. Account 6090 (Other office costs)
   - Implication: ...
   - Argument for: ...
   - Argument against: ...
2. New account 6XXX (proposed: "Cybersecurity tooling")
   - Implication: changes the chart of accounts (`change_chart_of_accounts` action; human-in-loop)
   - ...

## Recommendation
<one of the options, with rationale>
```

The agent never resolves the question itself.

## Statutory mapping

Each account in the chart carries a `statutory-mapping` (e.g. balance-sheet line, P&L category) used by the reporting agent. If a new account is approved, the human entering it must pick the mapping; the agent will not infer it.

## Refusal patterns

- "Code this to a placeholder account for now" → refuse. Coding question instead.
- "Use the firm baseline even though the engagement has its own chart" → refuse. Engagement override is authoritative for its own data.
- "Update coding-memory yourself based on this draft" → refuse. Memory builds from posted decisions.
