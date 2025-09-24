import type { Request, Response } from 'express';

// Temporary stub: returns simple synthetic OHLC for quick UI wiring.
export function ohlcRoute(req: Request, res: Response) {
  const { mint } = req.params;
  const { tf = '1m', points = '60' } = req.query as Record<string, string>;
  const n = Math.min(Math.max(parseInt(points, 10) || 60, 5), 500);
  const now = Date.now();
  const bucketMs = tf === '1m' ? 60_000 : 60_000; // extend later
  let price = 1 + Math.random() * 0.1;
  const series = Array.from({ length: n }, (_, i) => {
    const t = now - (n - i) * bucketMs;
    const o = price;
    const c = o * (1 + (Math.random() - 0.5) * 0.01);
    const h = Math.max(o, c) * (1 + Math.random() * 0.005);
    const l = Math.min(o, c) * (1 - Math.random() * 0.005);
    price = c;
    return { t, o, h, l, c };
  });
  res.json({ mint, tf, points: n, series });
}

