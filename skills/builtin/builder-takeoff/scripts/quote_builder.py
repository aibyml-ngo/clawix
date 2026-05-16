#!/usr/bin/env python3
"""
quote_builder.py — render quote.md from bom.csv + optional plant.csv + overrides.

Usage:
    python3 quote_builder.py <project_dir> [--overrides overrides.json]

Where <project_dir> contains:
    project.md      (header — title, client, currency etc.)
    bom.csv         (canonical schema from home-build-shared)
    plant.csv       (optional — same schema, units always 'day')

overrides.json (optional):
    {
      "waste_pct": 7,
      "markup_pct": 20,
      "vat_pct": 20,
      "validity_days": 30
    }

Writes quote.md to <project_dir>/quote.md. Refuses to overwrite a quote.md
that contains the line "STATUS: SENT" — the user must explicitly delete or
mark it superseded before re-rendering.
"""

from __future__ import annotations
import argparse
import csv
import json
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

REQUIRED_COLUMNS = [
    "sku", "description", "supplier", "unit",
    "qty", "unit_price", "currency", "line_total", "notes",
]
DEFAULTS = {"waste_pct": 7, "markup_pct": 20, "vat_pct": 20, "validity_days": 30}


def fail(msg: str, code: int = 1) -> None:
    sys.stderr.write(f"[quote_builder] error: {msg}\n")
    sys.exit(code)


def load_csv(path: Path) -> tuple[list[dict[str, str]], str]:
    if not path.is_file():
        return [], ""
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames != REQUIRED_COLUMNS:
            fail(f"{path}: header mismatch. expected {REQUIRED_COLUMNS}")
        rows = list(reader)
    if not rows:
        return [], ""
    currencies = {r["currency"].strip() for r in rows}
    if len(currencies) != 1:
        fail(f"{path}: multiple currencies {sorted(currencies)}")
    return rows, currencies.pop()


def sum_lines(rows: list[dict[str, str]]) -> tuple[Decimal, int]:
    total = Decimal("0.00")
    tbc = 0
    for i, r in enumerate(rows, start=2):
        try:
            qty = Decimal(r["qty"].strip())
        except InvalidOperation:
            fail(f"row {i}: qty not numeric")
        if r["unit_price"].strip() == "TBC":
            tbc += 1
            continue
        try:
            up = Decimal(r["unit_price"].strip())
        except InvalidOperation:
            fail(f"row {i}: unit_price not numeric")
        total += (qty * up).quantize(Decimal("0.01"))
    return total, tbc


def render(project_dir: Path, overrides: dict) -> str:
    bom_rows, bom_ccy = load_csv(project_dir / "bom.csv")
    plant_rows, plant_ccy = load_csv(project_dir / "plant.csv")

    if not bom_rows:
        fail(f"{project_dir / 'bom.csv'} is empty or missing")
    if plant_ccy and plant_ccy != bom_ccy:
        fail(f"currency mismatch: bom={bom_ccy} plant={plant_ccy}")

    ccy = bom_ccy
    materials_total, mat_tbc = sum_lines(bom_rows)
    plant_total, plant_tbc = sum_lines(plant_rows)

    waste = (materials_total * Decimal(overrides["waste_pct"]) / 100).quantize(Decimal("0.01"))
    materials_with_waste = materials_total + waste
    build_cost = materials_with_waste + plant_total
    markup = (build_cost * Decimal(overrides["markup_pct"]) / 100).quantize(Decimal("0.01"))
    subtotal = build_cost + markup
    vat = (subtotal * Decimal(overrides["vat_pct"]) / 100).quantize(Decimal("0.01"))
    grand = subtotal + vat

    # Read project header if present
    header_path = project_dir / "project.md"
    project_title = project_dir.name
    if header_path.is_file():
        first_line = header_path.read_text(encoding="utf-8").splitlines()[0]
        project_title = first_line.lstrip("# ").strip() or project_title

    out: list[str] = []
    out.append(f"# Quote — {project_title}")
    out.append("")
    out.append("STATUS: DRAFT")
    out.append("")
    out.append("## Build-up")
    out.append("")
    out.append("| Line | Amount |")
    out.append("| --- | ---: |")
    out.append(f"| Materials subtotal ({len(bom_rows)} lines, {mat_tbc} TBC) | {ccy} {materials_total:,.2f} |")
    out.append(f"| Waste @ {overrides['waste_pct']} % | {ccy} {waste:,.2f} |")
    out.append(f"| Plant ({len(plant_rows)} lines, {plant_tbc} TBC) | {ccy} {plant_total:,.2f} |")
    out.append(f"| **Build cost** | **{ccy} {build_cost:,.2f}** |")
    out.append(f"| Markup @ {overrides['markup_pct']} % | {ccy} {markup:,.2f} |")
    out.append(f"| **Sub-total** | **{ccy} {subtotal:,.2f}** |")
    out.append(f"| VAT @ {overrides['vat_pct']} % | {ccy} {vat:,.2f} |")
    out.append(f"| **Quote total** | **{ccy} {grand:,.2f}** |")
    out.append("")
    out.append(f"Validity: {overrides['validity_days']} days from issue.")
    out.append("")
    if mat_tbc or plant_tbc:
        out.append(
            f"> Note: {mat_tbc + plant_tbc} line(s) are TBC. The quote total above "
            "excludes them. Resolve before sending."
        )
        out.append("")
    out.append("See `bom.csv` and `plant.csv` for the line-by-line detail.")
    return "\n".join(out) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("project_dir")
    ap.add_argument("--overrides", default=None)
    args = ap.parse_args()

    project_dir = Path(args.project_dir)
    if not project_dir.is_dir():
        fail(f"not a directory: {project_dir}")

    overrides = dict(DEFAULTS)
    if args.overrides:
        overrides.update(json.loads(Path(args.overrides).read_text()))

    quote_path = project_dir / "quote.md"
    if quote_path.is_file() and "STATUS: SENT" in quote_path.read_text():
        fail(f"{quote_path} is marked SENT — refuse to overwrite. Move it aside first.")

    quote_path.write_text(render(project_dir, overrides), encoding="utf-8")
    print(f"Wrote {quote_path}")


if __name__ == "__main__":
    main()
