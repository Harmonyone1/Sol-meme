# Hard Risk Filters (Must Pass to Trade)

Reject if any of the following:
- **Freeze authority** set (non-null).
- **Clawback / permanent delegate** present.
- **Transfer fee** extension present.
- **Mint authority** not renounced (non-null).
- **Pool age** < 10 minutes (quarantine window).
- **Liquidity** < $75k TVL (configurable).
- **Price impact** > 1.5% at base notional.
- **No Jupiter route** or **unreasonable slippage** at size.

Circuit breakers (global):
- Pause if P95 **slippage** > 40 bps over 15m.
- Pause if P95 **landing slots** > 20 over 15m.
- Daily loss cap e.g., −3%.
