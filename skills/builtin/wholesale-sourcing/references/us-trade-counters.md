# US trade counters — merchant map

Default merchant map for the `wholesale-sourcing` skill in the US. User preferences in memory override these defaults.

## Heavy build — lumber, drywall, insulation, concrete, masonry

| Merchant                 | Region strength | Notes                                                              |
| ------------------------ | --------------- | ------------------------------------------------------------------ |
| Home Depot Pro           | National        | Pro Xtra account; volume discounts; bulk delivery.                |
| Lowe's Pro               | National        | Pro Loyalty program; price-match policy.                          |
| 84 Lumber                | Midwest & East  | Strong on framing lumber.                                          |
| US LBM yards (Banner, Wallboard Supply, etc.) | Regional | Use the local yard; the skill defers to user preference. |
| ABC Supply               | National        | Roofing, siding, windows — specialty wholesale.                   |

## Electrical wholesale — wire, fixtures, panels, breakers

| Merchant         | Region strength | Notes                                                       |
| ---------------- | --------------- | ----------------------------------------------------------- |
| Sonepar           | National        | Largest electrical wholesaler in the US.                   |
| WESCO / Anixter   | National        | Strong on commercial; good for high-end residential.       |
| Graybar           | National        | Industrial focus, but residential trade welcome.            |
| Rexel USA         | National        | International chain.                                        |

## Plumbing wholesale — pipe, fittings, fixtures

| Merchant         | Region strength | Notes                                                  |
| ---------------- | --------------- | ------------------------------------------------------ |
| Ferguson          | National        | Largest plumbing wholesaler.                          |
| HD Supply         | National        | Mid-tier wholesale.                                    |
| SupplyHouse       | National (online) | Strong for DIY-and-trade hybrid orders.              |
| Pace Supply       | West Coast      | Regional independent.                                  |

## Kitchen & bathroom

| Merchant         | Region strength | Notes                                                                          |
| ---------------- | --------------- | ------------------------------------------------------------------------------ |
| LMC (cabinet groups) | National   | Various member cabinet houses — defer to user's specific brand relationships.  |
| KraftMaid (Masco) | National       | Trade pricing through dealers.                                                 |
| Wellborn          | National        | Trade-only.                                                                    |
| IKEA Business     | National        | Trade discount on quantity.                                                    |
| Build.com         | National (online) | Wholesale on plumbing + lighting + kitchen.                                  |

## Decoration & finishes

| Merchant            | Region strength | Notes                                          |
| ------------------- | --------------- | ---------------------------------------------- |
| Sherwin-Williams    | National        | Trade discount via Pro account.                |
| Benjamin Moore      | National        | Trade-friendly independent dealers.            |
| PPG Paints          | National        | Strong commercial-trade pipeline.              |

## Consumables — fast pickup

| Merchant         | Region strength | Notes                                                  |
| ---------------- | --------------- | ------------------------------------------------------ |
| Home Depot       | National        | Always-open pickup.                                   |
| Lowe's           | National        | Same.                                                  |
| Grainger         | National        | Industrial-trade range, strong on MRO consumables.    |
| Northern Tool    | National        | Tool-focused; good for hand-tool top-ups.             |

## Tool hire

| Merchant         | Region strength | Notes                                                   |
| ---------------- | --------------- | ------------------------------------------------------- |
| United Rentals   | National        | Largest US rental fleet.                               |
| Sunbelt Rentals   | National        | Strong on plant + powered access.                      |
| Home Depot Rental | National        | Branch-level rental; consumer-grade equipment.         |

## Regulatory dimension (US)

Unlike the UK, US regulation is state-by-state for most trades:

- **Electrical license** — required by most states; the seat enters their state-license number in `USER.md.certifications.us_electrical_license_state`. The skill refuses notifiable electrical lines without it.
- **Plumbing license** — same pattern; varies by state and county.
- **HVAC / mechanical permit** — required for any new HVAC install. Local jurisdiction.
- **NEC (National Electrical Code)** — referenced for electrical citations.
- **IRC (International Residential Code)** — referenced for general residential build citations.

The skill flags state-level permit requirements but does not pull permits — that's an in-person act of the trade.
