export type Features = {
  tvlUsd: number;
  uniques10m: number;
  volume10m: number;
  momentumZ: number;
  holderConcentration: number; // 0..1 (Top concentration)
};

export type Weights = {
  liquidity: number;
  uniques10m: number;
  volume10m: number;
  momentumZ: number;
  holderConcentration: number;
};

export function score(features: Features, w: Weights) {
  const liquidityScore = clamp01(features.tvlUsd / 150000);
  const uniquesScore = clamp01(features.uniques10m / 200);
  const volumeScore = clamp01(features.volume10m / 200000);
  const momentumScore = clamp01((features.momentumZ + 3) / 6);
  const concentrationScore = 1 - clamp01(features.holderConcentration);
  const composite = liquidityScore * w.liquidity + uniquesScore * w.uniques10m + volumeScore * w.volume10m + momentumScore * w.momentumZ + concentrationScore * w.holderConcentration;
  return Math.round(composite * 1000) / 10; // 0..100
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

