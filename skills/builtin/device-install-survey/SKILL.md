---
name: device-install-survey
description: End-to-end workflow for home device installers — smart-home, AV, CCTV, network, EV chargers, heat pumps, alarms, lighting. Use when the user describes a site visit, asks for an install BoM/quote, wants a pre-install checklist, needs a commissioning report, or says things like "I'm fitting X at Y, what do I need". Builds on home-build-shared.
version: 1.0.0
author: clawix-home-build
tags: [home, install, smart-home, av, network, cctv, ev]
---

# Device Install — Survey to Sign-off

For installers fitting devices in occupied or new-build homes. Covers the four phases:

1. **Survey** — gather what's at the site before quoting
2. **Bill of Materials** — devices + accessories + consumables
3. **Install checklist** — pre-arrival, on-site, before-leaving
4. **Commissioning report** — what was installed, how it was tested, what the customer signed off

**Always read `home-build-shared` first** — it owns units, BoM schema, costing, and client-data rules. This skill assumes those.

---

## When the user starts a new install job

Ask in this order, one at a time:

1. **What are you fitting?** (e.g. "Hue lighting in 3 rooms + a Sonos Arc + a Ring doorbell")
2. **Where?** (postcode + property type — flat, semi, detached, new-build, listed)
3. **What's there now?** (existing wiring, network, hub, smart speakers — anything we'll integrate or replace)
4. **Who is paying and who is the occupant?** (sometimes different — landlord vs tenant; consent flows differ)

Then scaffold the project per `home-build-shared` and start the survey.

---

## Phase 1 — Survey

Drive to one of the survey templates in `references/` based on category:

| Category                    | Template                                        |
| --------------------------- | ----------------------------------------------- |
| Smart lighting / switches   | `references/survey-smart-lighting.md`           |
| AV (TVs, speakers, projectors) | `references/survey-av.md`                    |
| CCTV / doorbell / alarm     | `references/survey-security.md`                 |
| Network (Wi-Fi, mesh, AP)   | `references/survey-network.md`                  |
| EV charger                  | `references/survey-ev-charger.md`               |
| Heat pump (ASHP)            | `references/survey-heat-pump.md`                |

Each template lists the questions and the photos to ask the user to upload. Save the user's responses + photo filenames into `/workspace/<project>/survey.md`.

If the user can't physically attend, build the survey from photos + a video walk-through. State the assumptions in `survey.md` and flag them as `[assumed]` so the customer sees what hasn't been verified.

---

## Phase 2 — Bill of Materials

Three categories per BoM, in this order, using the canonical `bom.csv` schema from `home-build-shared`:

1. **Primary devices** — the things being fitted (hub, switches, speakers, cameras, charger, etc.)
2. **Accessories** — mounts, brackets, PSUs, faceplates, in-wall back-boxes, ethernet patch leads, HDMI, screws/anchors
3. **Consumables** — cable (per-metre), trunking, gland, sealant, cable clips, P-clips, fire-rated foam

Do **not** mix in labour lines yet — labour goes in a separate roll-up unless the user explicitly wants a single-document quote (then add `LAB-INST-DAY` rows last).

### Sourcing rules

- Prefer authorised distributors for branded gear (Philips Hue → Signify-authorised retailer; Ring → Amazon official; Sonos → Sonos.com / John Lewis / RS Pro). Avoid grey-market sellers — warranty is at risk.
- For consumables, default to the user's preferred trade counter (saved in memory if known) — Screwfix, Toolstation, CEF, Edmundson, Rexel.
- Use `web_fetch` to confirm the live price on the supplier page. Note the URL + retrieval date in the BoM `notes` column.

### Quantity rules of thumb

- Cat6 cable: route length × 1.15 + 1 m at each end.
- Speaker cable: same as Cat6 + 0.5 m for an in-wall back-loop.
- HDMI runs over 5 m: use a fibre-HDMI rather than a passive copper run, and add a power injector for the source-side adapter if the spec calls for it.
- Fixings: round up to the next pack of 10 / 25 / 100.

---

## Phase 3 — Install checklist

Three lists, generated into `/workspace/<project>/install-checklist.md`:

### Pre-arrival (the day before)

- All BoM items received and unboxed-checked (no missing parts)
- Tools: ladder, drill + bits, fish tape, multimeter, label printer, IPA wipes
- Test devices powered up and firmware-updated on the bench where possible
- Confirmed parking + access window with the customer
- Confirmed the homeowner has a working Wi-Fi password and the router is reachable

### On-site (in order)

- Take "before" photos of every wall, socket, and ceiling you'll touch. Save under `/workspace/<project>/photos/before/`.
- Isolate power at the consumer unit for any mains work. Put a lock-off and a sign on the breaker.
- Run any cables before you make a single hole — rope-route and check from both ends.
- For each device: mount → terminate → power → join network → label.
- Take "after" photos of every install location. Save under `/workspace/<project>/photos/after/`.

### Before leaving (the customer-facing checklist)

- Every device responding (smoke-test from the customer's phone)
- Every device labelled (visible cable label + entry in the customer's network map)
- Customer can do the three core operations: power on/off, control from their phone, factory-reset if it goes wrong
- Old packaging removed (or left tidy, with the customer's permission)
- Walk-through complete and customer has signed `commissioning.md`

---

## Phase 4 — Commissioning report

Write `/workspace/<project>/commissioning.md` from `references/commissioning-template.md`. Minimum content:

- What was fitted (one row per device, with serial + firmware)
- Where it was fitted (room, position, photo path)
- How it was tested (the procedure, not just "tested OK")
- Customer sign-off block — printed name + date

This document is the warranty trigger and the dispute defence. Do **not** skip the test procedures — write down what was actually checked.

---

## Compliance reminders (don't enforce, but flag)

- **UK Part P (electrical):** any new circuit or work in a special location (kitchen, bathroom) is notifiable. If the user describes work that crosses this line and they're not Part P-registered, flag it and suggest sub-contracting the consumer-unit side.
- **UK gas:** anything connecting to a gas appliance is Gas Safe only. Refuse to BoM gas work; offer to help the customer find a Gas Safe engineer.
- **EV charger (UK):** OZEV grant rules + DNO notification for >32 A loads — flag both. Many chargers need a CT clamp and Earth-rod survey.
- **Heat pump (UK):** MCS-certified install needed for BUS grant. Refuse to BoM the install if the user isn't MCS-certified; offer to BoM the prep work only.

You are not the regulator — you flag, the user decides.

---

## Bundled assets

- `assets/install-report.template.md` — drop-in template for the customer-facing report
- `references/commissioning-template.md` — full commissioning sheet
- `references/survey-*.md` — one per device category

## Why this skill is safe

Stays inside `/workspace/<project>/`. Reads supplier pages via host-side `web_fetch` (SSRF-protected). Never asks for or stores card details, payment details, or customer ID documents — installers don't need those, and the bundle won't accept them.
