<p align="center">
  <h1 align="center">Clawix</h1>
  <p align="center">
    <strong>Industry-grade AI agent platform — self-hosted, multi-agent, zero vendor lock-in</strong>
    <br />
    Pre-built agent packs for Finance, Legal, NGO, and Construction. Add your own industry in minutes.
  </p>
  <p align="center">
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
    <a href="https://github.com/aibyml-ngo/clawix/stargazers"><img src="https://img.shields.io/github/stars/aibyml-ngo/clawix?style=flat-square" alt="Stars"></a>
    <a href="https://github.com/aibyml-ngo/clawix/issues"><img src="https://img.shields.io/github/issues/aibyml-ngo/clawix?style=flat-square" alt="Issues"></a>
    <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square" alt="Node.js">
    <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square" alt="TypeScript">
  </p>
</p>

---

## Clawix is not a chatbot

| | GPT-type chatbot | Claude Code / OpenClaw | **Clawix** |
|---|---|---|---|
| **What it is** | Conversational Q&A | Developer coding assistant | Multi-agent workflow platform |
| **Who uses it** | Anyone asking questions | Software engineers | Finance, Legal, NGO, Construction teams |
| **Memory** | Resets every session | Per-project only | Persistent — builds context over time |
| **Agents** | One general model | One coding agent | Specialist coordinator + workers + sub-agents |
| **Workflows** | Single turn | Single task | Multi-step, cross-agent, governed pipelines |
| **Governance** | None | None | Human-in-loop gates, audit logs, RBAC |
| **Data** | Sent to vendor cloud | Local files only | Self-hosted — your server, your data |
| **Industry fit** | Generic | Code only | Finance · Legal · NGO · Construction · any domain |

**A GPT chatbot answers your question and forgets it.  
Claude Code / OpenClaw writes code on your machine.  
Clawix runs specialist agents as a coordinated team — with memory, governance, and human approval — for the work your industry actually does.**

---

## Industry Packs

Clawix ships with four ready-to-run industry bundles, each with pre-built skills, agents, sub-agents, and conversation starters. Open **Explore** in the dashboard to try one.

### 📊 Finance & Accounting
Bookkeeping · Bank reconciliation · AP/AR aging · Cashflow forecasting · Internal audit · Management accounts

| Agents | Sub-agents |
|---|---|
| Coordinator · Bookkeeping · Reconciliation · AP/AR · Cashflow · Audit · Reporting | OCR extractor · GL classifier · Variance analyzer · Evidence collector · Reviewer |

Human approval required on: journal entries, payment runs, period close, filings.

---

### ⚖️ Legal & Compliance
Case research · Contract review · Due diligence · Redlining · Memo drafting · Deadline tracking

| Agents | Sub-agents (automatic, non-bypassable) |
|---|---|
| Case research · Contract analyst · Case summarizer · Due diligence · Legal drafter · Client comms · Intern assistant | Compliance guardian · Citation verifier · Prompt-injection sentry |

Every output is a **draft for lawyer review** — the system never files, sends, or advises autonomously.

---

### 🌍 NGO Operations
Donor research · Grant proposals · M&E · Impact reports · Field operations · Safeguarding

| Agents |
|---|
| Program coordinator · Donor engagement · Monitoring & evaluation · Communications · Field operations |

Dignity-first data handling. Beneficiary names never stored in memory. All external comms require human approval.

---

### 🏗️ Home Build & Construction
Material take-offs · Wholesale pricing · Schedules of works · Site surveys · Client proposals

| Agents | Sub-agents |
|---|---|
| Coordinator · Installer · Builder · Designer · Wholesale buyer · Quote builder | Supplier pricer · Takeoff estimator · Photo extractor · Spec validator · Quote renderer · Deadline watcher · Compliance guardian |

Prices fetched from live trade counter pages — never guessed. Flags unlicensed work (Part P, Gas Safe, MCS, DNO) automatically.

---

### Adding your own industry

No code changes needed. Drop two things into the repo and restart:

1. **Skills** — add folders to `skills/builtin/`
2. **Pack manifest** — add one JSON file to `skills/packs/`

```
skills/
  builtin/
    myindustry-skill-one/SKILL.md   ← new skill
    myindustry-skill-two/SKILL.md
  packs/
    myindustry.json                 ← new pack (name, icon, agents, inspirations)
```

The Explore page picks it up automatically on next restart.

---

