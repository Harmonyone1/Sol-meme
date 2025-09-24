# Execution (Jupiter → Priority Fees → Jito)

1) **Quote** via Jupiter v6: inputMint (WSOL/USDC) → outputMint, with slippageBps.
2) **Build** swap tx via `/v6/swap` with `dynamicComputeUnitLimit: true`.
3) **Add** `ComputeBudgetProgram.setComputeUnitPrice` (priority fee); clamp to env cap.
4) **Send**:
   - Default: `sendRawTransaction` (skip preflight, retries).
   - **Optional**: Jito Low‑Latency Send or **bundles** for atomic multi‑leg.
5) **Confirm** and **post‑trade checks**; persist realized price/slip/fees/latency.
