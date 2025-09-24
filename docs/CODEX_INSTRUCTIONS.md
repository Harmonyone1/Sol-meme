# CODEX Instructions (Start → Finish)

This is a **step-by-step build plan** for the Codex (or any developer) to implement the bot from this skeleton.

## Milestone 0 — Prereqs
- Ensure Node 20+, pnpm, Docker (optional) installed.
- Create Vercel and Railway projects; prepare Postgres + Redis on Railway.
- Copy `.env.example` to appropriate environment secrets (Web on Vercel; API/Worker on Railway).

## Milestone 1 — Database & Types
- Implement `packages/db/prisma/schema.prisma` using `docs/DB_SCHEMA.md`.
- Run `pnpm -C packages/db prisma migrate dev` locally.
- Add type exports in `packages/core` per `docs/TYPES.md`.

## Milestone 2 — API (Fastify/Express)
- In `apps/api/src/index.ts`, stand up HTTP server with routes in `docs/API_CONTRACTS.md`.
- Add `/healthz`, `/webhooks/helius`, `/webhooks/jito`, `/quotes/jupiter-proxy` (optional cache).
- Implement auth (API key header) and CORS (allow only Web origin).

## Milestone 3 — Worker (Scanner/Executor)
- Implement queues (BullMQ) connecting to Redis.
- Implement `scanner` job per `docs/SCANNER.md` to ingest from Helius + Raydium, enrich, then score per `docs/RISK_FILTERS.md` and `docs/SCORING.md`.
- Implement `executor` job per `docs/EXECUTION.md`: Jupiter quote → swap tx → add ComputeBudget priority fee → send via Jito (optional), confirm + post‑trade log.

## Milestone 4 — Web UI
- Scaffold Next.js App Router pages per `docs/UI_SPEC.md`.
- Implement pages: Dashboard, Scanner, Strategies, Risk, Execution, Trades, Analytics, Integrations, Wallets/Keys, Settings.
- Use shadcn/ui & Tailwind; hydrate via WebSocket `/ws` from API.

## Milestone 5 — CI/CD
- Add GitHub Actions from `docs/CI_CD.md`.
- Hook Vercel (apps/web) and Railway (api, worker) deployments.
- Run migrations before Railway deploys.

## Milestone 6 — Production Guardrails
- Enforce kill switch, circuit breakers, and fee caps (see `docs/RISK_FILTERS.md`).
- Ensure signer key only lives on Worker (prod).

## Milestone 7 — Verification
- Dry-run mode on mainnet (simulate instead of send).
- Canary mode (25–50% size) for first N trades; alert channel.

> Reference: `docs/DEPLOYMENT.md`, `docs/OPERATIONS.md`, and `docs/PLAYBOOKS.md` for ops and incident response.
