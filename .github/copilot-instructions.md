Copilot instructions — Clawix repository

1) Build, test, and lint (quick commands)

- Install: pnpm install (project uses pnpm workspace; Node >= 20 required)
- Run full build (root): pnpm build
- Run dev across packages: pnpm dev

Per-package (preferred when working on a single package):
- Web (Next.js): pnpm --filter @clawix/web dev
- API (NestJS): pnpm --filter @clawix/api dev
- Shared: pnpm --filter @clawix/shared dev

Tests (Vitest):
- Run all tests (root): pnpm test
- Run tests for a package: pnpm --filter @clawix/api test
- Run a single test file: pnpm --filter @clawix/api test -- packages/api/path/to/file.test.ts
- Run tests by name: pnpm --filter @clawix/api test -- -t "name or regexp"
- Watch: pnpm --filter @clawix/web test:watch

Typecheck & lint:
- Typecheck (root): pnpm run typecheck
  - Note: root typecheck runs a build of @clawix/shared and runs prisma generate for the API package before tsc across packages.
- Lint (root): pnpm run lint
- Fix lint: pnpm run lint:fix
- Format: pnpm run format

Database / Prisma (api package):
- Generate client: pnpm --filter @clawix/api run db:generate
- Migrate (dev): pnpm db:migrate
- Seed: pnpm --filter @clawix/api run db:seed
- Reset: pnpm --filter @clawix/api run db:reset

Docker (compose):
- Dev up: pnpm run docker:dev
- Prod build/up: pnpm run docker:prod
- Compose down: pnpm run docker:dev:down or pnpm run docker:prod:down

2) High-level architecture (big picture)

- Monorepo managed by pnpm workspace.
  - packages/web: Next.js (app router, React 19) — frontend UI and docs site.
  - packages/api: NestJS-based backend (Fastify), Prisma + Postgres, many provider integrations (Anthropic, OpenAI, Google GenAI, etc.), background workers, websockets, Playwright present as a dependency.
  - packages/shared: shared TypeScript utilities, schemas, types and logger used by other packages (exports via package.json -> dist).
- Agents model (see docs/AGENTS.md): the platform runs two agent roles:
  - Primary agents (role: "primary"): long‑lived, stateful, full tool access (file tools, memory, web tools, cron, spawn). They own sessions and persist history.
  - Sub-agents / workers (role: "worker"): short‑lived, stateless, run in isolated containers, invoked only via the primary agent's spawn tool and return results asynchronously (via Redis queue). Each worker has its own system prompt, provider/model, and maxTokensPerRun.
- Storage & infra:
  - Prisma manages DB schema and client under packages/api.
  - Redis is used for async delivery of sub-agent results and queuing (refer to CONFIG.md).
  - Docker Compose manifests exist for dev/prod at project root.
- Skills: built-in skill modules live under skills/builtin/ and follow an SKILL.md convention (self-documenting skill metadata + references).
- Docs: docs/ contains architecture, SPEC.md, and AGENTS.md — prefer these for authoritative behaviour.

3) Key conventions and patterns (repo-specific)

- Workspace usage: prefer pnpm --filter <pkg> <script> when targeting a single package. Root scripts often orchestrate the correct prereqs (e.g., typecheck runs prisma generate).
- TypeScript: "type": "module" across packages; builds emit to dist (packages use tsc). Use tsc --noEmit for typecheck.
- Tests: Vitest is used across packages. Pass file paths or -t through pnpm run to target specific tests.
- Exports: @clawix/shared uses explicit "exports" in package.json — import via package name, not deep relative paths if published internally.
- DB workflow: for local dev, run prisma generate then prisma migrate / seed from the API package. Root scripts call these via pnpm filters.
- Agent spawn behavior (summary): spawn(agent_name=...) resolves to an enabled worker with that exact name; anonymous spawn falls back to default-worker. Sub-agents must have self-contained system prompts and explicit expected output formats (JSON/markdown) because they have no persisted history.
- Scripts: many dev scripts use tsx for one-off TS scripts (e.g., prisma/seed.ts). When editing scripts, keep them executable under Node >=20.

4) Where to look for more authoritative details

- docs/AGENTS.md — full agent model, spawn rules, system prompt guidance, API endpoints (/api/v1/agents and /api/v1/agents/sub-agents).
- docs/README.md and other docs/*.md for design, CONFIG.md for runtime settings.
- packages/*/package.json for package-specific scripts and dependency lists.

5) Quick tips for Copilot sessions

- When modifying TypeScript across packages, run pnpm --filter @clawix/shared build first if you change shared types.
- When touching Prisma models, run pnpm --filter @clawix/api run db:generate and db:migrate locally before pushing changes.
- For agent-related code, keep AGENTS.md behaviour in mind (primary vs worker, spawn resolution, token budgets).

---

If you'd like, the next step is to add an MCP server config for Playwright or other CI services relevant to this repo. Would you like an MCP server configured for Playwright (web tests) or another service?