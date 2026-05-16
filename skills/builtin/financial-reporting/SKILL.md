---
name: financial-reporting
description: The full monthly close pack — trial balance, balance sheet, P&L, cash-flow statement, statement of changes in equity, variance bridge, and the partner's one-page status pack. Disclosure-note templates, KPI definitions, traffic-light thresholds. Read by reporting, audit.
user-invocable: true
metadata: { "openclaw": { "always": false, "emoji": "📑" } }
---

# The pack

Every closed-period pack contains the following files, in order. The reporting agent produces them all in one run, or none of them.

```
drafts/reports/<engagement>/<YYYY-MM>/
├── 00-cover.md                     basis of preparation, watermark, index
├── 00-trial-balance.md             every account, debit total, credit total, balanced ✓
├── 01-balance-sheet.md
├── 02-income-statement.md
├── 03-cash-flow-statement.md
├── 04-statement-of-changes-in-equity.md
├── 05-variance-bridge.md
├── 99-partner-status-pack.md
└── companion.xlsx                  numbers; same content, machine-readable
```

## 00-cover.md (always at the top)

Contents:

- Engagement code and name (full name allowed; this is single-engagement output).
- Period.
- Basis of preparation (GAAP / IFRS-SME, currency, rounding policy).
- Preparer and timestamp.
- Watermark: "DRAFT — DO NOT DISTRIBUTE" (or "INTERIM — DO NOT DISTRIBUTE" for interim cuts).
- Audit-precondition status (counts only, never finding text).
- File index.

## 02-income-statement.md

Standard format:

```
Revenue                                    <amount>
- Cost of sales                            <amount>
= Gross profit                             <amount>
- Operating expenses                       <amount>
= Operating profit                         <amount>
+ Other income / - Other expense           <amount>
= Profit before tax                        <amount>
- Tax                                      <amount>
= Profit for the period                    <amount>
```

Comparative period to the right; same comparative discipline as the balance sheet.

## 03-cash-flow-statement.md

Built using the indirect method by default unless the engagement's reporting basis specifies direct.

The reconciliation runs:

```
Profit before tax                          <amount>
+ depreciation / amortisation              <amount>
+ working-capital movements (Δ AR, Δ AP, Δ inventory, Δ accruals/prepayments)
- tax paid                                 <amount>
= Operating cash flow                      <amount>
+ investing activities                     <amount>
+ financing activities                     <amount>
= Net change in cash                       <amount>
+ opening cash                             <amount>
= closing cash                             <amount>      ← must equal balance-sheet cash
```

The closing cash line ties to the balance sheet to the cent.

## 04-statement-of-changes-in-equity.md

Roll-forward of share capital, reserves, retained earnings, and profit for the period. Movements reference their JE evidence.

## 05-variance-bridge.md

Built by spawning `variance-analyzer`. Three views by default:

- vs Budget (period)
- vs Prior month
- vs Prior year same period

Each view shows material movements with an evidence-anchored driver, and an explicit unexplained-residual line.

## 99-partner-status-pack.md (the one-pager)

Top of the pack, the page the partner reads first:

```
Engagement: <code> — <name>
Period: <YYYY-MM>     |    Basis: <GAAP|IFRS-SME>     |    Currency: <ccy>
Status: closed (or INTERIM)

KPIs                          this    prior    Δ      target    light
- Gross margin %              ...      ...    ...      ...      🟢🟡🔴
- Days sales outstanding      ...      ...    ...      ...
- Days payable outstanding    ...      ...    ...      ...
- Days inventory on hand      ...      ...    ...      ...
- Operating cash flow         ...      ...    ...      ...
- Cash runway (weeks)         ...      ...    ...      ...
- Covenant headroom           ...      ...    ...      ...

Three things going right
- ...

Three things to watch
- ...

Two decisions needed
- ...
```

KPI definitions and traffic-light thresholds live in `policies/kpi-pack.yml`. The agent does not invent thresholds.

## Disclosure notes

Disclosure-note text is templated in `templates/` of this skill folder (engagement-letter, accounting-policies, going-concern, related-parties, subsequent-events, contingencies). The agent fills numbers and references; it does not paraphrase wording.

If a note's template does not fit the situation, the agent writes a one-page "disclosure-question" file in `drafts/disclosures/` and stops. The partner drafts.

## Refusal patterns

- "Soften the watch list" → refuse. The list is anchored to KPIs and thresholds.
- "Round aggressively to make the trial balance match the rounded balance sheet" → refuse. Cross-references reconcile at the un-rounded level.
- "Skip the cash-flow statement, no one reads it" → refuse. The pack is the pack.
- "Tell the partner everything is on track without showing the audit-precondition counts" → refuse.
- "Send the pack to the bank covenant analyst" → refuse. Drafts go to `drafts/`. Humans send.
