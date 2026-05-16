<p align="center">
  <h1 align="center">Clawix</h1>
  <p align="center">
    <strong>Self-hosted multi-agent AI orchestration platform</strong>
    <br />
    Run AI agent swarms in isolated containers. Full governance. Zero vendor lock-in.
  </p>
  <p align="center">
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
    <a href="https://github.com/ClawixAI/clawix/stargazers"><img src="https://img.shields.io/github/stars/ClawixAI/clawix?style=flat-square" alt="Stars"></a>
    <a href="https://github.com/ClawixAI/clawix/issues"><img src="https://img.shields.io/github/issues/ClawixAI/clawix?style=flat-square" alt="Issues"></a>
    <a href="https://github.com/ClawixAI/clawix/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome"></a>
    <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square" alt="Node.js"></a>
    <a href="package.json"><img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square" alt="TypeScript"></a>
  </p>
</p>

---

## Why Clawix?

Most AI agent frameworks are either **toys** (single-process, no isolation, no audit trail) or **walled gardens** (cloud-only, per-seat pricing, your data on someone else's servers).

Clawix sits in between: **production-grade orchestration you own entirely.**

- **Every agent runs in its own Docker container** -- no agent can read another's files, exhaust your host's memory, or escape its sandbox.
- **Plug in any LLM** -- Claude and GPT-4 today, with Azure, DeepSeek, Gemini, and OpenRouter coming soon. Any OpenAI-compatible endpoint (Ollama, vLLM, etc.) works now via the custom provider.
- **Built for teams** -- RBAC, token budgets, audit logs, and scoped memory mean you can hand agents to your whole org without losing sleep.
- **Reach users where they are** -- Telegram, WhatsApp, Slack, and a built-in web dashboard. One agent, many channels.

> Think of it as "Kubernetes for AI agents" -- container isolation, resource limits, health checks, and warm pools, but purpose-built for LLM workloads.

---

## Features

<table>
<tr>
<td width="50%">

### Container-Isolated Agents

Every agent gets its own sandboxed Docker container with CPU/memory limits, read-only mounts, and no root access. Cross-agent interference is architecturally impossible.

### Warm Container Pool

Primary agents stay warm in pre-provisioned containers. Cold-start latency drops from **1-3 seconds to ~50ms**.

### Swarm Orchestration

Break complex tasks into sub-agent DAGs. The coordinator delegates, aggregates results, and handles failures -- all within isolated containers.

</td>
<td width="50%">

### Multi-Provider AI

Anthropic and OpenAI out of the box, with Azure, DeepSeek, Gemini, and OpenRouter planned. Any OpenAI-compatible endpoint already works via the custom provider. Add new providers with a single config entry.

### Scoped Memory System

Persistent memory at three levels: private (per-user), group (team), and org-wide. Agents build context over time without re-prompting.

### Skills Framework

Pluggable tools with approval workflows. Bundle built-in skills, create custom ones at runtime, or use the built-in skill-creator agent to generate new skills from natural language.

</td>
</tr>
</table>

### And also...

- **Governance & Compliance** -- Token budgets per user/group, immutable audit logs, structured logging (Pino), Prometheus metrics
- **Multi-Channel Delivery** -- reach users across messaging platforms and web (see table below)
- **Per-User Workspaces** -- Persistent directories that survive container teardown, with quota enforcement
- **Encrypted Secrets** -- Provider API keys stored with AES-256-GCM; encryption key never leaves your server
- **RBAC** -- Role-based access control across all management APIs

---

## Architecture

```
                        ┌──────────────────────────────────────────┐
                        │            User Interfaces               │
                        │   Telegram  WhatsApp  Slack  Web UI      │
                        └──────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────▼───────────────────────┐
                        │             API Gateway                  │
                        │   NestJS + Fastify  │  JWT  │  Rate Limit│
                        └──────────────────┬───────────────────────┘
                                           │
              ┌────────────────────────────▼────────────────────────────┐
              │                     Core Engine                         │
              │                                                         │
              │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
              │  │  Reasoning  │  │    Tool      │  │    Swarm      │   │
              │  │   Loops     │  │  Execution   │  │ Coordinator   │   │
              │  └─────────────┘  └──────────────┘  └───────────────┘   │
              │                                                         │
              │  Providers: Claude │ GPT │ OpenAI-compatible │ Custom   │
              └────────────────────────────┬───────────────────────────-┘
                                           │
              ┌────────────────────────────▼────────────────────────────┐
              │                  Container Pool                         │
              │  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐    │
              │  │  Warm    │  │  Ephemeral   │  │  Resource       │    │
              │  │  Primary │  │  Sub-Agents  │  │  Limits         │    │
              │  └──────────┘  └──────────────┘  └─────────────────┘    │
              └────────────────────────────┬──────────────────────────-─┘
                                           │
              ┌────────────────────────────▼────────────────────────────┐
              │                    Data Layer                           │
              │        PostgreSQL  │  Redis  │  User Workspaces         │
              └─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation) (`npm install -g pnpm`)
- [Docker](https://docs.docker.com/get-docker/) (for agent containers, PostgreSQL, and Redis)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (user-friendly platform for container management) — make sure the daemon is **running** before you continue
- [Docker Compose](https://docs.docker.com/compose/install/) (included in Docker Desktop)

Verify everything in one go:

```bash
node --version && pnpm --version && docker --version && docker info --format '{{.ServerVersion}}'
```

> **Self-hosting in production?** Skip ahead to [Production Deployment](#production-deployment-first-run) — the installer handles `.env` generation, image builds, and bootstrap for you. The steps below are for **local development**.

### 1. Clone & Install

```bash
git clone https://github.com/ClawixAI/clawix.git
cd clawix

# 2. Run the interactive installer — prompts for providers/keys, generates .env,
# builds the agent image, starts the dev stack.
pnpm run install:clawix
```

> ⚠️ **The installer is `.env`-aware.** If `.env` already exists, the installer **keeps it as-is and skips all prompts** (you'll see `.env already exists — keeping existing secrets and configuration.`). It won't backfill missing values like `POSTGRES_PASSWORD`. To force a clean run: `mv .env .env.bak && pnpm run install:clawix`.

When the installer prints `=== Installation complete ===`, the dev stack is already running. **Skip step 3** below.

<details>
<summary>Manual setup (click to expand) — for users who don't want the interactive flow</summary>

```bash
pnpm install
cp .env.example .env

# .env.example ships with PROVIDER_ENCRYPTION_KEY=$(openssl rand -hex 32) as a
# placeholder. .env is NOT a shell — that line is taken literally. Replace it:
KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# macOS sed: drop the empty '' if you're on Linux
sed -i '' "s|^PROVIDER_ENCRYPTION_KEY=.*|PROVIDER_ENCRYPTION_KEY=$KEY|" .env

pnpm --filter @clawix/shared run build
docker build -t clawix-agent:latest -f infra/docker/agent/Dockerfile .
docker compose -f docker-compose.dev.yml up -d
```

</details>

### 2. Configure (only if you used manual setup)

Open `.env` and fill in real values for the provider keys you plan to use:

```dotenv
# Required: 64-char hex literal — NOT a shell expression. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PROVIDER_ENCRYPTION_KEY=<paste 64-char hex here>

# AI providers (used by db:seed; also env fallback at runtime)
ANTHROPIC_API_KEY=sk-ant-xxx        # Claude
OPENAI_API_KEY=sk-xxx               # GPT (optional)

# Channels (optional — used by db:seed to populate channel config)
TELEGRAM_BOT_TOKEN=123456789:ABCdef...   # Telegram (from @BotFather)

# Database (defaults match docker-compose.dev.yml — leave alone for local dev)
DATABASE_URL="postgresql://clawix:clawix_dev@localhost:5433/clawix"
REDIS_URL="redis://localhost:6379"
```

> ⚠️ **`.env` is not a shell.** `docker compose` and `dotenv` read this file literally. Anything like `$(openssl rand -hex 32)` is **not** evaluated — it lands in the file as a literal string and breaks at runtime (you'll see encryption errors or auth failures). Always paste pre-computed values.

#### After updating `.env`, will the container be recreated by itself?

**No — Docker doesn't watch `.env` for changes. You have to trigger it manually.**

Two cases, same answer:

1. **You only edited values inside `.env`** (same keys, new values).
   `docker compose up -d` alone **won't** recreate the container — compose hashes the `.env` *path*, not its contents, so it sees the same file and assumes nothing changed. You need `--force-recreate`:
   ```bash
   docker compose -f docker-compose.dev.yml up -d --force-recreate api-server
   ```
2. **You added or removed keys in `.env`.** Same thing — use `--force-recreate` to be safe.

**Why a plain `restart` isn't enough.** `docker restart` and `docker compose restart` re-run the *existing* container with the env vars that were baked in at create time. Variables from `env_file:` are only read when the container is **created**, not when it starts. So you need `up --force-recreate` (or `down` + `up`), not `restart`.

**Quick check** — confirm the new value is live inside the container:

```bash
docker exec clawix-api printenv OPENAI_API_KEY
```

### 3. Run (only if you used manual setup)

```bash
pnpm run dev    # API on :3001, Dashboard on :3000
```

Open `http://localhost:3000` or message your Telegram bot.

### Common pitfalls

The most frequent install foot-guns — read this once before you start.

- **Installer silently keeps an existing `.env`.** `pnpm run install:clawix` short-circuits when `.env` exists, so it won't generate `POSTGRES_PASSWORD`, `JWT_SECRET`, or a real `PROVIDER_ENCRYPTION_KEY` even when you pick production mode. Move the file aside first: `mv .env .env.bak && pnpm run install:clawix`.
- **Literal `$(openssl rand -hex 32)` in `.env`.** Comes from the shipped `.env.example`. It does **not** evaluate. Replace it with the actual hex (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- **`POSTGRES_PASSWORD is required` when starting prod compose.** The dev `.env` template doesn't define it — pointing `docker-compose.prod.yml` at a dev-shaped `.env` fails immediately. Either run the installer in production mode (it fills these in) or stay on `docker-compose.dev.yml` for local work.
- **Postgres `password authentication failed` after re-installing.** `POSTGRES_PASSWORD` only takes effect on **first init** of an empty data directory. If the `postgres_data` volume already exists from an earlier run with different credentials, new passwords silently don't apply. Two fixes — pick one:
  ```bash
  # Reset in place (keeps data):
  docker exec clawix-postgres psql -U clawix -d clawix \
    -c "ALTER USER clawix WITH PASSWORD 'clawix_dev';"
  # — or wipe and reinitialize (destroys all DB data):
  docker compose -f docker-compose.dev.yml down -v
  ```
- **"Found orphan containers" warning.** The prod and dev compose files share `container_name`s but use different *service* names (`api` vs `api-server`). Switching between them creates orphan conflicts. Add `--remove-orphans`:
  ```bash
  docker compose -f docker-compose.dev.yml up -d --remove-orphans
  ```
- **Secrets handling.** Treat `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, and `PROVIDER_ENCRYPTION_KEY` as live credentials. If you ever paste any of them into chat tools, screenshots, issue trackers, or logs, **rotate them at the provider** — editing `.env` alone doesn't undo a leak.

---

## Production Deployment (First Run)

Two helper scripts wrap the full production flow:

| Command                   | What it does                                                                |
| ------------------------- | --------------------------------------------------------------------------- |
| `pnpm run install:clawix` | Interactive first-time setup: generates `.env`, builds images, starts stack |
| `pnpm run update:clawix`  | Non-interactive rebuild + restart (use after `git pull` or config changes)  |

### First run

```bash
pnpm run install:clawix
```

The installer will:

1. Check prerequisites (Node 20+, pnpm, Docker, Docker Compose)
2. Ask for deployment mode (production / development), provider (OpenAI or Zai-Coding) + API key, admin email/password (production only), and optional Telegram bot token
3. Generate `.env` with cryptographically random `JWT_SECRET`, `PROVIDER_ENCRYPTION_KEY`, `POSTGRES_PASSWORD` (file permissions set to `600`)
4. Build `clawix-agent:latest` (agent image used for isolated per-task containers)
5. Run `docker compose … up -d --build`
6. Wait for `http://localhost:3001/health` to go green (migrations + bootstrap run inside the API container on first start)

When it finishes, open `http://localhost:3000` and sign in with the admin credentials you entered.

> Re-running `install:clawix` with an existing `.env` is safe — it keeps your secrets, skips the prompts, and just rebuilds/restarts. To reconfigure from scratch, delete `.env` and re-run.

### Updates and restarts

```bash
pnpm run update:clawix              # rebuild + restart (default)
pnpm run update:clawix -- --pull    # git pull --ff-only, then rebuild + restart
pnpm run update:clawix -- --no-build # plain restart, reuse existing images
```

The updater reads `CLAWIX_DEPLOY_MODE` from `.env` and picks the right compose file automatically. Prisma migrations and the idempotent bootstrap run inside the container on every start — bootstrap no-ops once the admin exists.

### What happens under the hood

- `infra/docker/api/entrypoint.sh` runs `prisma migrate deploy`, then `node dist/bootstrap.js`.
- `bootstrap.ts` only writes when the admin doesn't already exist and only uses `upsert` / guarded `create` — never deletes data.
- The production compose file **fails fast** at `docker compose up` time if any of `POSTGRES_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, or `PROVIDER_ENCRYPTION_KEY` are missing.
- Generate the encryption key manually (if not using the installer) with `openssl rand -hex 32`.

### Manual equivalent (no installer)

```bash
cp .env.example .env
# edit .env — set POSTGRES_PASSWORD, JWT_SECRET, CORS_ALLOWED_ORIGINS,
# PROVIDER_ENCRYPTION_KEY, DEFAULT_PROVIDER, <PROVIDER>_API_KEY,
# INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_NAME

docker build -t clawix-agent:latest -f infra/docker/agent/Dockerfile .
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs api | grep '\[bootstrap\]'
```

## Uninstallation

Remove Clawix completely with:

```bash
pnpm run uninstall:clawix               # preserve host data
pnpm run uninstall:clawix -- --full     # complete removal
```

### Flags

| Flag            | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `--full` / `-f` | Remove Docker resources AND host data (.env, ./data/, ./skills/custom/) |
| `--yes` / `-y`  | Skip confirmation prompt                                                |

### What gets removed

**Docker cleanup (default):**

- Containers from both dev and prod environments
- Images built by compose + `clawix-agent:latest`
- Named volumes (`postgres_data`, `redis_data`, etc.)
- Orphan containers

**Host data (with `--full`):**

- `.env` — configuration and secrets
- `./data/` — runtime data, user workspaces
- `./skills/custom/` — user-created skills

### Fresh reinstall

```bash
# Full cleanup
pnpm run uninstall:clawix -- --full -y

# Reinstall from scratch
pnpm run install:clawix
```

> Without `--full`, host data is preserved. The installer detects existing `.env` and skips configuration prompts, reusing your previous settings.

---

## Multi-Provider Support

Built-in providers plus extensible registry -- add new ones with a single `ProviderSpec` entry:

| Provider        | Detection                                  | Use Case              | Status    |
| --------------- | ------------------------------------------ | --------------------- | --------- |
| **Anthropic**   | model starts with `claude-`                | Primary (best tools)  | Available |
| **OpenAI**      | model starts with `gpt-`/`o1-`/`o3-`/`o4-` | General purpose       | Available |
| **Z.AI Coding** | model starts with `glm-`                   | GLM models            | Available |
| **Azure**       | config key `azure_openai`                  | Enterprise compliance | Planned   |
| **DeepSeek**    | model starts with `deepseek-`              | Cost-effective        | Planned   |
| **Gemini**      | model starts with `gemini-`                | Google ecosystem      | Planned   |
| **Kimi**        | model starts with `moonshot-`              | Long-context tasks    | Planned   |
| **OpenRouter**  | API key starts with `sk-or-`               | Provider gateway      | Planned   |
| **Custom**      | any OpenAI-compatible endpoint             | Ollama, vLLM, etc.    | Available |

## Channels

| Channel           | Integration         | Use Case                      | Status    |
| ----------------- | ------------------- | ----------------------------- | --------- |
| **Telegram**      | grammY              | Personal & team chat          | Available |
| **WhatsApp**      | Business API        | Customer-facing agents        | Planned   |
| **Slack**         | Bolt SDK            | Workspace collaboration       | Planned   |
| **Web Dashboard** | Next.js + WebSocket | Admin console & conversations | Available |

---

## Security Model

Clawix follows a **zero-trust architecture** for agent execution:

| Threat                         | Mitigation                                                     |
| ------------------------------ | -------------------------------------------------------------- |
| Cross-user data access         | Workspaces only mounted into owner's container                 |
| Sub-agent privilege escalation | Sub-agents get read-only curated context, never full workspace |
| Memory poisoning               | Agent context regenerated from DB each run                     |
| Disk exhaustion                | Per-user quota enforcement (default 500 MB)                    |
| Path traversal                 | All paths validated to stay under `data/org/`                  |
| Secret leakage                 | API keys encrypted at rest (AES-256-GCM)                       |
| Untrusted code execution       | All agent code runs inside sandboxed containers, never on host |

---

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| API        | NestJS 11 + Fastify                                       |
| Frontend   | Next.js 15 + Tailwind CSS + shadcn/ui                     |
| AI         | Multi-provider (Anthropic, OpenAI, any OpenAI-compatible) |
| Database   | Prisma ORM + PostgreSQL 16                                |
| Cache      | Redis 7 (ioredis)                                         |
| Auth       | NextAuth (JWT + OAuth2)                                   |
| Containers | Docker CLI with resource limits                           |
| Logging    | Pino (structured JSON)                                    |
| Metrics    | Prometheus (prom-client)                                  |
| Testing    | Vitest + Playwright                                       |
| Monorepo   | pnpm workspaces                                           |

---

## Project Structure

```
clawix/
├── packages/
│   ├── api/          # NestJS API server (auth, engine, channels, skills)
│   ├── web/          # Next.js dashboard (React 19, Tailwind, shadcn/ui)
│   ├── shared/       # Shared types, schemas, utilities, logger
│   └── worker/       # Background job processor
├── skills/
│   └── builtin/      # Bundled skills (web_search, file_ops, etc.)
├── infra/
│   └── docker/       # Agent container Dockerfile
├── prisma/           # Database schema + migrations
├── docs/             # Architecture & implementation docs
└── scripts/          # Dev/ops scripts
```

---

## Commands

```bash
pnpm run dev              # Start API + dashboard (hot-reload)
pnpm run build            # Build all packages
pnpm run test             # Run all tests
pnpm run test:coverage    # Tests with coverage report
pnpm run lint             # ESLint + type check
pnpm run format           # Prettier format

# Production deployment
pnpm run install:clawix   # Interactive first-time setup (generates .env, builds, starts)
pnpm run update:clawix    # Rebuild + restart after git pull or config changes

# Infrastructure
pnpm run docker:dev       # Start Postgres, Redis, pgAdmin
pnpm run docker:down      # Stop local infra

# Database
pnpm run db:migrate       # Run Prisma migrations
pnpm run db:seed          # Seed initial data
pnpm run db:studio        # Open Prisma Studio (GUI)
```

---

## Roadmap

- [x] Container-isolated agent execution
- [x] Multi-provider AI support (Claude, GPT, OpenAI-compatible endpoints)
- [ ] First-class Azure, DeepSeek, Gemini, Kimi, OpenRouter providers
- [x] Warm container pool (~50ms cold start)
- [x] Swarm orchestration with DAG dependencies
- [x] Telegram channel integration
- [x] Scoped memory system
- [x] Skills framework with built-in skill creator
- [ ] WhatsApp Business API integration
- [ ] Slack integration
- [x] Web dashboard (conversations, agents, skills, settings)
- [ ] Skill marketplace UI
- [ ] Advanced token analytics & optimization
- [ ] Multi-region deployment support

---

## Contributing

Contributions are welcome! Whether it's bug fixes, new features, documentation, or feedback -- we'd love your help.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/clawix.git
cd clawix

# Create a feature branch
git checkout -b feature/your-feature

# Make changes, then test and lint
pnpm run test
pnpm run lint

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and open a PR
git push origin feature/your-feature
```

**Guidelines:**

- TypeScript strict mode -- no `any`
- Write tests for new features (Vitest)
- Follow conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
- Keep files under 400 LOC
- Never commit secrets or API keys

---

## Security

If you discover a security vulnerability, please report it responsibly via [GitHub Security Advisories](https://github.com/clawix/clawix/security/advisories) instead of using the public issue tracker.

---

## Acknowledgments

Clawix builds on ideas from:

- [nanoClaw](https://github.com/qwibitai/nanoclaw) -- Container-isolated agent execution
- [nanobot](https://github.com/HKUDS/nanobot) -- Multi-provider AI design patterns

---

## License

MIT -- see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built for organizations that need AI agents they can actually trust.</sub>
</p>
