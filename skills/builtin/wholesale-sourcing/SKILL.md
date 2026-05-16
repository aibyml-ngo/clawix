---
name: wholesale-sourcing
description: Wholesale and trade-counter sourcing for home builders, installers, and designers — turning a Bill of Materials into a priced, accountable purchase plan across named merchants (Travis Perkins, Jewson, MKM, Selco, Howdens, Wickes, CEF, Edmundson, Rexel, Plumb Center, Wolseley, Screwfix, Toolstation, etc.). Use when the user needs to convert a BoM to a buying plan, compare trade-counter prices, pull lead times, build a delivery schedule against site stages, or apply a confirmed trade discount.
version: 1.0.0
author: clawix-home-build
tags: [home, wholesale, merchant, sourcing, procurement, trade-counter]
---

# Wholesale Sourcing — BoM to Buying Plan

This skill turns a validated Bill of Materials into a **buying plan**: who you buy from, at what price, with what lead time, and on which date the materials need to arrive on site. It is the procurement layer that sits between the role skills (`builder-takeoff`, `device-install-survey`, `designer-spec-pack`) and the actual purchase orders the user places themselves.

**Always read `home-build-shared` first.** This skill assumes its BoM schema, units, cost roll-up, currency, and client-data rules.

This skill is **DRAFT-tier**: it produces a buying plan and a draft of supplier RFQs. It never places an order, never submits a quote request through a supplier portal, and never reads or stores the user's trade-account credentials. Procurement is a human action — this skill prepares it.

---

## When to invoke

Trigger on: "what should I buy this from", "compare Travis Perkins vs Jewson on this BoM", "build the buying plan", "what's the lead time on X", "split this BoM by supplier", "give me an RFQ for the timber lines", "when do I need to order the windows", "what's my best price on plasterboard right now", "show me what's available local-trade-counter vs national".

Don't trigger on questions about retail prices for non-trade buyers — that's a general web search, not a procurement plan.

---

## Phase 0 — Inputs

Before producing a buying plan, the skill needs:

1. A validated `bom.csv` at `/workspace/<project>/bom.csv` — must pass `bom_aggregator.py` validation first. If it doesn't, fix the BoM before sourcing.
2. The project's currency from `project.md`.
3. The user's location (postcode area is enough — `SW1`, `M3`, `EH7`) for local-trade-counter scoring.
4. The user's confirmed trade-account discounts in memory, if any (e.g. "Travis Perkins: 12 % off list, account 4XXXXX1").
5. The site dates from `schedule.md` (start date, first-fix date, second-fix date) — drives the delivery schedule.

If any of (1)–(3) is missing, ask the user once, then stop. Don't guess location or invent dates.

---

## Phase 1 — Categorise BoM rows by supplier domain

Each row in the BoM belongs to one of these procurement domains. Group them in `/workspace/<project>/sourcing/by-domain.md`:

| Domain               | Typical content                                                                           | Default merchants (UK)                                   |
| -------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `heavy-build`        | Timber, plasterboard, insulation, sand, cement, aggregate, bricks, blocks                 | Travis Perkins, Jewson, MKM, Selco                       |
| `electrical-trade`   | Cable, back-boxes, consumer units, MCBs, conduit, dado, fittings                          | CEF, Edmundson Electrical, Rexel, City Electrical Wholesalers |
| `plumbing-trade`     | Pipe (copper, plastic, MDPE), fittings, valves, manifolds, soil pipe, traps               | Plumb Center, Wolseley, Williams, Plumbase               |
| `kitchen-bathroom`   | Kitchen carcasses + doors, worktops, sanitaryware, taps, showers, splashbacks             | Howdens, Magnet, Wren Trade, B&Q TradePoint              |
| `decor-finishes`     | Paint, fillers, sandpaper, masking tape, sealants                                         | Brewers, Dulux Decorator Centre, Crown Decorating Centre |
| `consumables-fast`   | Screws, fixings, drill bits, gloves, dust sheets, PPE, low-cost hand tools                | Screwfix, Toolstation (click-and-collect 1 min)          |
| `tool-hire`          | Skip, scaffold, breaker, dehumidifier, plate compactor, mixer                             | HSS Hire, Speedy, Brandon Hire (and local independents)  |
| `specialist`         | Stone, bespoke joinery, structural steel, glass, smart-home hubs, AV, EV chargers, ASHP   | Project-specific — record per row                        |

