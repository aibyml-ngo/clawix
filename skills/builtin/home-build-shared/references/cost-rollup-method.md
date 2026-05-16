# Cost Roll-up — Worked Example

A single-room kitchen tile job, GBP, UK VAT 20 %.

## bom.csv (excerpt)

```
sku,description,supplier,unit,qty,unit_price,currency,line_total,notes
TIL-200x200-WHT,200x200 white wall tile,Topps Tiles,m2,18.50,32.99,GBP,610.32,https://example/...
ADH-FLEX-20,Flexible tile adhesive 20kg,Wickes,each,5,22.40,GBP,112.00,https://example/...
GRT-WHT-3,Grout white 3kg,Wickes,each,3,9.50,GBP,28.50,https://example/...
TRM-SLV-2.5,Aluminium edge trim 2.5m,Topps Tiles,each,4,7.20,GBP,28.80,https://example/...
LAB-TIL-DAY,Tiler day rate,n/a,day,3,280.00,GBP,840.00,confirmed with user
```

## Roll-up

```
Materials subtotal             £   779.62
+ Waste @ 10 % (wall tiles)    £    77.96    # see references/waste-allowances.md
                              ─────────────
Materials with waste           £   857.58

Labour subtotal                £   840.00    # 3 days @ £280

Build cost                     £ 1,697.58

+ Markup @ 20 %                £   339.52
                              ─────────────
Sub-total                      £ 2,037.10

+ VAT @ 20 %                   £   407.42
                              ─────────────
Quote total                    £ 2,444.52
```

## Rendering

Show **all** lines in the customer-facing quote.md, not just the bottom number. Customers buy the build-up, not the headline.

If the customer is registered VAT-able (B2B, common for landlords and developers), drop the VAT line and add a note: "Excludes VAT — invoice will be raised plus VAT at the prevailing rate."

If the job qualifies for reduced-rate VAT (e.g. UK 5 % for some renovations of empty homes, energy-saving installs), state the rate and the basis explicitly: "VAT @ 5 % under VAT Notice 708 §8.1 (energy-saving materials)".

Do not guess the VAT rate. If unclear, leave the line as `VAT: TBC — confirm with accountant` and tell the user.
