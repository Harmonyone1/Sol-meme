import type { MintInfo } from './enrichment/mint';
import type { PoolState } from './enrichment/pool';

export type RiskConfig = {
  poolAgeMinMin: number;
  tvlUsdMin: number;
  priceImpactBpsMax: number;
  requireRenouncedMint?: boolean;
};

export function applyRiskFilters(m: MintInfo, p: PoolState, cfg: RiskConfig) {
  if (m.freezeAuthority) return { pass: false, reason: 'freeze_authority' } as const;
  if (m.clawback) return { pass: false, reason: 'clawback' } as const;
  if (m.transferFee) return { pass: false, reason: 'transfer_fee' } as const;
  if (cfg.requireRenouncedMint && !m.mintAuthorityRenounced) return { pass: false, reason: 'mint_authority' } as const;
  if (p.ageMin < cfg.poolAgeMinMin) return { pass: false, reason: 'pool_age' } as const;
  if (p.tvlUsd < cfg.tvlUsdMin) return { pass: false, reason: 'tvl' } as const;
  if (p.impactBpsAtNotional > cfg.priceImpactBpsMax) return { pass: false, reason: 'impact' } as const;
  return { pass: true } as const;
}