Region overrides:

- **Northern UK**: weight Jewson and MKM higher than Travis Perkins.
- **Scotland**: add Frasers Builders Merchants, City Plumbing, Bathgate.
- **US**: replace UK list with Home Depot Pro, Lowe's Pro, Ferguson, US LBM yards; replace UK-only categories with their US equivalents (LMC for kitchens, Sonepar for electrical wholesale).
- **EU**: replace with country-equivalent (BAUHAUS, Bauking, Hornbach Pro, Würth, Rexel EU).

If the user has a confirmed preferred merchant in memory, that merchant takes precedence within its domain regardless of region.

Specialist lines are **never** auto-assigned to a generic merchant. Record `specialist — needs RFQ` and produce a draft request in Phase 4.

---

## Phase 2 — Price each row at the merchant

For every row, fetch the live list price from the merchant's product page using `web_fetch`. Don't search the merchant — go to the product page URL the user has, or use `web_search` only to find the URL, then `web_fetch` the page.

Record three numbers per row in `/workspace/<project>/sourcing/priced-bom.csv`:

```
sku,description,domain,merchant,unit,qty,list_price,discounted_price,line_total,lead_days,stock_status,source_url,fetched_at,notes
```

Field rules added on top of the canonical `bom.csv`:

- `list_price`: the public list price from the merchant page.
- `discounted_price`: `list_price × (1 − discount)` from the user's confirmed account discount for that merchant. If no confirmed discount exists, equals `list_price`.
- `lead_days`: from the product page's "delivery / pickup" block. If a range is given (e.g. "2–5 days"), record the **upper bound** for safety.
- `stock_status`: one of `in-stock`, `low-stock`, `out-of-stock`, `made-to-order`, `unknown`.
- `source_url`: the exact product URL.
- `fetched_at`: ISO date of the `web_fetch` call.

If a page is unreachable, mark the row `TBC` and add a `notes` entry: "Page unreachable — user to call merchant". Never substitute a guess.

### Comparison mode

If the user asks "compare X and Y", do the above for the same row at two merchants and add a column `alternate_merchant` + `alternate_discounted_price` + `alternate_lead_days`. Don't recommend a winner unless the user asks — the user weighs price vs lead vs relationship, not just headline number.

---

## Phase 3 — Apply the trade discount, not the consumer discount

Trade discounts come in three forms. The skill handles each differently:

1. **Confirmed account discount** ("12 % off TP list, account 4XXXXX1") — apply to every line at that merchant. Show on the buying plan as `list × 0.88`.
2. **Spot-quote discount** — used for one-off large orders. Don't apply automatically; record as `Phase 4 RFQ candidate`.
3. **"Trade price on application"** (Howdens, electrical wholesale, plumbing wholesale) — never invent a number. Mark the row `TPA — see RFQ` and route to Phase 4.

The account number is **never** stored in `memory_save`. It belongs in `project.md` for the duration of the project or in a separate `/workspace/<user>/accounts.md` that the user manages. The bundle reads it from there at quote time but does not echo it into outputs.

---

## Phase 4 — Build the RFQ pack

For every row marked `specialist` or `TPA` in Phase 3, draft one RFQ in `/workspace/<project>/sourcing/rfqs/<merchant-or-slug>.md`. Pack them by merchant so the user sends one email per merchant.

RFQ template:

```markdown
# RFQ — <Merchant or supplier name>

- Project: <project-slug>
- Required on site: <date>
- Currency: <GBP / USD / EUR>
- Delivery to: <postcode-area only — never the full address in a request>
- Account number (if known): <account-ref — only if the user explicitly approves echoing it>

## Items

| Line | SKU / spec        | Description                  | Unit | Qty | Notes                                |
|------|-------------------|------------------------------|------|-----|--------------------------------------|
| 1    | <sku or spec>     | <plain English>              | each | 4   | <finish, colour, model variant>      |
| ...  | ...               | ...                          | ...  | ... | ...                                  |

## Asks

- Best trade price per line.
- Confirmed lead time per line.
- Stock vs lead-time options for each.
- Delivery quote to the postcode area.
- Validity period of the quote.
```

