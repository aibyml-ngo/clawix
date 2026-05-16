# UK trade counters — merchant map

Default merchant map for the `wholesale-sourcing` skill in the UK. The skill consults this file to propose a merchant per BoM row. User preferences in memory (e.g. "user prefers Jewson for timber in M3") override these defaults.

## Heavy build — timber, plasterboard, insulation, sand, cement, aggregate, bricks, blocks

| Merchant         | Region strength | Notes                                                                |
| ---------------- | --------------- | -------------------------------------------------------------------- |
| Travis Perkins   | National        | Largest national chain. Trade discount typical ~10–15 % off list.    |
| Jewson           | National (stronger in N England) | Same range as TP. Strong yards in Yorkshire, NW, NE.         |
| MKM              | National (mid-strength)          | Independent franchise model; quality varies by branch.       |
| Selco            | England & Wales | Cash-and-carry, trade only. Fast pickup, lower margin on consumables. |
| Buildbase        | National        | Owned by Grafton (same group as Selco). Mid-sized branches.          |
| Frasers Builders Merchants | Scotland | Scottish independent — strong in central belt.                     |

## Electrical wholesale — cable, fittings, MCBs, consumer units, conduit

| Merchant                    | Region strength | Notes                                                      |
| --------------------------- | --------------- | ---------------------------------------------------------- |
| CEF (City Electrical Factors) | National      | Largest electrical wholesaler. Account required.           |
| Edmundson Electrical        | National        | Strong on industrial; good for premium gear.              |
| Rexel                       | National        | International chain; consistent stock.                     |
| YESSS Electrical            | National        | Smaller chain, trade-friendly.                             |
| WF Electrical (Wilts)       | South-West      | Regional strength.                                          |

## Plumbing wholesale — pipe, fittings, valves, soil, traps

| Merchant         | Region strength | Notes                                                  |
| ---------------- | --------------- | ------------------------------------------------------ |
| Plumb Center     | National        | Owned by Wolseley. Most plumbers' default.            |
| Wolseley         | National        | Parent of Plumb Center; also has Drain Center, Heat & Plumb. |
| Williams         | National        | Strong on commercial sanware.                          |
| Plumbase         | National        | Mid-range trade counter.                               |
| City Plumbing    | National        | Owned by Highbourne Group.                             |
| Graham           | National        | Owned by Saint-Gobain.                                 |

## Kitchen & bathroom

| Merchant         | Region strength | Notes                                                  |
| ---------------- | --------------- | ------------------------------------------------------ |
| Howdens          | National (~800 branches) | Trade-only. Pricing on application. Cabinet quality strong. |
| Magnet Trade     | National        | Trade-side of the retail brand. Similar to Howdens.    |
| Wren Trade       | National        | Trade pricing on the retail catalogue.                 |
| B&Q TradePoint   | National        | Mid-range. Good for top-up consumables on a kitchen job. |

## Decoration & finishes

| Merchant                       | Region strength | Notes                                        |
| ------------------------------ | --------------- | -------------------------------------------- |
| Brewers Decorator Centres      | National (London-strong) | Trade-grade paints, fillers, masking. |
| Dulux Decorator Centre         | National        | Akzo-owned; Dulux trade range.              |
| Crown Decorating Centre        | National        | Crown Trade range; smaller network.         |
| Johnstone's Decorating Centres | National        | PPG-owned; mid-range commercial.            |

## Consumables — fast pickup

| Merchant      | Region strength | Notes                                                       |
| ------------- | --------------- | ----------------------------------------------------------- |
| Screwfix      | National (700+) | Click-and-collect in 1 minute. Owned by Kingfisher.        |
| Toolstation   | National        | Same parent as Screwfix; smaller network, slightly cheaper. |

## Tool hire

| Merchant      | Region strength | Notes                                                |
| ------------- | --------------- | ---------------------------------------------------- |
| HSS Hire      | National        | Largest national; strong on plant hire.             |
| Speedy Hire   | National        | Strong on plant + powered access.                   |
| Brandon Hire Station | National | Owned by Wolseley. Trade-friendly accounts.            |
| Hewden        | National (regional independents) | Various regional networks.                   |

## Specialist

Specialist items are never auto-assigned. The `wholesale-sourcing` skill routes them to an RFQ pack (Phase 4) with the user filling in the supplier name.

Common specialists for home-build jobs:

- Bespoke joinery — local cabinet maker
- Stone (worktops, hearths) — local stonemason
- Structural steel — local fabricator
- Glazing (made-to-measure) — local glazier
- Smart-home hub & EV charger — manufacturer's authorised distributor list
- ASHP / solar — MCS-certified install partner
- Reclaimed materials — local salvage yard

## Regional weighting

The skill weights merchant suggestions by postcode area:

- **London / South-East**: TP and Plumb Center dominant; CEF and Edmundson for electrical; Brewers for decoration.
- **Midlands**: MKM strong; Selco strong for cash-and-carry; Jewson and TP both common.
- **North-West / North-East / Yorkshire**: Jewson and MKM dominant; YESSS strong for electrical.
- **South-West**: Buildbase common; CEF; WF Electrical for niche.
- **Scotland**: Frasers and Buildbase strong; City Plumbing dominant in plumbing; Rexel for electrical.
- **Wales**: Selco strong in the south; Jewson coverage patchy.
- **Northern Ireland**: separate market — Murdock Builders Merchants and TG Eakin dominate. Skill flags the region for manual confirmation.
