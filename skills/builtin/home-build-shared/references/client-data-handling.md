# Client Data Handling

A small builder, installer, or designer typically needs:

- Client name (always)
- Site address (only if attending the property)
- Contact email (only if sending the quote / pack)
- Contact phone (only if calling)
- Site photos (only with explicit consent — and never of the client themselves)

Anything beyond this list needs a stated reason.

---

## `client.md` template

Place this at `/workspace/<project-slug>/clients/client.md`. One file per client per project — never combine clients.

```markdown
# Client — <Full name or company>

- Project slug: <project-slug>
- Lawful basis: contract            # default for installer / builder / designer work
- Created: YYYY-MM-DD
- Retention: <date> (<reason>)      # default: completion + 6 years (UK) / 7 years (US)

## Contact

- Email: <email or "not collected">
- Phone: <phone or "not collected">

## Site

- Full address: <only if attending site, else "not collected">
- Postcode/ZIP only: <e.g. SW1A 1AA>

## Notes

- <free text>
```

---

## When the user asks to share something

Ask in this order:

1. "Who is this being sent to?" — if internal (team, accountant, HMRC) no anonymisation needed; if external, continue.
2. "Do they need to identify the client to act on it?" — if no, anonymise.
3. To anonymise: replace `Full name` with `[client]`, full address with the postcode area only (e.g. `SW1` not `SW1A 1AA`), strip phone and email.

---

## When the user asks to delete a client

1. Confirm the project status — if work is in flight, refuse and explain.
2. If completed, check the retention date. If still inside retention, refuse and explain (small businesses are usually required to keep job records for tax / insurance reasons).
3. If outside retention, delete `clients/client.md` and any photos under `clients/`. Leave `bom.csv` and `quote.md` if the user wants the project history (these should be already-anonymised if the rules above were followed).

---

## What never gets memory_save'd

- Client name
- Address
- Phone, email
- Photos

These belong on disk under `clients/` only, where they are protected by the workspace mount boundary. `memory_save` writes get scanned and replayed across sessions — they're the wrong place for personal data.

What `memory_save` is good for:

- Project slug → scope summary
- Project slug → currency, units, total budget
- Supplier preferences ("user prefers Wickes for timber")
- Day-rate defaults the user has confirmed
