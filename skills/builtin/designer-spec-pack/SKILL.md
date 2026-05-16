---
name: designer-spec-pack
description: Spec sheets, supplier comparisons, and client-facing proposal packs for interior, kitchen, and bathroom designers. Use when the user asks for a spec sheet, mood-board outline, supplier comparison, FF&E schedule, or client proposal — typically things like "spec the new master bathroom", "compare these three sofas", "build the proposal for the Smith project". Builds on home-build-shared.
version: 1.0.0
author: clawix-home-build
tags: [home, design, interior, kitchen, bathroom, ffe, proposal]
---

# Home Designer — Spec to Proposal

For an independent home designer or small studio. Covers:

1. **Spec sheet** — one product, one page, ready to share with a builder or supplier
2. **Supplier comparison** — three or four candidates lined up against the brief
3. **FF&E schedule** — the full project list, room by room
4. **Client proposal pack** — the document the customer signs

**Always read `home-build-shared` first** for units, costing, and client-data rules.

This skill produces designer-grade documents — the customer-facing tone matters. Plain English, no jargon, no padding.

---

## When to invoke

Trigger on: "spec sheet", "compare these <items>", "FF&E schedule", "build the proposal", "mood board outline", "supplier shortlist", "what should I quote for design fees".

The skill assumes you already have a brief from the client. If you don't, gather one first using `references/brief-questions.md`.

---

## Phase 1 — The brief

The brief is the spine — every later document references it. Write it to `/workspace/<project>/brief.md`.

Drive from `references/brief-questions.md` — it has the question set per project type (whole house, single room, kitchen, bathroom). Don't dump the whole list on the client; ask in three rounds:

1. **Functional** — who uses the room, what for, when, how often
2. **Aesthetic** — words for the feeling (calm, lively, formal, raw), colours they love, colours they hate, references they like
3. **Practical** — budget band, deadline, anything fixed (heritage features, a piece of art that must stay, a pet)

The brief is captured in plain English — no design vocabulary the client wouldn't use themselves. If they say "cosy", write "cosy" — don't translate to "Hygge-influenced".

---

## Phase 2 — Spec sheets

One product = one spec sheet. Render to `/workspace/<project>/specs/<slug>.md` using `assets/spec-sheet.template.md`.

Each spec sheet has:

- Hero photo (filename only — never embed binaries in the markdown; reference paths under `assets/`)
- One-line description
- Brand + product code + finish/colour
- Dimensions (W × D × H, plus any swing/clearance dimensions for doors and drawers)
- Materials (top, frame, upholstery)
- Care instructions
- Lead time + price + supplier link (with retrieval date in the footer)
- Substitutes (one or two, in case of stock issues)

The spec sheet is the **builder's** view of the product, not the customer's mood-board view. Builders need product code + dimensions + lead time. The customer view comes in Phase 4.

---

## Phase 3 — Supplier comparisons

When the client asks "which one should we go for?" between three candidates, render `/workspace/<project>/comparisons/<topic>.md`.

Use `references/comparison-template.md`. The format is a side-by-side table with one row per axis:

- Headline price
- Lead time
- Dimensions
- Material composition
- Country of manufacture
- Warranty
- Aftercare (returns policy, parts availability)
- Designer's note (one sentence — your professional view, not "all are great")

End with a **recommendation paragraph**. The client is paying for your opinion, not a menu.

---

## Phase 4 — FF&E schedule

The full project's specified items in one CSV. Schema:

```
room,position,category,brand,product,sku,finish,qty,unit_price,currency,line_total,supplier,lead_weeks,status,notes
```

Field rules:

- `room`: kitchen / master-bathroom / lounge / etc. (kebab-case)
- `position`: e.g. "above-island", "left-of-fireplace", "wall-mounted-ne-corner"
- `category`: lighting / furniture / soft-furnishing / sanitaryware / appliance / window-treatment / accessory / hardware
- `status`: one of `proposed`, `client-approved`, `ordered`, `delivered`, `installed`, `withdrawn`
- `lead_weeks`: weeks from order to delivery — **the single most important field for scheduling**

This file feeds two downstream things: the proposal pack (Phase 5) and the builder/installer's BoM (handed off to `device-install-survey` or `builder-takeoff`).

---

## Phase 5 — Client proposal pack

The customer-facing document. Render to `/workspace/<project>/proposal.md` using `references/proposal-structure.md`.

Structure (the client reads this front-to-back):

1. **Cover** — project name, client name, designer name, date, version
2. **One-paragraph summary of the design idea** — in the client's own language from the brief
3. **Room by room** — for each room: what's changing, why, what it'll feel like (no jargon)
4. **The look** — mood board references (filenames under `assets/moodboard/`), 4–8 images max
5. **The pieces** — selected products with one image + description + price (NOT the full spec sheet)
6. **Investment** — the costing build-up using the shared roll-up
7. **Programme** — when the design is locked, when items are ordered, when delivery happens, when install happens
8. **What's included in the design fee** — and what isn't (revisions, site visits, project management)
9. **Sign-off** — printed name + date

Designer fees — typical structures:

| Structure          | When it fits                                     |
| ------------------ | ------------------------------------------------ |
| Fixed fee          | Single room with a clear scope                   |
| % of project value | Whole-house projects with build budget over £75k |
| Hourly             | Consultancy, advisory work, partial scope        |
| Per-room flat fee  | Kitchen / bathroom only                          |

Recommend, but never pick the structure for the user — pricing is their relationship with the client.

---

## Bundled assets

- `assets/spec-sheet.template.md` — single-product spec template
- `assets/moodboard/.gitkeep` — convention for where mood-board images live

## References

- `references/brief-questions.md` — question bank by project type
- `references/comparison-template.md` — supplier-comparison template
- `references/proposal-structure.md` — full proposal walk-through

## What this skill won't do

- It won't produce mood-board images. Those are sourced from the user's library or licensed image services. The skill records filenames; it does not generate images.
- It won't quote on someone else's labour without confirmation. If the proposal includes install, hand the builder/installer view off to `builder-takeoff` or `device-install-survey` — the designer's quote covers design fee + product, not third-party trade work.
