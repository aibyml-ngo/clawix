# Lead-time defaults

Defaults for `lead_days` and `buffer_days` used by the `wholesale-sourcing` skill when computing `order_by_date`.

Where the merchant's product page states a lead, that takes precedence. These defaults apply only when the page is silent or unreachable.

## Lead-day defaults by domain

| Domain               | Typical lead (days) | Notes                                                            |
| -------------------- | ------------------- | ---------------------------------------------------------------- |
| `consumables-fast`   | 0                   | Click-and-collect in 1 minute at Screwfix / Toolstation.        |
| `heavy-build`        | 3                   | National yard delivery; faster on common items.                  |
| `electrical-trade`   | 2                   | Trade-counter pickup or next-day delivery.                      |
| `plumbing-trade`     | 2                   | Trade-counter pickup or next-day delivery.                      |
| `decor-finishes`     | 1                   | Local decorating centre pickup.                                 |
| `tool-hire`          | 0                   | Same-day or next-day delivery for plant.                        |
| `kitchen-bathroom`   | 14                  | Howdens 1–2 weeks for stocked carcasses; longer for special.    |
| `kitchen-bathroom` (bespoke worktops) | 21      | Stonemason / fabricator typical.                                 |
| `specialist`         | varies              | Marked TBC until the supplier responds to the RFQ.              |

## Buffer-day defaults

The buffer is added on top of the lead to absorb supplier hiccups (delivery driver, stock check, partial-pick problems). It is added to the order-by calculation so the materials arrive comfortably before the site stage.

| Source                                  | Buffer (days) | Notes                                                 |
| --------------------------------------- | ------------- | ----------------------------------------------------- |
| Local trade counter, in-stock pickup    | 1             | Real buffer is your van schedule, not the supplier.  |
| National merchant, delivered            | 3             | Driver re-route, partial-pick, signature window.     |
| Specialist / made-to-order              | 7             | Workshop slot, manufacturing variance.               |
| Kitchens (Howdens, Magnet, etc.)        | 14            | Quality-check, delivery slot, missing-item return.   |
| Imported / made-to-measure (glazing, stone) | 21        | Shipping or production delay buffer.                 |

## Order-by date math

```
order_by_date = site_required_date − lead_days − buffer_days
```

If `order_by_date` is in the past, the row is flagged **bright** in the buying plan:

> ⚠ Late — minimum lead means the latest order is <date>, but it is now <today's date>. Either accept the slip and reschedule the site stage, or pay for expedited delivery (where available).

The bundle does not offer to "pay for expedited delivery" itself — that's a phone call from the user to their merchant.

## What overrides the defaults

In priority order:

1. The merchant's product-page-stated lead, as parsed by `supplier-pricer`.
2. The user's confirmed lead from a memory item (e.g. "user knows TP delivers in 24 h to this postcode area").
3. A per-project override in `project.md` (rarely used; mostly for atypical job conditions).
4. These domain defaults.

## What this file is not

It is not a guarantee. Lead times slip. Stock runs out. Drivers reroute. The buying plan exists because expecting slippage is sane planning — the buffer is real, not theatrical.
