export type PoolState = {
  tvlUsd: number;
  ageMin: number;
  spreadBps: number;
  impactBpsAtNotional: number;
};

export async function fetchPoolState(_rpc: string, _pool: string, notionalUsd: number): Promise<PoolState> {
  // TODO: implement via Raydium SDK or reserves math
  return { tvlUsd: 100000, ageMin: 30, spreadBps: 20, impactBpsAtNotional: Math.max(20, Math.min(150, Math.floor(notionalUsd / 20000 * 100))) };
}