## Install

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — must be running
- [Node.js 20+](https://nodejs.org/) and [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)

Verify:
```bash
node --version && pnpm --version && docker info --format '{{.ServerVersion}}'
```

### First-time setup (one command)

```bash
git clone https://github.com/aibyml-ngo/clawix.git
cd clawix
pnpm run install:clawix
```

The installer asks for your AI provider key and admin credentials, generates all secrets, builds the images, and starts the stack. When it prints `=== Installation complete ===`, open **http://localhost:3000** and sign in.

### Updates

```bash
pnpm run update:clawix            # rebuild + restart after code changes
pnpm run update:clawix -- --pull  # git pull, then rebuild + restart
```

### If Docker goes down

```bash
docker rm -f clawix-web clawix-api clawix-postgres clawix-redis clawix-browser clawix-pypi-proxy
docker network rm clawix-internal clawix-browser-egress
cd /path/to/clawix && docker compose -f docker-compose.prod.yml up -d
```

### Uninstall

```bash
pnpm run uninstall:clawix           # remove containers and volumes
pnpm run uninstall:clawix -- --full # also remove .env and all data
```

---

## How it works

```
User (web · Telegram · WhatsApp · Slack)
        │
        ▼
  Coordinator agent          ← routes the task, maintains context
        │
  ┌─────┴──────┐
  ▼            ▼
Specialist   Specialist      ← each in its own isolated Docker container
  agent        agent
        │
        ▼
   Sub-agents               ← spawned for specific tasks (OCR, pricing, etc.)
        │
        ▼
  Human approval gate        ← required before any consequential action
```

Every agent runs in its own sandboxed container — CPU-limited, memory-limited, read-only root filesystem, no network by default. A rogue response cannot affect other users, agents, or the host.


---

## Governance built in

- **Human-in-loop** — configurable per industry: payment runs, filings, client communications, contract execution
- **Audit log** — append-only, hash-chained record of every agent action
- **RBAC** — role-based access control across all APIs
- **Token budgets** — per-user and per-group limits enforced at the API layer
- **Encrypted secrets** — provider API keys stored with AES-256-GCM; never logged

---

## Multi-provider AI

| Provider | Models | Status |
|---|---|---|
| **Anthropic** | Claude Opus, Sonnet, Haiku | ✅ Available |
| **OpenAI** | GPT-4o, o1, o3, o4 | ✅ Available |
| **Z.AI** | GLM models | ✅ Available |
| **DeepSeek** | DeepSeek models | ✅ Available |
| **Gemini** | Google ecosystem | ✅ Available |
| **Kimi** | Long-context tasks | ✅ Available |
| **Custom** | Any OpenAI-compatible endpoint (Ollama, vLLM) | ✅ Available |
| Azure · OpenRouter | — | 🔜 Planned |

---

## Channels

| Channel | Status |
|---|---|
| Web dashboard | ✅ Available |
| Telegram | ✅ Available |
| WhatsApp | 🔜 Planned |
| Slack | 🔜 Planned |

---

## Project layout

```
clawix/
├── packages/
│   ├── api/          # NestJS API — engine, auth, channels, skills, packs
│   ├── web/          # Next.js dashboard — conversations, explore, skills, agents
│   └── shared/       # Types, schemas, logger
├── skills/
│   ├── builtin/      # 56 pre-built skills across 4 industries
│   └── packs/        # Industry pack manifests (JSON)
├── infra/docker/     # Dockerfiles for API, web, agent sandbox
└── scripts/          # install.mjs · update.mjs · uninstall.mjs
```

---

## Roadmap

- [x] Container-isolated agent execution
- [x] Multi-provider AI (Claude, GPT, DeepSeek, Gemini, OpenAI-compatible)
- [x] Industry packs — Finance, Legal, NGO, Construction
- [x] Explore page with inspiration prompts
- [x] Warm container pool (~50ms agent start)
- [x] Swarm orchestration with coordinator + workers + sub-agents
- [x] Telegram channel
- [x] Scoped memory (user · group · org)
- [ ] First-class Azure, OpenRouter providers
- [x] Skills framework with built-in skill creator
- [ ] WhatsApp Business API
- [ ] Slack integration
- [ ] Skill marketplace
- [ ] Multi-region deployment

---

## Contributing

```bash
git clone https://github.com/aibyml-ngo/clawix.git
cd clawix
git checkout -b feature/your-feature
# make changes
pnpm run test && pnpm run lint
git commit -m "feat: your feature"
git push origin feature/your-feature
```

- TypeScript strict mode — no `any`
- Conventional commits (`feat:`, `fix:`, `refactor:`)
- Write tests for new features (Vitest)

---

## Security

Report vulnerabilities via [GitHub Security Advisories](https://github.com/aibyml-ngo/clawix/security/advisories) — not the public issue tracker.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built for teams that need AI agents they can trust with real work.</sub>
</p>
