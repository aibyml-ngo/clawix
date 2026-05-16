# Survey — Home Network (Wi-Fi / Mesh / Wired)

## Existing setup

1. ISP and router model (and whether the user can replace it or must keep it for VoIP / IPTV)
2. Property layout — single floor / multi-floor / detached outbuilding / garden
3. Approximate property size (m²) and construction (timber-frame, brick, stone, concrete — RF behaviour differs hugely)
4. Number of simultaneous users / devices
5. Bandwidth-heavy use (4K streaming, work-from-home video calls, online gaming, security cameras)

## Per area

For each room/area to cover:

- Required signal strength (browsing, HD video, 4K, VR, smart-home only)
- Devices that **must** be wired (NAS, work PC, AV receiver, game console, CCTV NVR)
- Existing data points (Cat5e/6 sockets) — quantity and condition

## Photos to upload

- ISP router + any existing AP/mesh node
- Patch panel / wall plate locations
- Any conduit or cable trays already in place
- Ceiling void access (loft hatch, floor void access in upstairs rooms)

## Decisions to record in survey.md

- Mesh vs wired-back-haul AP — AP wins for >150 m² or any masonry walls
- VLAN segmentation for IoT (recommend yes if >5 IoT devices)
- Guest SSID required (yes by default for short-term lets and home-business)
- Wi-Fi 6 vs 6E vs 7 — match to the oldest device the customer cares about

## Open questions to surface

- Does the existing router need to stay (ISP-supplied for VoIP / fibre)?
- Is the customer running their own DHCP/DNS (Pi-hole, AdGuard) — affects AP-vs-router setup?
- Any planned construction work that will affect cable routes in the next 12 months?