The RFQ is a **draft email body**. The skill never sends it. It writes the file and tells the user "RFQs drafted under `sourcing/rfqs/`; send them when ready."

If the user asks the skill to send the RFQ, refuse and explain — sending email is a SEND-tier action that requires explicit human approval and a configured email connector per `TOOLS.md`. Saving a draft to the email client (DRAFT_EXPORT-tier) is possible if the connector exists, but is a separate request.

---

## Phase 5 — The buying plan

Compile `/workspace/<project>/sourcing/buying-plan.md`:

```markdown
# Buying plan — <project>

Generated: <ISO date>
Currency: <GBP / USD / EUR>

## By merchant

### Travis Perkins — account 4XXXXX1
- Order by: <date>  (lead 5 days; site needs by <date>)
- Lines: 18
- Sub-total at list: £X
- Sub-total at trade (12 % off): £Y
- Delivery: £Z (estimated)

### Jewson — no account
- Order by: <date>  ...

(repeat per merchant)

## By stage (cross-reference to schedule.md)

| Stage  | Merchant         | Delivery window     | Status         |
|--------|------------------|---------------------|----------------|
| STG-04 | Travis Perkins   | Week 2, Mon–Tue     | Order pending  |
| STG-05 | Jewson           | Week 3, Wed         | Order pending  |

## Cash-flow effect

- Total at list: £A
- Total at trade: £B
- Saved against list: £C
- Phased: <% by week>

## Open RFQs

- Howdens — kitchen carcasses (RFQ drafted)
- Edmundson — LV cable run (RFQ drafted, awaiting response)

## Risks

- (any items with `low-stock`, `made-to-order`, or `unknown` stock status)
- (any specialist items without a named supplier)
```

The buying plan is the document the user prints, takes to their van, and works from for the week.

---

## Lead-time arithmetic

Site dates drive purchase dates, not the other way round. For each row:

```
order_by_date = site_required_date − lead_days − buffer_days
```

Default `buffer_days`:

- 1 day for in-stock items at a local trade counter
- 3 days for delivered orders from a national merchant
- 7 days for specialist / made-to-order
- 14 days for kitchens (Howdens / Magnet typical), bespoke joinery
- 21 days for imported / lead-time goods, made-to-measure glazing

If `order_by_date` falls in the past, flag the row **bright** in the buying plan: "Late — required by <site_required_date>; minimum lead means latest order is <calculated date>." Don't soften this — late material slips programmes.

---

## Working with a non-trade buyer

If the user is the end-customer (not the builder), the skill drops the "discount" column entirely and works on retail / list pricing. The structure of the buying plan is the same — only the price math is simpler. Don't pretend the customer has a trade account they don't.

---

## What this skill refuses to do

- **Submit anything to a supplier portal.** Filling forms on `travisperkins.co.uk`, `howdens.com`, or any merchant's online ordering system is SEND-tier. The skill writes drafts; the user sends.
- **Store account passwords or credit-card numbers.** Trade-account numbers (the merchant's reference for the user) are a borderline case — they live in `project.md` or `/workspace/<user>/accounts.md`, never in `memory_save`, never echoed unless the user explicitly approves it for a specific RFQ.
- **Invent prices.** A row with no priced source is `TBC`. A row with a 12-month-old price has its `fetched_at` updated only if the user re-fetches.
- **Bundle multiple clients into one buying plan.** One plan per project. If the user is buying materials for two jobs from one PO, they split the rows themselves.

---

## Bundled assets

- `references/uk-trade-counters.md` — full merchant map with regional notes
- `references/us-trade-counters.md` — US equivalents
- `references/rfq-template.md` — the RFQ template above
- `references/lead-time-defaults.md` — `lead_days` and `buffer_days` per domain
- `scripts/buying_plan.py` — reads `priced-bom.csv` + `schedule.md` overrides, renders `buying-plan.md`

## Why this skill is safe

It reads merchant product pages via the host-side `web_fetch` with SSRF protection. It writes only into `/workspace/<project>/sourcing/`. It produces drafts of RFQ emails but never sends. It does not handle the user's payment instrument — POs and invoices are between the user, their accountant, and the merchant.
