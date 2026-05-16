#!/usr/bin/env python3
"""
unit_convert.py — deterministic unit conversion for home-build work.

Usage:
    python3 unit_convert.py <value> <from_unit> to <to_unit>

Examples:
    python3 unit_convert.py 2.4 m to ft       -> 7.874 ft
    python3 unit_convert.py 12 m2 to sqft     -> 129.167 sqft
    python3 unit_convert.py 25 kg to lb       -> 55.116 lb
    python3 unit_convert.py 240 mm to in      -> 9.449 in
    python3 unit_convert.py 1 gal_uk to l     -> 4.546 l

Deliberately rejects ambiguous units (use gal_uk or gal_us, not gal).
"""

from __future__ import annotations
import sys
from decimal import Decimal, InvalidOperation, getcontext

getcontext().prec = 12

# All factors expressed as: 1 <key> = <value> base_unit
# Length base = m
LENGTH = {
    "mm": Decimal("0.001"), "cm": Decimal("0.01"), "m": Decimal("1"),
    "km": Decimal("1000"),
    "in": Decimal("0.0254"), "ft": Decimal("0.3048"), "yd": Decimal("0.9144"),
}
# Area base = m2
AREA = {
    "mm2": Decimal("0.000001"), "cm2": Decimal("0.0001"), "m2": Decimal("1"),
    "sqin": Decimal("0.00064516"), "sqft": Decimal("0.09290304"), "sqyd": Decimal("0.83612736"),
}
# Volume base = m3
VOLUME = {
    "ml": Decimal("0.000001"), "l": Decimal("0.001"), "m3": Decimal("1"),
    "gal_uk": Decimal("0.00454609"), "gal_us": Decimal("0.003785411784"),
    "cuft": Decimal("0.028316846592"),
}
# Mass base = kg
MASS = {
    "g": Decimal("0.001"), "kg": Decimal("1"), "t": Decimal("1000"),
    "oz": Decimal("0.028349523125"), "lb": Decimal("0.45359237"),
    "st": Decimal("6.35029318"),
}

DIMENSIONS = {"length": LENGTH, "area": AREA, "volume": VOLUME, "mass": MASS}


def find_dimension(unit: str) -> tuple[str, dict[str, Decimal]] | None:
    for name, table in DIMENSIONS.items():
        if unit in table:
            return name, table
    return None


def main(argv: list[str]) -> None:
    if len(argv) != 5 or argv[3] != "to":
        sys.stderr.write(
            "usage: unit_convert.py <value> <from_unit> to <to_unit>\n"
            "  e.g.: unit_convert.py 2.4 m to ft\n"
        )
        sys.exit(1)

    raw_value, from_unit, _, to_unit = argv[1:5]

    try:
        value = Decimal(raw_value)
    except InvalidOperation:
        sys.stderr.write(f"error: '{raw_value}' is not a number\n")
        sys.exit(1)

    src = find_dimension(from_unit)
    dst = find_dimension(to_unit)
    if src is None:
        sys.stderr.write(f"error: unknown unit '{from_unit}'\n")
        sys.exit(1)
    if dst is None:
        sys.stderr.write(f"error: unknown unit '{to_unit}'\n")
        sys.exit(1)
    if src[0] != dst[0]:
        sys.stderr.write(
            f"error: cannot convert {src[0]} ({from_unit}) to {dst[0]} ({to_unit})\n"
        )
        sys.exit(1)

    base = value * src[1][from_unit]
    out = base / dst[1][to_unit]
    print(f"{out.normalize():f} {to_unit}")


if __name__ == "__main__":
    main(sys.argv)
