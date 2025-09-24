import type { Request, Response } from 'express';
import IORedis from 'ioredis';

function makeKey(q: Record<string, string>) {
  const parts = Object.keys(q).sort().map(k => `${k}=${q[k]}`);
  return `jupq:${parts.join('&')}`;
}

export function jupiterQuoteProxy(redis: IORedis) {
  return async (req: Request, res: Response) => {
    try {
      const jupBase = process.env.JUPITER_API_BASE || 'https://quote-api.jup.ag';
      const params: Record<string, string> = {
        inputMint: String(req.query.inputMint || ''),
        outputMint: String(req.query.outputMint || ''),
        amount: String(req.query.amount || ''),
        slippageBps: String(req.query.slippageBps || '50'),
        swapMode: String(req.query.swapMode || 'ExactIn')
      };
      if (!params.inputMint || !params.outputMint || !params.amount) return res.status(400).json({ ok: false, error: 'missing params' });
      const key = makeKey(params);
      const cached = await redis.get(key);
      if (cached) return res.json(JSON.parse(cached));

      const u = new URL('/v6/quote', jupBase);
      Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
      const r = await fetch(u.toString(), { headers: { 'accept': 'application/json' } });
      if (!r.ok) return res.status(502).json({ ok: false, error: 'upstream' });
      const data = await r.json();
      const payload = { ok: true, data };
      // short TTL cache
      await redis.setex(key, 3, JSON.stringify(payload));
      res.json(payload);
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  };
}

