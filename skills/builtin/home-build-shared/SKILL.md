---
name: home-build-shared
description: Shared conventions for any home-build, install, or design task — units, costing roll-up, client-data handling, and a Bill-of-Materials aggregator. Use whenever you need to convert measurements, total a parts list, mark up a cost, or write/read client records before invoking a role-specific skill (device-install-survey, builder-takeoff, designer-spec-pack).
version: 1.0.0
author: clawix-home-build
tags: [home, construction, shared, costing, gdpr]
---

# Home Build — Shared Layer

This skill is the foundation the three role skills sit on:

- `device-install-survey` — installers
- `builder-takeoff` — small builders
- `designer-spec-pack` — home designers

Read this skill **first** any time you handle measurements, prices, or client information. The role skills assume the conventions below.

---

## When to invoke

Trigger on any of: "convert mm to inches", "what's the total cost", "build me a BoM", "sum these line items", "anonymise this client list", "what margin should I add", "what units do I write the quote in".

If the task is end-to-end (e.g. "quote a kitchen install"), read this skill **and** the matching role skill.

---

## Hard rules

1. **Never write outside `/workspace/`.** All intermediate files (BoMs, quotes, drafts) go under `/workspace/<project-slug>/`. Use kebab-case slugs derived from the project name. The container's rootfs is read-only — writes elsewhere will fail loudly, which is the intended signal.
2. **Never invent a price.** If a unit price is missing, leave the cell as `TBC` and add a note. Use `web_search` / `web_fetch` only for **published list prices** from named suppliers (Screwfix, Toolstation, Wickes, Travis Perkins, Build It Direct, Home Depot, etc.). Cite the URL and the date.
3. **Never store raw personal data in memory.** Names, addresses, phone numbers, emails, photos of people belong in `/workspace/<project>/clients/` files only. Use `memory_save` for project metadata (slug, scope, total budget) — never for the client identity.
4. **All money strings carry their currency.** `£1,250.00`, `$1,250.00`, `€1.250,00` — never a bare number.
5. **All measurements carry their unit.** `2.4 m`, `94.5 in`, `12 m²`. Convert to one canonical unit per project (declared in the project header) before totalling.

---

## Project skeleton

When you start a new project, scaffold this structure:

```
/workspace/<project-slug>/
├── project.md              # one-pager: client, address (postcode only), scope, currency, units, status
├── clients/                # full client record — never copied elsewhere
│   └── client.md
├── bom.csv                 # Bill of Materials (see schema below)
├── quote.md                # rendered quote (built from bom.csv + margin)
├── drawings/               # uploaded floor plans, photos, sketches
└── notes/                  # site notes, call logs, decisions
```

Use the `bom_aggregator.py` script to roll `bom.csv` into a totals block. Use the `unit_convert.py` script for any unit math — never do it in your head.

---

## Bill of Materials — canonical schema

`bom.csv` has exactly these columns, in this order:

```
sku,description,supplier,unit,qty,unit_price,currency,line_total,notes
```

Field rules:

| Column        | Rule                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| `sku`         | Supplier SKU if known, else `n/a`. Never blank.                                     |
| `description` | Plain English; no marketing copy.                                                   |
| `supplier`    | One named supplier per row. If unknown, write `unspecified`.                        |
| `unit`        | One of: `each`, `m`, `m2`, `m3`, `kg`, `l`, `hr`, `day`. No abbreviations.          |
| `qty`         | Number, two decimals max.                                                           |
| `unit_price`  | Number, two decimals; or the literal string `TBC`.                                  |
| `currency`    | ISO 4217 (`GBP`, `USD`, `EUR`). One currency per file.                              |
| `line_total`  | `qty * unit_price` rounded to 2 dp; `TBC` if `unit_price` is `TBC`.                 |
| `notes`       | Source URL + retrieval date for any priced row, or any clarifying note. Optional.   |

The aggregator script enforces this schema and refuses to total a file that breaks it.

---

## Costing roll-up

After the line totals are summed, apply this stack in order:

```
Materials subtotal
+ Waste allowance (5–10 % depending on trade — see references/waste-allowances.md)
+ Labour (from day-rate × days, OR labour-only line items in BoM)
+ Markup (small builder default 20 %; designer default 25–35 %; installer default 15 %)
+ VAT or sales tax (apply per jurisdiction; UK standard 20 %; some jobs 5 % or 0 %)
= Quote total
```

Always show every line of the stack in the quote — the customer sees the build-up, not a single number.

---

## Client data handling (GDPR-aligned)

This bundle handles small-business client records. The minimum bar:

- **Lawful basis:** record it in `clients/client.md` under "Lawful basis: contract" (the default for an installer/builder/designer engagement).
- **Data minimisation:** collect only what the job needs — full address only if you're attending site, phone only if you're calling, email only if you're sending the quote.
- **Retention:** state a retention period in the client file. Suggested defaults: 6 years post-completion for accounting (UK), 7 years (US). Anything longer needs a stated reason.
- **No bulk export:** never produce a single file that lists multiple clients side-by-side unless the user explicitly requests it (e.g. "export my client list for backup").
- **Anonymisation on share:** if asked to share a quote, BoM, or report outside the project (e.g. "post this to forum X"), strip the client name, full address, phone, and email first. Replace with `[client]`, `[postcode-area]`, etc.

See `references/client-data-handling.md` for the full template and the questions to ask the user when in doubt.

---

## When to use which web tool

- `web_search` — to discover suppliers, find product pages, locate technical datasheets. Treat results as leads, not facts.
- `web_fetch` — to pull the actual product page once you know the URL. Read price, lead time, datasheet links from the page itself, not from the search snippet.

Both run host-side with SSRF protection — internal IPs, loopback, and link-local addresses are blocked. Don't try to work around this; if a supplier site is genuinely unreachable, report that and ask the user.

---

## Bundled scripts

- `scripts/bom_aggregator.py` — validates and totals a BoM CSV. Run with: `python3 /skills/builtin/home-build-shared/scripts/bom_aggregator.py /workspace/<project>/bom.csv`
- `scripts/unit_convert.py` — converts between metric and imperial. Run with: `python3 /skills/builtin/home-build-shared/scripts/unit_convert.py 2.4 m to ft`

Both scripts are deterministic and side-effect-free (read input, print output) — safe to call as often as needed.

## References

- `references/client-data-handling.md` — full GDPR-aligned template
- `references/waste-allowances.md` — typical waste % per trade
- `references/cost-rollup-method.md` — worked example of the costing stack
