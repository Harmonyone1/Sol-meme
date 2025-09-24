# Deployment (Vercel + Railway)

This repo is designed for **Web on Vercel**, **API/Workers + DB/Redis on Railway**. Follow the Day‑1 checklist and CI workflows.

## Environments
- Preview (PRs): UI only, no trading.
- Staging: small bankroll, canary default ON.
- Prod: guarded secrets; reviews required.

## Steps
1) Railway: create Postgres + Redis; record URLs.
2) Railway: create `api` and `worker` services; set env vars; add `api.yourdomain.com` domain.
3) Vercel: import `/apps/web`; set `NEXT_PUBLIC_API_BASE_URL`.
4) DNS: point `app.yourdomain.com` → Vercel, `api.yourdomain.com` → Railway.
5) GitHub: add tokens/secrets; enable Actions.
6) Push `staging` branch → verify end‑to‑end.
7) Merge to `main` → go live.

See `docs/CI_CD.md` for workflows and `docs/OPERATIONS.md` for runbooks.
