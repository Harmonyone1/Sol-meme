# Integrations (Keys & Endpoints)

- **Solana RPC** (Helius preferred): `RPC_PRIMARY_URL`, `RPC_FAILOVER_URL`.
- **Helius Webhooks**: POST to `/webhooks/helius` with HMAC (`HELIUS_WEBHOOK_SECRET`).
- **Jupiter**: `JUPITER_API_BASE` (usually `https://quote-api.jup.ag`).
- **Jito**: `JITO_API_TOKEN`; connect to Block‑Engine for low-latency submits.
- **Redis**: queues (BullMQ), caches.
- **Postgres**: trades, positions, strategies, candidates, alerts.
