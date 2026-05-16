---
name: builder-takeoff
description: Material take-off, wholesale pricing, schedule of works, and day-rate labour planning for small builders and renovation outfits (1–10 staff). Use when the user asks for a quote, needs a BoM from drawings or a scope description, wants a schedule of works, asks "what should I charge for this", or mentions trade counters like Travis Perkins, Jewson, MKM, Selco. Builds on home-build-shared.
version: 1.0.0
author: clawix-home-build
tags: [home, construction, builder, takeoff, quote, schedule]
---

# Small Builder — Take-off to Schedule

For a 1–10 person general contractor or renovation outfit. Covers:

1. **Take-off** — extract a quantified material list from the user's scope description, sketch, or drawing
2. **Pricing** — wholesale prices from named trade counters
3. **Quote** — costed proposal using the shared roll-up
4. **Schedule of works** — week-by-week sequence with crew + dependencies

**Always read `home-build-shared` first** for units, BoM schema, costing roll-up, and client-data rules.

---

## When to invoke

Trigger on: "take off this scope", "what materials do I need for X", "build a quote for", "schedule of works", "how many days for", "what's the labour for", "compare Travis Perkins to Jewson", "what would a kitchen extension cost".

If the user pastes architect's drawings or a scope sheet, this is the skill.

---

## Phase 1 — Scope & take-off

### Capture the scope first

Ask the user to confirm in their own words. A take-off built off a fuzzy scope is worse than no take-off — it gets quoted, then re-quoted at change-order time, and the relationship goes sour.

The scope record (write to `/workspace/<project>/scope.md`) needs:

- One-paragraph description in the customer's own language
- Inclusions list (what we're doing)
- Exclusions list (what we're not — usually decorating, FF&E, soft furnishings, appliances unless specified)
- Drawings / photos referenced (filename + version)
- Any provisional sums (PC sums) — items priced by allowance, not measure (e.g. "PC sum £3,000 for kitchen taps and sink, customer choice")

### Then take off

Walk the scope room-by-room or trade-by-trade — pick whichever matches the drawings. For each item:

1. Identify the material category (`references/material-categories.md` — has the canonical list)
2. Measure the quantity in the right unit (m, m², m³, each)
3. Apply waste from `home-build-shared/references/waste-allowances.md`
4. Add to `bom.csv` per the canonical schema

**Common take-off pitfalls (don't make these):**

- Forgetting fixings, sealants, and adhesives — every plasterboard ceiling needs screws + scrim + filler + tape; quote them separately
- Forgetting wastage on offcuts — see waste table
- Forgetting plant hire — skip, scaffold, dehumidifier, mixer; these go in their own `plant.csv` with day-rate
- Forgetting first-fix vs second-fix — a kitchen has two visit-loads of plumbing and electrics, not one
- Forgetting access — second-floor work or no driveway parking changes the labour day count

### Plant hire

Goes in `/workspace/<project>/plant.csv`, same schema as `bom.csv` but `unit` is always `day`. Roll into the quote as a separate sub-total so the customer sees it.

---

## Phase 2 — Wholesale pricing

### Where to look (UK)

| Counter             | Best for                                   | Account benefit                          |
| ------------------- | ------------------------------------------ | ---------------------------------------- |
| Travis Perkins      | Heavy materials, timber, insulation        | Trade account = ~10–15 % off list        |
| Jewson              | Same range as TP, often better in N England| Trade account                            |
| MKM                 | Mixed; strong in groundworks               | Trade account                            |
| Selco               | Cash-and-carry, fast pickup                | Trade card; lower margin                 |
| Howdens             | Kitchens, doors, flooring                  | Trade-only; pricing on application       |
| Wickes              | Mid-range materials, retail-priced         | Trade discount card                      |
| Screwfix / Toolstation | Consumables, tools, electrical, plumbing | Click-and-collect 1 minute               |
| CEF / Edmundson / Rexel | Electrical wholesale                  | Trade only                               |
| Plumb Center / Wolseley | Plumbing wholesale                    | Trade only                               |

### Sourcing rules

- Use `web_search` to find the supplier's product page; `web_fetch` to read the live list price.
- **Quote at list price** unless the user has confirmed their trade discount in writing (saved in memory as e.g. "user has 12 % off TP list"). Customer sees list, you keep the discount as margin or pass some on — that's a business decision, not the bundle's call.
- One supplier per row. If you compare two suppliers, that's two rows in `bom.csv` with one marked `notes: alternate quote`.

### When the user has trade-counter export

If the user pastes a Travis Perkins / Jewson cart export, parse it directly into `bom.csv` rather than re-pricing line-by-line. Always cite the cart reference + export date in `notes`.

---

## Phase 3 — Quote

Run `bom_aggregator.py`, then build `quote.md` with the costing stack from `home-build-shared/references/cost-rollup-method.md`.

A small builder quote needs:

- Project description (one paragraph, customer's language)
- Inclusions / exclusions (verbatim from `scope.md`)
- The line-by-line build-up
- Payment schedule (typically 25 % deposit on order, 25 % on first-fix complete, 25 % on second-fix, 25 % on snag-list signed off — vary per job size)
- Programme (start date, expected duration, key dependencies on customer decisions)
- Validity (typically 30 days for prices, 90 days for the rest)
- T&Cs reference (don't paste your full T&Cs into the quote — link to a separate `terms.md`)

Render in plain Markdown — let the user convert to PDF / Word in their own toolchain.

---

## Phase 4 — Schedule of works

Build `/workspace/<project>/schedule.md` as a week-by-week table. Use `references/schedule-template.md`.

Sequencing rules:

1. Strip-out and protection first
2. Structural / first-fix carpentry
3. First-fix M&E (electrics, plumbing, HVAC) — these depend on the structure, so always after carpentry
4. Plastering — needs first-fix done and signed off
5. Drying time (1 mm per day rule of thumb for skim, faster with dehu) — this is real time on the programme
6. Second-fix carpentry (architraves, skirtings, doors)
7. Second-fix M&E (sockets, switches, sanitaryware, taps)
8. Decoration
9. Snagging

For each week, the schedule lists: **trade on site / what they're doing / what they need to be ready / what comes after them**.

Customer decisions go on the schedule too — "Week 4: customer must have selected tiles by end of week or week 6 slips."

---

## Day-rate planning

Default UK day rates (confirm with the user — these vary regionally):

| Trade            | Day rate (GBP) | Notes                                              |
| ---------------- | -------------- | -------------------------------------------------- |
| Labourer         | 150–180        |                                                    |
| Carpenter        | 220–280        | First-fix lower end, second-fix top end            |
| Plasterer        | 250–300        | + skimming work in m² for piecework jobs           |
| Tiler            | 220–300        | + £/m² for large bathrooms                         |
| Painter          | 180–230        |                                                    |
| Electrician      | 280–350        | + Part P certification work charged separately     |
| Plumber          | 280–350        |                                                    |
| Bricklayer       | 250–300        | + £/1000 for piecework                             |
| Groundworker     | 220–280        |                                                    |
| Site manager     | 300–400        | Often the user themselves on small jobs            |

For each crew member, multiply day rate × days on site (from the schedule). Record the assumption — the user can override per project.

---

## Bundled scripts and references

- `scripts/quote_builder.py` — reads `bom.csv` + `plant.csv` + a small JSON of overrides (margin %, VAT %, day-rate map), renders `quote.md`
- `references/material-categories.md` — canonical category list for take-offs
- `references/schedule-template.md` — week-by-week table template
- `references/scope-template.md` — scope.md template
