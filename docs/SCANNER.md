# Scanner (Discovery Pipeline)

**Goal:** detect new/active meme tokens and produce **Candidate** records with safety flags and scores.

## Feeds
- **Helius Webhooks**: subscribe to Raydium/Orca events (`PoolInitialized`, `AddLiquidity`, `Swap`).
- **Jupiter Routability**: periodic probes for SOL/USDC ↔ token.
- **(Optional) Raydium API/SDK**: new pool stream and pool state.

## Flow (pseudo)
1. Ingest events → enqueue token mints/pools.
2. Enrich: fetch mint data (authorities/extensions), pool age/liquidity, holder snapshot.
3. **Hard filters**: reject dangerous mints and thin/young pools.
4. **Score**: compute composite from liquidity, uniques, volume, impact, spread, momentum, ownership.
5. Persist/update candidates; emit to UI via WebSocket.

See `docs/RISK_FILTERS.md` and `docs/SCORING.md`.
