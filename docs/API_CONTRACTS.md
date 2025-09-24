# API Contracts (Selected)

## POST /api/strategies
Create/update a strategy.
Body: see `docs/STRATEGY_PAYLOAD.json`.

## POST /api/trades/simulate
Dry‑run a trade (no send).

## POST /api/execution/kill
Toggle kill switch.

## WS /ws
Real‑time: `trades`, `positions`, `alerts`, `health`, `scanner` channels.
