# Commissioning Report Template

Render to `/workspace/<project>/commissioning.md`. The customer signs the bottom block before you leave site.

---

```markdown
# Commissioning — <Project name>

- Project: <slug>
- Site address: <full address>
- Installer: <your name + company + accreditation no.>
- Date of install: YYYY-MM-DD
- Time on site: HH:MM – HH:MM

## Devices fitted

| Device              | Make / model        | Serial         | FW version | Location           | Photo                          |
| ------------------- | ------------------- | -------------- | ---------- | ------------------ | ------------------------------ |
| <e.g. doorbell>     | Ring Pro 2          | RP2-XXXXXXXX   | 4.x.x      | Front porch        | photos/after/doorbell.jpg      |
| ...                 | ...                 | ...            | ...        | ...                | ...                            |

## Tests performed

| Device       | Test                                                        | Result |
| ------------ | ----------------------------------------------------------- | ------ |
| Doorbell     | Live view from customer's phone, indoor + outdoor Wi-Fi     | Pass   |
| Doorbell     | Motion event triggers chime within 3 s                      | Pass   |
| Mesh node #2 | iperf3 to gateway: ≥ 400 Mbps over 5 GHz @ 5 m              | Pass   |
| ...          | ...                                                         | ...    |

## Notes / outstanding items

- <e.g. customer to choose chime tone — link emailed>
- <e.g. WiFi password rotation scheduled for 30 days, customer aware>

## Customer sign-off

I confirm the devices listed above were installed at the site address, demonstrated to me in working order, and that I have received written instructions for everyday operation and factory reset.

Customer name (printed): _______________________________
Customer signature:      _______________________________
Date:                    _______________________________

Installer signature:     _______________________________
```
