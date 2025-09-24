import type { Request, Response } from 'express';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import { prisma } from '../db';

export function postExecute(redis: IORedis) {
  const executorQ = new Queue('executor', { connection: redis as any });
  return async (req: Request, res: Response) => {
    try {
      const kill = await redis.get('kill_switch');
      if (kill === '1') return res.status(423).json({ ok: false, error: 'kill_switch' });
      const { strategyId, mint, side = 'buy', size = 100 } = req.body ?? {};
      if (!mint) return res.status(400).json({ ok: false, error: 'mint required' });
      // Seed DB trade with pending to get an id
      const t = await prisma.trade.create({ data: { strategyId: String(strategyId ?? 'unknown'), mint: String(mint), side, size, quoteJson: {}, routeJson: {}, status: 'pending' } });
      await executorQ.add('execute', { tradeId: t.id, strategyId: t.strategyId, mint: t.mint, side: t.side, size: t.size }, { removeOnComplete: 100, removeOnFail: 100 });
      res.json({ ok: true, trade: t });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err?.message });
    }
  };
}

export function getKillStatus(redis: IORedis) {
  return async (_req: Request, res: Response) => {
    const kill = await redis.get('kill_switch');
    res.json({ ok: true, kill: kill === '1' });
  };
}

// Stub quotes proxy
export async function getJupiterQuote(_req: Request, res: Response) {
  // TODO: Proxy to Jupiter v6 with caching
  res.json({ ok: true, quote: { price: 1.0, outAmount: 0.0 } });
}
