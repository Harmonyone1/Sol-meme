# Operations (Runbooks)

## Health
- `/healthz` checks DB, Redis, RPC, Jito reachability.
- Worker heartbeat every minute (alert if missing > 3m).

## Incidents
- **Circuit breaker**: auto-pause; notify Slack.
- **RPC failover**: switch to secondary; log event.
- **Bundle failures** (Jito): retry with adjusted tip up to cap, then abort.

## Playbooks
- Pause all strategies → Reduce size by 50% → Resume.
- Switch RPC providers and re-run health checks.
- Rotate signer (planned maintenance).
