#!/usr/bin/env python3
"""
buying_plan.py — render a buying plan from priced-bom.csv + schedule.md

Reads:
  /workspace/<project>/sourcing/priced-bom.csv   (canonical schema; see SKILL.md)
  /workspace/<project>/schedule.md                (optional; for site dates)

Writes:
  /workspace/<project>/sourcing/buying-plan.md    (the user-facing plan)

Deterministic, side-effect-free apart from the single output write.
Runs inside the agent container; no network, no host access.

Usage:
  python3 /skills/builtin/wholesale-sourcing/scripts/buying_plan.py \
      --project-dir /workspace/kitchen-extension-sw11 \
      --currency GBP \
      [--site-required-key STG-04=2026-06-08,STG-05=2026-06-22]
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import re
from collections import defaultdict
from pathlib import Path
from typing import Any


# Buffer defaults, per the references/lead-time-defaults.md table.
BUFFER_BY_DOMAIN = {
    "consumables-fast": 1,
    "heavy-build": 3,
    "electrical-trade": 3,
    "plumbing-trade": 3,
    "decor-finishes": 1,
    "tool-hire": 1,
    "kitchen-bathroom": 14,
    "specialist": 7,
}


def parse_site_dates(spec: str | None) -> dict[str, dt.date]:
    if not spec:
        return {}
    out: dict[str, dt.date] = {}
    for token in spec.split(","):
        token = token.strip()
        if not token or "=" not in token:
            continue
        stage, date_str = token.split("=", 1)
        try:
            out[stage.strip()] = dt.date.fromisoformat(date_str.strip())
        except ValueError:
            print(f"warning: bad date for stage {stage}: {date_str}")
    return out


def read_priced_bom(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required = {
            "sku", "description", "domain", "merchant", "unit", "qty",
            "list_price", "discounted_price", "line_total",
            "lead_days", "stock_status", "source_url", "fetched_at",
        }
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise SystemExit(f"priced-bom.csv missing columns: {sorted(missing)}")
        for row in reader:
            rows.append(row)
    return rows


def to_decimal(s: str) -> float | None:
    if s is None:
        return None
    s = s.strip()
    if not s or s.upper() == "TBC":
        return None
    try:
        return float(s.replace(",", ""))
    except ValueError:
        return None


def to_int(s: str) -> int | None:
    if s is None:
        return None
    s = s.strip()
    if not s:
        return None
    try:
        return int(float(s))
    except ValueError:
        return None


def stage_from_notes(notes: str) -> str | None:
    m = re.search(r"\bSTG-\d{2}\b", notes or "")
    return m.group(0) if m else None


def order_by(site_date: dt.date | None, lead_days: int | None, domain: str) -> dt.date | None:
    if site_date is None or lead_days is None:
        return None
    buffer = BUFFER_BY_DOMAIN.get(domain, 3)
    return site_date - dt.timedelta(days=lead_days + buffer)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--project-dir", required=True, help="Project root, e.g. /workspace/<slug>")
    ap.add_argument("--currency", required=True)
    ap.add_argument("--site-required-key", default=None,
                    help="STG-XX=YYYY-MM-DD,STG-YY=YYYY-MM-DD,...")
    args = ap.parse_args()

    project_dir = Path(args.project_dir)
    priced = project_dir / "sourcing" / "priced-bom.csv"
    out = project_dir / "sourcing" / "buying-plan.md"

    if not priced.exists():
        raise SystemExit(f"priced-bom.csv not found at {priced}")

    rows = read_priced_bom(priced)
    site_dates = parse_site_dates(args.site_required_key)
    today = dt.date.today()

    by_merchant: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_stage: dict[str, list[dict[str, Any]]] = defaultdict(list)
    risks: list[dict[str, Any]] = []
    open_rfqs: list[dict[str, Any]] = []

    list_total = 0.0
    trade_total = 0.0

    for r in rows:
        stage = stage_from_notes(r.get("notes", ""))
        lead = to_int(r.get("lead_days", ""))
        domain = r.get("domain", "") or "specialist"
        site_required = site_dates.get(stage) if stage else None
        order_date = order_by(site_required, lead, domain)
        late = order_date is not None and order_date < today

        line = {
            **r,
            "stage": stage,
            "order_by": order_date.isoformat() if order_date else None,
            "site_required": site_required.isoformat() if site_required else None,
            "late": late,
        }
        by_merchant[r["merchant"] or "TBC"].append(line)
        if stage:
            by_stage[stage].append(line)

        lp = to_decimal(r.get("list_price", ""))
        dp = to_decimal(r.get("discounted_price", ""))
        qty = to_decimal(r.get("qty", "")) or 0
        if lp is not None:
            list_total += lp * qty
        if dp is not None:
            trade_total += dp * qty

        stock = (r.get("stock_status") or "").lower()
        if stock in {"low-stock", "out-of-stock", "made-to-order", "unknown"}:
            risks.append(line)
        if (r.get("list_price") or "").upper() == "TBC" or (r.get("merchant") or "").lower() == "tbc":
            open_rfqs.append(line)

    lines: list[str] = []
    P = lines.append
    P(f"# Buying plan — {project_dir.name}")
    P("")
    P(f"Generated: {dt.datetime.utcnow().isoformat()}Z")
    P(f"Currency: {args.currency}")
    P("")
    P("## By merchant")
    for merchant, rs in sorted(by_merchant.items()):
        P("")
        P(f"### {merchant}")
        list_sum = sum((to_decimal(x.get("list_price", "")) or 0) * (to_decimal(x.get("qty", "")) or 0) for x in rs)
        trade_sum = sum((to_decimal(x.get("discounted_price", "")) or 0) * (to_decimal(x.get("qty", "")) or 0) for x in rs)
        earliest_order = min((x["order_by"] for x in rs if x["order_by"]), default=None)
        P(f"- Order by: {earliest_order or 'TBC'}")
        P(f"- Lines: {len(rs)}")
        P(f"- Sub-total at list: {list_sum:,.2f} {args.currency}")
        P(f"- Sub-total at trade: {trade_sum:,.2f} {args.currency}")
    P("")
    P("## By stage")
    P("")
    P("| Stage | Merchant | Order by | Site required | Status |")
    P("|-------|----------|----------|---------------|--------|")
    for stage, rs in sorted(by_stage.items()):
        for x in rs:
            status = "LATE" if x["late"] else "ok"
            P(f"| {stage} | {x['merchant']} | {x['order_by'] or 'TBC'} | {x['site_required'] or 'TBC'} | {status} |")
    P("")
    P("## Cash-flow effect")
    P("")
    P(f"- Total at list: {list_total:,.2f} {args.currency}")
    P(f"- Total at trade: {trade_total:,.2f} {args.currency}")
    P(f"- Saved against list: {(list_total - trade_total):,.2f} {args.currency}")
    P("")
    if open_rfqs:
        P("## Open RFQs")
        for x in open_rfqs:
            P(f"- {x['merchant'] or 'TBC'} — {x['description']}")
        P("")
    if risks:
        P("## Risks")
        for x in risks:
            P(f"- {x['stock_status']} — {x['merchant']} / {x['description']}")
        P("")

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
