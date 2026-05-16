#!/usr/bin/env python3
"""
bom_aggregator.py — validate and total a Bill-of-Materials CSV.

Schema (enforced):
    sku,description,supplier,unit,qty,unit_price,currency,line_total,notes

Rules:
    - One currency per file.
    - `unit` must be one of: each, m, m2, m3, kg, l, hr, day.
    - `unit_price` and `line_total` may be the literal string "TBC".
    - `line_total` is recomputed and compared to the file value (warn on drift).

Usage:
    python3 bom_aggregator.py <path/to/bom.csv>

Exit codes:
    0  — valid, totals printed
    1  — schema violation
    2  — file not found / unreadable
"""

from __future__ import annotations
import csv
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

REQUIRED_COLUMNS = [
    "sku", "description", "supplier", "unit",
    "qty", "unit_price", "currency", "line_total", "notes",
]
ALLOWED_UNITS = {"each", "m", "m2", "m3", "kg", "l", "hr", "day"}
TBC = "TBC"


def fail(msg: str, code: int = 1) -> None:
    sys.stderr.write(f"[bom_aggregator] error: {msg}\n")
    sys.exit(code)


def to_decimal(value: str, *, allow_tbc: bool, row: int, col: str) -> Decimal | None:
    if allow_tbc and value.strip() == TBC:
        return None
    try:
        return Decimal(value.strip())
    except (InvalidOperation, AttributeError):
        fail(f"row {row}: column '{col}' is not a number ('{value}')")


def main(path: str) -> None:
    p = Path(path)
    if not p.is_file():
        fail(f"file not found: {path}", code=2)

    with p.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames != REQUIRED_COLUMNS:
            fail(
                "header mismatch.\n"
                f"  expected: {REQUIRED_COLUMNS}\n"
                f"  got:      {reader.fieldnames}"
            )

        rows = list(reader)

    if not rows:
        fail("BoM is empty — nothing to total")

    currencies = {r["currency"].strip() for r in rows}
    if len(currencies) != 1:
        fail(f"multiple currencies in one file: {sorted(currencies)}")
    currency = currencies.pop()

    materials_subtotal = Decimal("0.00")
    labour_subtotal = Decimal("0.00")
    tbc_lines = 0
    drift_warnings: list[str] = []

    for i, r in enumerate(rows, start=2):  # row 1 is header
        unit = r["unit"].strip()
        if unit not in ALLOWED_UNITS:
            fail(f"row {i}: unit '{unit}' not in allowed set {sorted(ALLOWED_UNITS)}")

        qty = to_decimal(r["qty"], allow_tbc=False, row=i, col="qty")
        unit_price = to_decimal(r["unit_price"], allow_tbc=True, row=i, col="unit_price")

        if unit_price is None:
            tbc_lines += 1
            continue

        computed = (qty * unit_price).quantize(Decimal("0.01"))
        stated = to_decimal(r["line_total"], allow_tbc=True, row=i, col="line_total")
        if stated is not None and stated != computed:
            drift_warnings.append(
                f"  row {i}: line_total drift — computed {computed}, file says {stated}"
            )

        if unit in {"hr", "day"}:
            labour_subtotal += computed
        else:
            materials_subtotal += computed

    print(f"BoM: {p}")
    print(f"  Currency:           {currency}")
    print(f"  Lines:              {len(rows)} ({tbc_lines} TBC)")
    print(f"  Materials subtotal: {materials_subtotal:.2f} {currency}")
    print(f"  Labour subtotal:    {labour_subtotal:.2f} {currency}")
    print(f"  Combined:           {materials_subtotal + labour_subtotal:.2f} {currency}")

    if drift_warnings:
        print("\nLine-total drift detected (file values out of sync with qty * unit_price):")
        for w in drift_warnings:
            print(w)
        print("\nFix the line_total column or rebuild the BoM.")

    if tbc_lines:
        print(
            f"\nNote: {tbc_lines} line(s) priced TBC — totals are partial. "
            "Resolve TBCs before issuing a quote."
        )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        fail("usage: bom_aggregator.py <path/to/bom.csv>", code=1)
    main(sys.argv[1])
